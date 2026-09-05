"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CreditCard,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Info,
    Calendar,
    ChevronRight,
    Mail,
    Eye,
    EyeOff,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { normalizePlanName } from "@/lib/plan-fields";
import { compressImage } from "@/lib/utils";
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
    // novo: só confirma o plano e cobra. Se já tiver empresa, também não
    // pede o nome (mantém o que já lá está).
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasCompany, setHasCompany] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "visa">("mpesa");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [highlightCompany, setHighlightCompany] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Dados de conta (só pedidos se não houver sessão)
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    // Pagamento
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    // O pedido ao M-Pesa pode voltar "pendente" (sem recusar nem confirmar)
    // depois de até ~110s de espera — nunca se pode tratar isso como pago.
    // Este estado distingue "a enviar o pedido" de "a aguardar o PIN no
    // telemóvel", enquanto se consulta /status até haver confirmação real.
    const [waitingPin, setWaitingPin] = useState(false);
    // Comprovativo de transferência bancária — nunca se auto-confirma; fica
    // pendente até um admin aprovar em /admin/pagamentos. O botão de enviar
    // fica sempre disponível (pode reenviar), nunca passa para o ecrã de
    // sucesso sozinho — só a mudança para M-Pesa é que tira este painel.
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [submittingReceipt, setSubmittingReceipt] = useState(false);
    const [receiptSentAt, setReceiptSentAt] = useState<Date | null>(null);

    // Honeypot anti-bot — campo escondido; se vier preenchido, é robô.
    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: company } = await supabase
                    .from("companies")
                    .select("id, name")
                    .eq("user_id", user.id)
                    .maybeSingle();
                setHasCompany(!!company);
                if (company?.name) setFullName(company.name);
                if (user.email) setEmail(user.email);
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
    // Só soma o extra quando o destaque não vem incluído no plano — incluído
    // não tem custo adicional nenhum.
    const totalPriceNumeric = highlightCompany && !isHighlightIncluded ? basePriceNumeric + highlightPrice : basePriceNumeric;
    const totalPriceFormatted = totalPriceNumeric.toLocaleString("pt-PT") + " MT";
    const needsAccountFields = !user;
    const needsCompanyName = !hasCompany;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (honeypot) return; // honeypot anti-bot: preenchido => ignora silenciosamente

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 3000) {
            setError("Por favor, preencha o formulário com mais cuidado.");
            return;
        }

        if (needsAccountFields && (!fullName.trim() || !email.trim() || !password.trim())) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        if (needsAccountFields && password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (needsCompanyName && !fullName.trim()) {
            setError("Indique o nome da empresa.");
            return;
        }
        if (paymentMethod === "mpesa" && paymentPhoneNumber.trim().length < 9) {
            setError("Insira um número de M-Pesa válido.");
            return;
        }
        if (paymentMethod === "visa" && normalizePlanName(planName) !== "Gratuito" && !receiptFile) {
            setError("Anexe o comprovativo da transferência (imagem ou PDF) antes de confirmar.");
            return;
        }

        setLoading(true);
        setError("");

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
                    setLoading(false);
                    return;
                }
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });
                if (signInError) {
                    setError(signInError.message);
                    setLoading(false);
                    return;
                }
                currentUserId = payload.userId;
                // Reflecte a conta recém-criada no estado local — sem isto,
                // reenviar um comprovativo (Visa) tentava criar a conta outra
                // vez, já que needsAccountFields continuava a ler `user` como null.
                setUser({ id: currentUserId, email: email.trim() });
            }

            if (!currentUserId) {
                setError("Não foi possível identificar a conta. Tente novamente.");
                setLoading(false);
                return;
            }

            // upsert: só toca nas colunas indicadas — não apaga dados já
            // existentes da empresa (activity, endereço, descrição, etc.).
            // NUNCA o plano nem o destaque aqui — esses só entram depois de
            // o pagamento estar mesmo confirmado (grantPlan, mais abaixo);
            // gravá-los já dava a empresa como assinante pago mesmo que o
            // cliente nunca chegasse a autorizar nada no telemóvel.
            await supabase.from("companies").upsert(
                {
                    user_id: currentUserId,
                    ...(needsCompanyName ? { name: fullName.trim() } : {}),
                    ...(phone.trim() ? { contact: phone.trim() } : {}),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

            const grantPlan = () =>
                supabase.from("companies")
                    .update({ plan: planName, is_featured: highlightCompany })
                    .eq("user_id", currentUserId);

            const isFree = normalizePlanName(planName) === "Gratuito";

            if (isFree) {
                await grantPlan();
                setSuccess(true);
                setLoading(false);
                return;
            }

            if (paymentMethod === "mpesa") {
                setIsProcessingPayment(true);
                const res = await fetch("/api/payment/mpesa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phoneNumber: paymentPhoneNumber.startsWith("258") ? paymentPhoneNumber : `258${paymentPhoneNumber}`,
                        amount: String(totalPriceNumeric),
                        planName,
                    }),
                });
                const data = await res.json();
                if (!data.success) {
                    setIsProcessingPayment(false);
                    setError(data.message || data.error || "Erro ao processar o pagamento M-Pesa.");
                    setLoading(false);
                    return;
                }

                if (data.pending) {
                    if (!data.reference) {
                        setIsProcessingPayment(false);
                        setError("Não foi possível confirmar o pagamento. Tente novamente.");
                        setLoading(false);
                        return;
                    }
                    // Ainda por confirmar (o IPG demorou, ou está mesmo à
                    // espera do PIN) — consulta /status até o M-Pesa
                    // confirmar a sério; só ENTÃO é que o plano é atribuído.
                    setWaitingPin(true);
                    const MAX_ATTEMPTS = 40; // ~40 × 4s ≈ 2m40, cobre a espera do backend (110s) com folga
                    let finalStatus: string = "pending";
                    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                        await new Promise(r => setTimeout(r, 4000));
                        try {
                            const statusRes = await fetch(`/api/payment/mpesa/status?reference=${encodeURIComponent(data.reference)}`);
                            const statusData = await statusRes.json();
                            if (statusData.status === "completed" || statusData.status === "failed") {
                                finalStatus = statusData.status;
                                break;
                            }
                        } catch {
                            // falha a consultar não é falha do pagamento — tenta no próximo ciclo
                        }
                    }
                    setWaitingPin(false);
                    setIsProcessingPayment(false);
                    if (finalStatus !== "completed") {
                        setError(
                            finalStatus === "failed"
                                ? "O pagamento não foi confirmado (recusado ou cancelado no telemóvel). Tente novamente."
                                : "Ainda não recebemos a confirmação do M-Pesa. Se já autorizou no telemóvel, tente novamente para verificarmos o estado."
                        );
                        setLoading(false);
                        return;
                    }
                } else {
                    setIsProcessingPayment(false);
                }

                // Confirmado a sério (INS-0 imediato, ou /status a devolver
                // "completed") — activatePlan() já correu no servidor; isto
                // só garante o destaque, que essa função não mexe.
                await grantPlan();
                setSuccess(true);
            } else {
                // Visa/transferência — NUNCA se auto-confirma: fica pendente
                // até um admin aprovar em /admin/pagamentos (só nesse
                // momento é que activatePlan()/is_featured entram em jogo).
                // Por isso não chama grantPlan nem setSuccess aqui — a conta
                // fica criada, o comprovativo é enviado, e o botão continua
                // disponível para reenviar se for preciso.
                setSubmittingReceipt(true);
                try {
                    let toSend: Blob = receiptFile as File;
                    let filename = "comprovativo";
                    if ((receiptFile as File).type.startsWith("image/")) {
                        toSend = await compressImage(receiptFile as File, { targetSizeKb: 50, maxWidth: 1600, maxHeight: 1600 });
                        filename = "comprovativo.webp";
                    } else {
                        filename = "comprovativo.pdf";
                    }
                    const itemType = highlightCompany ? "both" : "plan";
                    const proofForm = new FormData();
                    proofForm.append("file", toSend, filename);
                    proofForm.append("amount", String(totalPriceNumeric));
                    proofForm.append("planName", planName);
                    proofForm.append("itemType", itemType);
                    const proofRes = await fetch("/api/payment/comprovativo", { method: "POST", body: proofForm });
                    const proofData = await proofRes.json();
                    if (!proofData.success) {
                        setError(proofData.error || "Erro ao enviar comprovativo.");
                        return;
                    }
                    // Reflecte a conta recém-criada no estado local, para um
                    // reenvio não tentar criar tudo outra vez.
                    setHasCompany(true);
                    setReceiptSentAt(new Date());
                    setReceiptFile(null);
                    if (receiptInputRef.current) receiptInputRef.current.value = "";
                } finally {
                    setSubmittingReceipt(false);
                }
            }
        } catch (err) {
            setError("Ocorreu um erro. Por favor, tente novamente.");
        } finally {
            setLoading(false);
            setIsProcessingPayment(false);
            setWaitingPin(false);
        }
    };

    // Redireciona automaticamente para o painel, já com o plano aplicado.
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                router.push("/usuario/dashboard");
            }, paymentMethod === "visa" ? 6000 : 4000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, router]);

    if (checkingAuth) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Spinner className="w-10 h-10" />
            </div>
        );
    }

    if (success) {
        const isFreePlan = normalizePlanName(planName) === "Gratuito";
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">
                    {isFreePlan ? "Plano Gratuito Activado!" : paymentMethod === "visa" ? "Comprovativo Enviado!" : "Pagamento Confirmado!"}
                </h1>
                <p className="text-slate-600 mb-8 max-w-md">
                    {isFreePlan
                        ? "Bem-vindo à Base de Dados Agro! Explore os recursos disponíveis no seu painel."
                        : paymentMethod === "visa"
                            ? <>Recebemos o pedido do plano <span className="font-bold text-orange-600">{planName}</span>. Assim que confirmarmos o comprovativo, o plano fica activo na sua conta.</>
                            : <>Parabéns! A sua assinatura do plano <span className="font-bold text-orange-600">{planName}</span> foi processada. Verifique o telemóvel para autorizar o M-Pesa, se ainda não o fez.</>
                    }
                </p>
                <p className="text-sm text-slate-400 mb-4">A redireccionar para o seu painel...</p>
                <Button
                    onClick={() => router.push("/usuario/dashboard")}
                    className="bg-slate-900 hover:bg-slate-800 px-8 h-12 rounded-xl font-bold"
                >
                    Ir para o Painel
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-[20px]">
            {/* ── FORM (LEFT) ── */}
            <main className="flex-1 space-y-[10px]">
                <form onSubmit={handleConfirm} className="space-y-[10px]">
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

                    {(needsAccountFields || needsCompanyName) && (
                        <div className="bg-white p-5 border border-slate-200 shadow-sm space-y-4" style={{ borderRadius: "8px" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {!needsAccountFields && (
                        <p className="text-xs text-slate-500 bg-white border border-slate-200 px-4 py-3" style={{ borderRadius: "8px" }}>
                            Sessão iniciada como <span className="font-bold text-slate-700">{user?.email}</span>. O plano é aplicado a esta conta.
                        </p>
                    )}

                    {/* Método de pagamento — só relevante para planos pagos */}
                    {normalizePlanName(planName) !== "Gratuito" && (
                        <>
                            <div className="grid grid-cols-2 gap-[10px]">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("mpesa")}
                                    className={`flex flex-col items-center justify-center p-4 border-2 transition-all group cursor-pointer ${paymentMethod === "mpesa" ? "border-orange-500 bg-orange-50/50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                                    style={{ borderRadius: "8px" }}
                                >
                                    <div className={`p-3 rounded-full mb-2 flex items-center justify-center ${paymentMethod === "mpesa" ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                                        <Image src="/assets/Mpesa.png" alt="M-Pesa" width={28} height={28} className="object-contain" />
                                    </div>
                                    <span className={`font-bold text-sm ${paymentMethod === "mpesa" ? "text-slate-900" : "text-slate-500"}`}>M-Pesa</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("visa")}
                                    className={`flex flex-col items-center justify-center p-4 border-2 transition-all group cursor-pointer ${paymentMethod === "visa" ? "border-orange-500 bg-orange-50/50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                                    style={{ borderRadius: "8px" }}
                                >
                                    <div className={`p-3 rounded-full mb-2 flex items-center justify-center ${paymentMethod === "visa" ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                                        <Image src="/assets/Visa.webp" alt="Visa" width={28} height={28} className="object-contain" />
                                    </div>
                                    <span className={`font-bold text-sm ${paymentMethod === "visa" ? "text-slate-900" : "text-slate-500"}`}>Visa / Transferência</span>
                                </button>
                            </div>

                            <div className="bg-white p-5 border border-slate-200 shadow-sm" style={{ borderRadius: "8px" }}>
                                {paymentMethod === "mpesa" ? (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Pagamento via M-Pesa</h3>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Número de Telefone</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">+258</div>
                                                <Input
                                                    required
                                                    type="tel"
                                                    value={paymentPhoneNumber}
                                                    onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                                                    placeholder="8X XXX XXXX"
                                                    className="pl-14 h-10 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-orange-50/50 border border-orange-100 p-3 flex gap-3" style={{ borderRadius: "8px" }}>
                                            <Info className="w-5 h-5 text-orange-600 grow-0 shrink-0 mt-0.5" />
                                            <p className="text-sm text-orange-800">
                                                Ao confirmar, vai receber uma notificação no telemóvel para inserir o PIN do M-Pesa e autorizar o pagamento.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Transferência Bancária (Moza Banco)</h3>
                                        <div className="text-xs text-slate-600 bg-slate-50 p-3 border border-slate-200 space-y-1 font-mono" style={{ borderRadius: "8px" }}>
                                            <div className="flex justify-between"><span className="text-slate-400">Banco:</span><span>Moza Banco</span></div>
                                            <div className="flex justify-between"><span className="text-slate-400">NIB:</span><span className="select-all">003400000544672210195</span></div>
                                            <div className="flex justify-between pt-1 border-t border-slate-200 mt-1"><span className="text-slate-400">Titular:</span><span>Visual Design</span></div>
                                        </div>
                                        <input ref={receiptInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                                            className="hidden"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith("image/") && f.type !== "application/pdf") { setError("Formato não suportado. Envie uma imagem (JPG, PNG, WebP) ou um PDF."); return; } setReceiptFile(f); setReceiptSentAt(null); setError(""); }}
                                        />
                                        <button type="button" onClick={() => receiptInputRef.current?.click()}
                                            className="w-full h-11 px-3 text-xs font-bold text-slate-600 bg-white border border-dashed border-slate-300 hover:border-orange-400 transition-colors flex items-center justify-center gap-2"
                                            style={{ borderRadius: "8px" }}>
                                            <Upload className="w-4 h-4 shrink-0 text-slate-400" />
                                            <span className="truncate">{receiptFile ? receiptFile.name : "Anexar comprovativo (imagem ou PDF)"}</span>
                                        </button>
                                        <p className="text-xs text-slate-500">Anexe o comprovativo e clique em "Enviar Comprovativo" abaixo. Fica pendente até a nossa equipa confirmar — o plano só activa depois disso.</p>
                                        {receiptSentAt && (
                                            <div className="bg-emerald-50 border border-emerald-100 p-3 flex gap-2 items-start" style={{ borderRadius: "8px" }}>
                                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <p className="text-xs text-emerald-700">Comprovativo enviado — a aguardar aprovação da equipa. Pode enviar outro abaixo se precisar.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="pt-2 flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-10 h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: "8px" }}
                        >
                            {loading ? (
                                <><Spinner className="w-4 h-4" /> {waitingPin ? "A aguardar PIN no telemóvel..." : submittingReceipt ? "A enviar comprovativo..." : isProcessingPayment ? "A processar pagamento..." : "A processar..."}</>
                            ) : normalizePlanName(planName) === "Gratuito" ? (
                                <>Activar Plano Gratuito</>
                            ) : paymentMethod === "visa" ? (
                                <>{receiptSentAt ? "Enviar Novo Comprovativo" : "Enviar Comprovativo"}</>
                            ) : (
                                <>Confirmar e Pagar {totalPriceFormatted} <ChevronRight className="w-4 h-4" /></>
                            )}
                        </Button>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pagamento Seguro
                        </div>
                    </div>
                </form>

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
                                    disabled={isHighlightIncluded}
                                    onClick={() => setHighlightCompany(!highlightCompany)}
                                    title={isHighlightIncluded ? "Incluído neste plano — não é possível desligar" : undefined}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${highlightCompany ? "bg-orange-500" : "bg-slate-600"} ${isHighlightIncluded ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${highlightCompany ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{isHighlightIncluded ? "Incluído no plano" : "Investimento extra"}</span>
                                {!isHighlightIncluded && (
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
                                <span className="text-sm font-black text-white">Total Hoje</span>
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
