"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CreditCard,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Calendar,
    ChevronRight,
    Mail,
    Eye,
    EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { normalizePlanName } from "@/lib/plan-fields";
import { PaymentItem } from "@/components/PaymentItem";
import { Spinner } from "@/components/ui/spinner";

const PLAN_FEATURES: Record<string, string[]> = {
    "Gratuito": [
        "Newsletter Semanal",
        "Recursos Gratuitos",
        "Alertas de Financiamento",
        "Cadastro Simples",
        "Suporte via E-mail",
    ],
    "Básico": [
        "Tudo do Free",
        "Alertas de Financiamento",
        "5% Desconto em Eventos",
        "10% Desconto em Serviços",
        "Destacar Empresa",
        "Cadastro de Produto",
    ],
    "Premium": [
        "Tudo do Básico",
        "Cobertura de Eventos",
        "Publicar Financiamento",
        "10% Desconto em Eventos",
        "20% Desconto em Serviços",
        "Cadastrar Vagas",
    ],
    "Business Vendedor": [
        "Produtos Ilimitados",
        "Selo de Vendedor Verificado",
        "Loja Personalizada",
        "Relatórios Avançados",
        "Destaque Premium",
        "Publicidade Mensal",
    ],
};

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();
    const planName = searchParams.get("plan") || "Básico";
    const price = searchParams.get("price") || "1 000 MT";
    const period = searchParams.get("period") || "/mês";

    // Sessão actual — se já tiver conta, o checkout não pede para a criar de
    // novo: passa logo ao pagamento. Se tiver conta mas ainda sem empresa,
    // só pede o nome da empresa. Se não tiver sessão nenhuma, pode criar
    // conta OU entrar numa já existente (ver authMode) — tudo dentro desta
    // mesma página, sem redireccionar para /auth/login.
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasCompany, setHasCompany] = useState(false);
    const [accountReady, setAccountReady] = useState(false);
    const [accountLoading, setAccountLoading] = useState(false);
    const [authMode, setAuthMode] = useState<"create" | "login">("create");

    const [highlightCompany, setHighlightCompany] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Dados de conta
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    // Plano e destaque são cobranças independentes — tal como em
    // /registo-empresa — para se poder pagar uma sem a outra, e para nunca
    // voltar a pedir pagamento por algo já activo na conta.
    const [planPaid, setPlanPaid] = useState(false);
    const [highlightPaid, setHighlightPaid] = useState(false);

    // Honeypot anti-bot — campo escondido; se vier preenchido, é robô.
    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

    const isFree = normalizePlanName(planName) === "Gratuito";

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: company } = await supabase
                    .from("companies")
                    .select("id, name, plan, is_featured")
                    .eq("user_id", user.id)
                    .maybeSingle();
                setHasCompany(!!company);
                if (company?.name) setFullName(company.name);
                if (user.email) setEmail(user.email);
                if (company?.plan && normalizePlanName(company.plan) === normalizePlanName(planName) && !isFree) {
                    setPlanPaid(true);
                }
                if (company?.is_featured) setHighlightPaid(true);
                if (company) setAccountReady(true);
            }
            setCheckingAuth(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Planos que já incluem a empresa destacada no preço — o interruptor
    // fica ligado e bloqueado (não é um extra a pagar); só no Gratuito e no
    // Básico é que continua a ser uma escolha do cliente, paga à parte.
    const isHighlightIncluded = planName === "Premium" || planName === "Business Vendedor";
    useEffect(() => {
        if (isHighlightIncluded) setHighlightCompany(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHighlightIncluded]);

    const basePriceNumeric = parseInt(price.replace(/[^0-9]/g, "")) || 0;
    const highlightPrice = period === "/mês" ? 1500 : 15000;
    const planCost = isFree ? 0 : basePriceNumeric;
    // Só tem custo próprio quando não vem incluído no plano — incluído não é
    // um extra a pagar aqui.
    const highlightCost = highlightCompany && !isHighlightIncluded ? highlightPrice : 0;
    const planDue = planCost > 0 && !planPaid;
    const highlightDue = highlightCost > 0 && !highlightPaid;
    const needsPayment = planDue || highlightDue;
    const totalPriceFormatted = (planCost + highlightCost).toLocaleString("pt-PT") + " MT";

    // Gratuito sem destaque: não há nada para cobrar — activa assim que a
    // conta/empresa estiverem prontas, sem esperar por nenhum botão de
    // pagamento (que nem chegaria a aparecer, já que o custo é zero).
    useEffect(() => {
        if (accountReady && isFree && !highlightCompany && !planPaid && user?.id) {
            (async () => {
                await supabase.from("companies").update({ plan: planName }).eq("user_id", user.id);
                setPlanPaid(true);
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountReady]);

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (honeypot) return; // honeypot anti-bot: preenchido => ignora silenciosamente

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 3000) {
            setError("Por favor, preencha o formulário com mais cuidado.");
            return;
        }
        setError("");

        if (!user && authMode === "login") {
            if (!email.trim() || !password.trim()) {
                setError("Indique o email e a password da sua conta.");
                return;
            }
            setAccountLoading(true);
            try {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
                if (signInError || !data.user) {
                    setError(signInError?.message || "Não foi possível entrar. Verifique os dados.");
                    return;
                }
                setUser(data.user);
                const { data: company } = await supabase
                    .from("companies")
                    .select("id, name, plan, is_featured")
                    .eq("user_id", data.user.id)
                    .maybeSingle();
                setHasCompany(!!company);
                if (company?.name) setFullName(company.name);
                if (company?.plan && normalizePlanName(company.plan) === normalizePlanName(planName) && !isFree) setPlanPaid(true);
                if (company?.is_featured) setHighlightPaid(true);
                if (company) {
                    setAccountReady(true);
                }
                // Sem empresa ainda: fica no mesmo ecrã, agora só a pedir o
                // nome da empresa (needsCompanyName), não login outra vez.
            } catch {
                setError("Erro de conexão.");
            } finally {
                setAccountLoading(false);
            }
            return;
        }

        // Criar conta nova, OU só falta o nome da empresa (conta já existe).
        const needsAccountFields = !user;
        if (needsAccountFields && (!fullName.trim() || !email.trim() || !password.trim())) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        if (needsAccountFields && password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (!needsAccountFields && !fullName.trim()) {
            setError("Indique o nome da empresa.");
            return;
        }

        setAccountLoading(true);
        try {
            let currentUserId = user?.id as string | undefined;

            if (needsAccountFields) {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                        fullName: fullName.trim(),
                        phone: phone.trim(),
                        plan: planName,
                    }),
                });
                const payload = await res.json();
                if (!res.ok) {
                    setError(payload.error || "Não foi possível criar a conta.");
                    return;
                }
                const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
                if (signInError) {
                    setError(signInError.message);
                    return;
                }
                currentUserId = payload.userId;
                setUser({ id: currentUserId, email: email.trim() });
            }

            if (!currentUserId) {
                setError("Não foi possível identificar a conta. Tente novamente.");
                return;
            }

            // upsert: só toca nas colunas indicadas — não apaga dados já
            // existentes da empresa (activity, endereço, descrição, etc.), e
            // nunca o plano/destaque aqui: isso só entra depois de o
            // pagamento estar mesmo confirmado (ver PaymentItem abaixo).
            await supabase.from("companies").upsert(
                {
                    user_id: currentUserId,
                    name: fullName.trim(),
                    ...(phone.trim() ? { contact: phone.trim() } : {}),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );
            setHasCompany(true);
            setAccountReady(true);
        } catch {
            setError("Erro de conexão.");
        } finally {
            setAccountLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Spinner className="w-10 h-10" />
            </div>
        );
    }

    const needsAccountFields = !user;
    const needsCompanyName = !!user && !hasCompany;

    return (
        <div className="flex flex-col lg:flex-row gap-[20px]">
            {/* ── FORM (LEFT) ── */}
            <main className="flex-1 space-y-[10px]">
                {/* honeypot anti-bot — invisível para humanos */}
                <input
                    type="text"
                    name="empresa_site_confirm"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0 pointer-events-none"
                />

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {!accountReady ? (
                    <form onSubmit={handleAccountSubmit} className="space-y-[10px]">
                        <div className="bg-white p-5 border border-slate-200 shadow-sm space-y-4" style={{ borderRadius: "8px" }}>
                            {needsAccountFields && (
                                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg w-fit">
                                    <button type="button" onClick={() => setAuthMode("create")}
                                        className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${authMode === "create" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                                        Criar Conta
                                    </button>
                                    <button type="button" onClick={() => setAuthMode("login")}
                                        className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${authMode === "login" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                                        Já Tenho Conta
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {needsAccountFields && authMode === "login" ? (
                                    <>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Email *</label>
                                            <Input
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                type="email"
                                                placeholder="seu@email.com"
                                                className="h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Password *</label>
                                            <div className="relative">
                                                <Input
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="A sua password"
                                                    className="h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium pr-10"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">
                                                {needsAccountFields ? "Nome Completo *" : "Nome da Empresa *"}
                                            </label>
                                            <Input
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Ex: João Manuel"
                                                className="h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Telefone</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">+258</div>
                                                <Input
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    type="tel"
                                                    placeholder="8X XXX XXXX"
                                                    className="pl-14 h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        {needsAccountFields && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 ml-1">Email *</label>
                                                    <div className="relative">
                                                        <Input
                                                            required
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            type="email"
                                                            placeholder="seu@email.com"
                                                            className="h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium pr-10"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <Mail className="w-4 h-4 text-slate-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 ml-1">Password *</label>
                                                    <div className="relative">
                                                        <Input
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Mínimo 6 caracteres"
                                                            className="h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium pr-10"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={accountLoading}
                                className="px-10 h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                                style={{ borderRadius: "8px" }}
                            >
                                {accountLoading ? <><Spinner className="w-4 h-4" /> A processar...</> : authMode === "login" ? <>Entrar e Continuar</> : <>Continuar <ChevronRight className="w-4 h-4" /></>}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-[10px]">
                        <p className="text-xs text-slate-500 bg-white border border-slate-200 px-4 py-3" style={{ borderRadius: "8px" }}>
                            Sessão iniciada como <span className="font-bold text-slate-700">{user?.email}</span>. O plano é aplicado a esta conta.
                        </p>

                        {needsPayment ? (
                            <PaymentItem
                                key={`${highlightDue}-${planDue}-${planName}`}
                                label={
                                    highlightDue && planDue
                                        ? `Plano ${planName} + Destaque`
                                        : highlightDue
                                            ? "Destacar Empresa"
                                            : `Plano ${planName}`
                                }
                                amount={(planDue ? planCost : 0) + (highlightDue ? highlightCost : 0)}
                                planName={planName}
                                itemType={highlightDue && planDue ? "both" : highlightDue ? "highlight" : "plan"}
                                onPaid={async () => {
                                    if (planDue) {
                                        setPlanPaid(true);
                                        // activatePlan() do M-Pesa já grava o plano no servidor;
                                        // isto só garante o destaque quando vem incluído de graça
                                        // no plano (essa função não mexe em is_featured).
                                        if (isHighlightIncluded && user?.id) {
                                            await supabase.from("companies").update({ is_featured: true }).eq("user_id", user.id);
                                            setHighlightPaid(true);
                                        }
                                    }
                                    if (highlightDue) setHighlightPaid(true);
                                }}
                            />
                        ) : (
                            <div className="p-5 bg-emerald-50 border border-emerald-100 flex items-center gap-4" style={{ borderRadius: "8px" }}>
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 text-emerald-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-emerald-900 text-sm">
                                        Plano {planName} activo{highlightCompany ? " — empresa em destaque" : ""}!
                                    </p>
                                    <p className="text-emerald-700 text-xs mt-0.5">Pode gerir tudo a partir do seu painel.</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                onClick={() => router.push("/usuario/dashboard")}
                                variant="outline"
                                className="h-11 px-6 border-slate-200 text-slate-500 hover:text-slate-800 font-bold"
                                style={{ borderRadius: "8px" }}
                            >
                                Ir para o Painel
                            </Button>
                        </div>
                    </div>
                )}

                <div className="p-5 bg-emerald-50 border border-emerald-100 flex gap-5" style={{ borderRadius: "8px" }}>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-black text-emerald-900 text-sm uppercase tracking-tight mb-1">Satisfação Garantida</h4>
                        <p className="text-emerald-700 text-xs leading-relaxed">
                            Experimente sem riscos. Garantimos satisfação nos primeiros 15 dias — a nossa plataforma é o ponto mais alto do agro-business em Moçambique.
                        </p>
                    </div>
                </div>
            </main>

            {/* ── SIDEBAR RIGHT — resumo (mesma largura do registo-empresa) ── */}
            <aside
                className="w-full lg:w-[380px] shrink-0 space-y-[10px] sticky overflow-y-auto"
                style={{ top: "20px", height: "calc(100vh - 100px)" }}
            >
                <div className="bg-slate-900 p-5 text-white shadow-sm relative overflow-hidden" style={{ borderRadius: "8px" }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 relative z-10">
                        <CreditCard className="w-4 h-4 text-orange-500" /> Resumo do Pagamento
                    </h3>

                    <div className="mt-4 space-y-[10px] relative z-10">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Plano</span>
                            <span className="text-base font-black text-white">{planName}</span>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10" style={{ borderRadius: "8px" }}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm">Destacar empresa</span>
                                    <span className="text-slate-400 text-[10px]">Aparece no topo da Home</span>
                                </div>
                                <button
                                    type="button"
                                    disabled={isHighlightIncluded || highlightPaid}
                                    onClick={() => setHighlightCompany(!highlightCompany)}
                                    title={isHighlightIncluded ? "Incluído neste plano — não é possível desligar" : highlightPaid ? "Já pago/activo" : undefined}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${highlightCompany ? "bg-orange-500" : "bg-slate-600"} ${isHighlightIncluded || highlightPaid ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${highlightCompany ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{isHighlightIncluded ? "Incluído no plano" : highlightPaid ? "Já activo" : "Investimento extra"}</span>
                                {!isHighlightIncluded && !highlightPaid && (
                                    <span className="text-orange-400 font-bold">+{highlightPrice.toLocaleString("pt-PT")} MT</span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10" style={{ borderRadius: "8px" }}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-slate-400 font-medium text-sm">Preço</span>
                                <span className="text-lg font-black text-white">{price}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
                                <span className="text-slate-400 font-medium text-sm">Ciclo</span>
                                <span className="text-white font-bold text-sm flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    {period === "/mês" ? "Mensal" : "Anual"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white">{needsPayment ? "A Pagar" : "Total"}</span>
                                <span className="text-2xl font-black text-orange-500">{totalPriceFormatted}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">O que recebe:</p>
                            <ul className="space-y-2">
                                {(PLAN_FEATURES[planName] || PLAN_FEATURES["Básico"]).map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                                        <div className="w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            {/* Cabeçalho — mesma configuração (altura, fundo, borda) do
                cabeçalho de /usuario, para ficar uniforme com o cadastro. */}
            <header className="h-16 bg-white border-b border-slate-200 shadow-sm">
                <div className="container-site h-full flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Image src="/Logo.png" alt="Base Agro Data Logo" width={875} height={491} className="h-10 w-auto object-contain" priority />
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/planos" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar aos Planos
                        </Link>
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            <Lock className="w-3 h-3" />
                            Ambiente Seguro
                        </div>
                    </div>
                </div>
            </header>

            <div className="pb-5 md:pb-8" style={{ paddingTop: '30px' }}>
                <div className="container-site">
                    <Suspense
                        fallback={
                            <div className="min-h-[60vh] flex items-center justify-center">
                                <Spinner className="w-12 h-12" />
                            </div>
                        }
                    >
                        <CheckoutContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
