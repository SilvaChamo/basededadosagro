import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dns from "dns";
import net from "net";
import fs from "fs";
import path from "path";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { canAccessAdminArea } from "@/lib/roles";

// Corre no servidor Node (Hetzner/PM2), não em serverless — mesmo assim
// mantemos cada chamada limitada por um deadline interno para não bater no
// timeout do proxy. O cliente (painel da galeria) itera em lotes.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUCKET = "public-assets";
const SOFT_DEADLINE_MS = 45_000;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 15 * 1024 * 1024;

// Fonte -> tabela + pasta destino no bucket. `select('*')` + varredura de
// todos os campos-string: não dependemos de saber os nomes exactos das
// colunas de imagem de cada tabela (evita erros "coluna não existe").
const SOURCES: Record<string, { table: string; folder: string; scope: string }> = {
    noticias: { table: "articles", folder: "noticias/arquivo", scope: "noticias" },
    empresas: { table: "companies", folder: "empresas/arquivo", scope: "empresas" },
    produtos: { table: "products", folder: "produtos/arquivo", scope: "produtos" },
    propriedades: { table: "properties", folder: "propriedades/arquivo", scope: "propriedades" },
    profissionais: { table: "professionals", folder: "profissionais/arquivo", scope: "profissionais" },
    apresentacoes: { table: "presentations", folder: "apresentacoes/arquivo", scope: "apresentacoes" },
    podcasts: { table: "podcasts", folder: "podcasts/arquivo", scope: "podcasts" },
    formacoes: { table: "trainings", folder: "formacoes/arquivo", scope: "formacoes" },
};


const IMG_EXT_RE = /\.(jpe?g|png|gif|webp|avif|bmp|svg|tiff?)(\?|#|$)/i;
const IMG_NAME_RE = /(image|img|logo|banner|cover|photo|picture|thumb|avatar|media|featured|foto|imagem)/i;

const isHttpUrl = (s: string) => /^https?:\/\//i.test(s);
const inBucket = (s: string) => s.includes(`/storage/v1/object/public/${BUCKET}/`);
const looksLikeImageUrl = (field: string, value: string) =>
    isHttpUrl(value) && !inBucket(value) && (IMG_EXT_RE.test(value) || IMG_NAME_RE.test(field));

function extractImgSrcs(html: string): string[] {
    const out: string[] = [];
    const re = /<img[^>]+src=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) out.push(m[1]);
    return out;
}

interface Candidate { field: string; url: string; }

function collectCandidates(row: Record<string, any>): { candidates: Candidate[]; alreadyInBucket: number } {
    const found: Candidate[] = [];
    let alreadyInBucket = 0;
    for (const [field, v] of Object.entries(row)) {
        if (typeof v === "string") {
            if (isHttpUrl(v) && inBucket(v) && IMG_EXT_RE.test(v)) alreadyInBucket++;
            if (looksLikeImageUrl(field, v)) found.push({ field, url: v.trim() });
            if (v.includes("<img")) {
                for (const src of extractImgSrcs(v)) {
                    if (isHttpUrl(src) && inBucket(src)) alreadyInBucket++;
                    else if (isHttpUrl(src)) found.push({ field, url: src.trim() });
                }
            }
        } else if (Array.isArray(v)) {
            for (const item of v) {
                if (typeof item === "string" && isHttpUrl(item)) {
                    if (inBucket(item)) alreadyInBucket++;
                    else if (looksLikeImageUrl(field, item)) found.push({ field, url: item.trim() });
                }
            }
        }
    }
    const seen = new Set<string>();
    return { candidates: found.filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true))), alreadyInBucket };
}

function extFromUrl(u: string): string {
    const m = u.match(IMG_EXT_RE);
    return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "";
}
function extFromContentType(ct: string | null): string {
    const map: Record<string, string> = {
        "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/gif": "gif",
        "image/webp": "webp", "image/avif": "avif", "image/svg+xml": "svg", "image/bmp": "bmp", "image/tiff": "tiff",
    };
    return map[(ct || "").split(";")[0].trim().toLowerCase()] || "jpg";
}

// --- Protecção SSRF -------------------------------------------------------
// Os URLs vêm da base de dados (og:image do robô, colados por editores) —
// são semi-confiáveis. Antes de os ir buscar, resolvemos o host e recusamos
// qualquer endereço loopback / privado / link-local / ULA / reservado, e
// seguimos os redirects à mão validando cada salto. (Resta a janela TOCTOU
// entre resolução e ligação — aceitável para uma ferramenta de migração
// pontual, disparada por admin.)
function ipToLong(ip: string): number {
    return ip.split(".").reduce((acc, o) => (acc * 256 + (parseInt(o, 10) & 255)), 0) >>> 0;
}
function inV4Cidr(ip: string, cidr: string): boolean {
    const [range, bitsStr] = cidr.split("/");
    const bits = parseInt(bitsStr, 10);
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (ipToLong(ip) & mask) === (ipToLong(range) & mask);
}
const BLOCKED_V4 = [
    "0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16",
    "172.16.0.0/12", "192.0.0.0/24", "192.0.2.0/24", "192.168.0.0/16",
    "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4",
    "240.0.0.0/4", "255.255.255.255/32",
];
function isBlockedIp(ip: string): boolean {
    if (net.isIPv4(ip)) return BLOCKED_V4.some((c) => inV4Cidr(ip, c));
    if (net.isIPv6(ip)) {
        const lower = ip.toLowerCase();
        const mapped = lower.match(/(?:^|:)((?:\d{1,3}\.){3}\d{1,3})$/);
        if (mapped) return isBlockedIp(mapped[1]);
        if (lower === "::" || lower === "::1") return true;
        if (/^fe[89ab]/.test(lower)) return true;   // fe80::/10 link-local
        if (/^f[cd]/.test(lower)) return true;       // fc00::/7 ULA
        if (lower.startsWith("ff")) return true;     // multicast
        if (lower.startsWith("2001:db8")) return true;
        if (lower.startsWith("64:ff9b:")) return true;
        return false;
    }
    return true; // formato desconhecido -> bloquear
}

async function assertFetchable(urlStr: string): Promise<void> {
    let u: URL;
    try { u = new URL(urlStr); } catch { throw new Error("URL inválido"); }
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("esquema não permitido");
    if (u.username || u.password) throw new Error("URL com credenciais");
    if (u.port && u.port !== "80" && u.port !== "443") throw new Error("porta não permitida");
    const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
        throw new Error("host interno");
    }
    if (net.isIP(host)) {
        if (isBlockedIp(host)) throw new Error("IP privado/reservado");
        return;
    }
    const addrs = await dns.promises.lookup(host, { all: true });
    if (addrs.length === 0) throw new Error("host não resolve");
    for (const a of addrs) {
        if (isBlockedIp(a.address)) throw new Error("resolve para IP privado/reservado");
    }
}

function looksLikeImage(buf: Buffer, contentType: string | null): boolean {
    if (contentType && /^image\//i.test(contentType.split(";")[0].trim())) return true;
    if (buf.length < 12) return false;
    const b = buf;
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true; // JPEG
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true; // PNG
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return true; // GIF
    if (b[0] === 0x42 && b[1] === 0x4d) return true; // BMP
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true; // WEBP
    if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return true; // AVIF/HEIF (ftyp)
    const head = b.subarray(0, 256).toString("utf8").trimStart().toLowerCase();
    if (head.startsWith("<?xml") || head.startsWith("<svg")) return true; // SVG
    return false;
}

async function safeFetchImage(startUrl: string, ms: number): Promise<Response> {
    let current = startUrl;
    for (let hop = 0; hop < 4; hop++) {
        await assertFetchable(current);
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        let resp: Response;
        try {
            resp = await fetch(current, {
                signal: ctrl.signal,
                redirect: "manual",
                headers: {
                    "user-agent": "Mozilla/5.0 (compatible; BaseAgroDataBot/1.0; +https://basededadosagro.com)",
                    accept: "image/avif,image/webp,image/*,*/*;q=0.8",
                },
            });
        } finally {
            clearTimeout(t);
        }
        if (resp.status >= 300 && resp.status < 400) {
            const loc = resp.headers.get("location");
            if (!loc) throw new Error(`redirect ${resp.status} sem Location`);
            current = new URL(loc, current).toString();
            continue;
        }
        return resp;
    }
    throw new Error("demasiados redirects");
}

// Aplica a substituição old->new em todos os campos-string / arrays do patch
// (acumulando sobre substituições anteriores no mesmo registo).
function stageRewrite(patch: Record<string, any>, row: Record<string, any>, oldUrl: string, newUrl: string) {
    for (const [field, v] of Object.entries(row)) {
        if (typeof v === "string" && v.includes(oldUrl)) {
            const base = typeof patch[field] === "string" ? patch[field] : v;
            patch[field] = base.split(oldUrl).join(newUrl);
        } else if (Array.isArray(v) && v.some((x) => x === oldUrl)) {
            const base = Array.isArray(patch[field]) ? patch[field] : v;
            patch[field] = base.map((x: any) => (x === oldUrl ? newUrl : x));
        }
    }
}

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!canAccessAdminArea(profile?.role)) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { error: null };
}

// --- Fonte "site": imagens da própria pasta do projecto (public/ e _IMG/) ---
// São os ficheiros usados para construir o site (fundos, logos, mockups...).
// Copiamos para o bucket public-assets/site/… mantendo o caminho legível.
// NÃO reescrevemos nada — o site continua a usar /caminho/local; isto serve
// só para os teres visíveis e editáveis na galeria.
const SITE_DIRS = ["public", "_IMG"];
const SITE_IMG_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;

function walkImages(dir: string, base: string, out: { abs: string; rel: string }[]) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
        if (e.name.startsWith(".")) continue;
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walkImages(abs, base, out);
        else if (e.isFile() && SITE_IMG_EXT.test(e.name)) {
            out.push({ abs, rel: path.relative(base, abs) });
        }
    }
}

async function handleSiteImport(offset: number, limit: number, dryRun: boolean) {
    const root = process.cwd();
    const files: { abs: string; rel: string }[] = [];
    for (const d of SITE_DIRS) walkImages(path.join(root, d), root, files);
    files.sort((a, b) => a.rel.localeCompare(b.rel));

    const admin = createAdminClient();
    const deadline = Date.now() + SOFT_DEADLINE_MS;
    const slice = files.slice(offset, offset + limit);

    let uploaded = 0, failed = 0, processed = 0;
    const failures: any[] = [];
    const rewrites: any[] = [];

    for (const f of slice) {
        if (Date.now() > deadline) break;
        processed++;
        const destPath = `site/${f.rel.split(path.sep).join("/")}`;
        if (dryRun) {
            rewrites.push({ id: f.rel, field: "ficheiro", old: f.rel, new: `(copiado para ${destPath})` });
            uploaded++;
            continue;
        }
        try {
            const buf = fs.readFileSync(f.abs);
            if (buf.length === 0) throw new Error("ficheiro vazio");
            if (buf.length > MAX_BYTES) throw new Error("demasiado grande");
            const ext = (f.rel.match(SITE_IMG_EXT)?.[1] || "png").toLowerCase();
            const mime = ext === "svg" ? "image/svg+xml" : ext === "jpg" ? "image/jpeg" : `image/${ext}`;
            const { error: upErr } = await admin.storage.from(BUCKET).upload(destPath, buf, {
                contentType: mime, cacheControl: "31536000", upsert: true,
            });
            if (upErr) throw new Error(`upload: ${upErr.message}`);
            const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(destPath);
            await admin.from("media_library").upsert(
                { bucket: BUCKET, path: destPath, url: pub.publicUrl, filename: path.basename(destPath), scope: "site" },
                { onConflict: "bucket,path", ignoreDuplicates: true },
            );
            uploaded++;
        } catch (e: any) {
            failed++;
            failures.push({ id: f.rel, reason: e?.message || String(e) });
        }
    }

    const done = offset + processed >= files.length;
    return NextResponse.json({
        source: "site", offset, rows: processed, uploaded, alreadyInBucket: 0, failed,
        failures, rewrites, rewrittenRows: 0, done, nextOffset: offset + processed, dryRun,
        total: files.length,
    });
}

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const source: string = body.source;
    const offset: number = Math.max(0, Number(body.offset) || 0);
    const dryRun: boolean = !!body.dryRun;

    if (source === "site") {
        const siteLimit = Math.min(40, Math.max(1, Number(body.limit) || 20));
        return handleSiteImport(offset, siteLimit, dryRun);
    }

    const limit: number = Math.min(25, Math.max(1, Number(body.limit) || 8));
    const cfg = SOURCES[source];
    if (!cfg) return NextResponse.json({ error: "Fonte inválida." }, { status: 400 });

    const admin = createAdminClient();
    const deadline = Date.now() + SOFT_DEADLINE_MS;

    const { data: rows, error } = await admin
        .from(cfg.table)
        .select("*")
        .order("id", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        // Tabela inexistente nesta base, etc. — não é fatal para as outras fontes.
        return NextResponse.json({
            source, offset, rows: 0, uploaded: 0, alreadyInBucket: 0, failed: 0,
            failures: [{ reason: `${cfg.table}: ${error.message}` }], rewrites: [], rewrittenRows: 0,
            done: true, nextOffset: offset, skipped: true, dryRun,
        });
    }

    let uploaded = 0, alreadyInBucket = 0, failed = 0, rewrittenRows = 0, processedRows = 0;
    const failures: any[] = [];
    const rewrites: any[] = [];

    for (const row of rows || []) {
        if (Date.now() > deadline) {
            return NextResponse.json({
                source, offset, rows: processedRows, uploaded, alreadyInBucket, failed,
                failures, rewrites, rewrittenRows, done: false,
                nextOffset: offset + processedRows, partial: true, dryRun,
            });
        }
        processedRows++;

        const { candidates, alreadyInBucket: rowAlready } = collectCandidates(row);
        alreadyInBucket += rowAlready;
        if (candidates.length === 0) continue;

        const patch: Record<string, any> = {};

        for (const c of candidates) {
            try {
                const hash = crypto.createHash("sha256").update(c.url).digest("hex").slice(0, 40);

                if (dryRun) {
                    // Não descarrega nada; só valida o alvo para avisar no relatório.
                    await assertFetchable(c.url);
                    rewrites.push({ id: row.id, field: c.field, old: c.url, new: "(seria descarregada e arquivada)" });
                    uploaded++;
                    continue;
                }

                const resp = await safeFetchImage(c.url, FETCH_TIMEOUT_MS);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const ab = await resp.arrayBuffer();
                const buf = Buffer.from(ab);
                if (buf.length === 0) throw new Error("ficheiro vazio");
                if (buf.length > MAX_BYTES) throw new Error("imagem demasiado grande");

                const ct = resp.headers.get("content-type");
                if (!looksLikeImage(buf, ct)) throw new Error("resposta não é uma imagem");
                const ext = extFromUrl(c.url) || extFromContentType(ct);
                const dest = `${cfg.folder}/${hash}.${ext}`;

                const { error: upErr } = await admin.storage.from(BUCKET).upload(dest, buf, {
                    contentType: ct || `image/${ext}`,
                    cacheControl: "31536000",
                    upsert: true,
                });
                if (upErr) throw new Error(`upload: ${upErr.message}`);

                const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(dest);
                const newUrl = pub.publicUrl;

                await admin.from("media_library").upsert(
                    { bucket: BUCKET, path: dest, url: newUrl, filename: `${hash}.${ext}`, scope: cfg.scope },
                    { onConflict: "bucket,path", ignoreDuplicates: true },
                );

                stageRewrite(patch, row, c.url, newUrl);
                rewrites.push({ id: row.id, field: c.field, old: c.url, new: newUrl });
                uploaded++;
            } catch (e: any) {
                failed++;
                failures.push({ id: row.id, field: c.field, url: c.url, reason: e?.message || String(e) });
            }
        }

        if (!dryRun && Object.keys(patch).length > 0) {
            const { error: updErr } = await admin.from(cfg.table).update(patch).eq("id", row.id);
            if (updErr) failures.push({ id: row.id, reason: `update ${cfg.table}: ${updErr.message}` });
            else rewrittenRows++;
        }
    }

    const done = (rows?.length || 0) < limit;
    return NextResponse.json({
        source, offset, rows: rows?.length || 0, uploaded, alreadyInBucket, failed,
        failures, rewrites, rewrittenRows, done, nextOffset: offset + (rows?.length || 0), dryRun,
    });
}
