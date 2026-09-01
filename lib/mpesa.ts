// M-Pesa Moçambique — Vodacom IPG v1x.
//
// ATENÇÃO: NADA disto é como o M-Pesa do Quénia (Safaricom Daraja). Aqui:
//   - NÃO existe endpoint `/token`. O Bearer token é gerado LOCALMENTE,
//     encriptando a API Key com a Chave Pública (RSA, PKCS#1 v1.5) e
//     codificando em base64.
//   - NÃO há "consumer secret", passkey, timestamp nem "password". O valor
//     734-caracteres que começa por `MIIC...` é a Chave Pública RSA.
//   - Cada operação fala numa PORTA própria do mesmo host.
//
// Variáveis de ambiente (ver .env.local):
//   MPESA_ENV                     "sandbox" (por omissão) | "production"
//   MPESA_API_KEY                 API Key da app no portal M-Pesa
//   MPESA_PUBLIC_KEY             Chave Pública (base64 cru, uma linha)
//   MPESA_SERVICE_PROVIDER_CODE   Service Provider Code / shortcode
//
// Nomes antigos aceites como fallback: MPESA_CONSUMER_KEY,
// MPESA_CONSUMER_SECRET, MPESA_SHORTCODE.

import crypto from "node:crypto";

export type MpesaEnv = "sandbox" | "production";

const HOSTS: Record<MpesaEnv, string> = {
    sandbox: "https://api.sandbox.vm.co.mz",
    production: "https://api.vm.co.mz",
};

// Porta + caminho por operação no IPG v1x (iguais em sandbox e produção).
const OPERATIONS = {
    c2b: { port: 18352, path: "/ipg/v1x/c2bPayment/singleStage/" },
    queryStatus: { port: 18353, path: "/ipg/v1x/queryTransactionStatus/" },
    reversal: { port: 18354, path: "/ipg/v1x/reversal/" },
} as const;

export type MpesaOperation = keyof typeof OPERATIONS;

export function getMpesaConfig() {
    const env: MpesaEnv = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
    const apiKey = (process.env.MPESA_API_KEY || process.env.MPESA_CONSUMER_KEY || "").trim();
    const publicKey = (process.env.MPESA_PUBLIC_KEY || process.env.MPESA_CONSUMER_SECRET || "").trim();
    const serviceProviderCode = (
        process.env.MPESA_SERVICE_PROVIDER_CODE ||
        process.env.MPESA_SHORTCODE ||
        ""
    ).trim();
    return { env, apiKey, publicKey, serviceProviderCode };
}

// Só corre o caminho real do M-Pesa quando os três estão presentes. Sem
// isto, as rotas caem em modo simulado (não tocam no IPG).
export function isMpesaConfigured(): boolean {
    const { apiKey, publicKey, serviceProviderCode } = getMpesaConfig();
    return Boolean(apiKey && publicKey && serviceProviderCode);
}

export function mpesaUrl(operation: MpesaOperation, query?: Record<string, string>): string {
    const { env } = getMpesaConfig();
    const { port, path } = OPERATIONS[operation];
    const base = `${HOSTS[env]}:${port}${path}`;
    if (!query) return base;
    const qs = new URLSearchParams(query).toString();
    return qs ? `${base}?${qs}` : base;
}

// A Chave Pública vem do portal como base64 numa única linha. O Node só a
// aceita embrulhada em PEM (cabeçalho + linhas de 64 caracteres + rodapé).
export function publicKeyToPem(publicKeyBase64: string): string {
    const clean = publicKeyBase64
        .replace(/-----BEGIN [^-]+-----/g, "")
        .replace(/-----END [^-]+-----/g, "")
        .replace(/\s+/g, "");
    const body = clean.match(/.{1,64}/g)?.join("\n") ?? clean;
    return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----\n`;
}

// Bearer token = base64( RSA_PKCS1_v1.5_encrypt( apiKey, publicKey ) ).
// Determinístico o suficiente para ser gerado a cada pedido — não há
// chamada de rede nem cache de token no IPG.
export function generateMpesaToken(apiKey: string, publicKeyBase64: string): string {
    const encrypted = crypto.publicEncrypt(
        { key: publicKeyToPem(publicKeyBase64), padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(apiKey, "utf8"),
    );
    return encrypted.toString("base64");
}

export function mpesaHeaders(token: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Origin: "developer.mpesa.vm.co.mz",
    };
}

// MSISDN no formato que o IPG exige: 258 + 9 dígitos, sem "+" nem espaços.
export function normalizeMsisdn(input: string): string {
    let d = String(input).replace(/\D/g, "");
    if (d.startsWith("00")) d = d.slice(2);
    if (d.startsWith("258")) return d;
    if (d.length === 9) return `258${d}`;
    return d;
}

// input_TransactionReference / input_ThirdPartyReference — o IPG limita a
// 1..20 caracteres alfanuméricos (INS-17 se passar disso).
export function makeMpesaReference(prefix = "BDA"): string {
    const base = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}${base}${rand}`.slice(0, 20);
}

// Códigos de resposta do IPG (output_ResponseCode). INS-0 = sucesso.
// INS-9 = timeout (o cliente ainda pode confirmar → tratar como pendente).
// INS-10 = transacção duplicada (deixar o queryTransactionStatus decidir).
export const MPESA_OK = "INS-0";
export const MPESA_PENDING_CODES = new Set(["INS-9", "INS-10", "INS-16", ""]);
