"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Lock,
    User,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Spinner } from "@/components/ui/spinner";

function RegistroContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const planName = searchParams.get("plan") || "Gratuito";
    const price = searchParams.get("price") || "Gratuito";
    const period = searchParams.get("period") || "";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);

    // Account registration fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    // Anti-spam states
    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

    // Redirect if user is already logged in
    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Redirect user to payment page if already logged in
                const params = new URLSearchParams(searchParams);
                router.push(`/checkout/pagamento?${params.toString()}`);
            }
        };
        checkUser();
    }, [supabase, router, searchParams]);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        // Anti-spam checks
        if (honeypot) {
            console.warn("Spam detected: honeypot filled");
            setError("Erro ao processar o registo. Tente novamente.");
            return;
        }

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 5000) {
            console.warn("Spam detected: submitted too quickly", timeTaken);
            setError("Por favor, preencha o formulário com mais cuidado.");
            return;
        }

        setLoading(true);
        setError("");

        // Validate fields
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }

        // SMS plans require phone
        const smsPlans = ['Premium', 'Business Vendedor', 'Parceiro'];
        if (smsPlans.includes(planName) && !phone.trim()) {
            setError("O plano escolhido inclui alertas por SMS. Por favor, insira o seu número de telefone.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setLoading(false);
            return;
        }

        try {
            // Criar conta já confirmada via rota admin — não depende do email de confirmação
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    plan: planName,
                    smsNotifications: smsPlans.includes(planName),
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
                password: password
            });
            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            const isFree = planName.toLowerCase() === 'free' ||
                planName.toLowerCase() === 'gratuito' ||
                planName.toLowerCase() === 'visitante' ||
                price.toLowerCase() === 'gratuito' ||
                price.toLowerCase() === 'free' ||
                price === '0 MT' ||
                price === '0' ||
                parseInt(price.replace(/[^0-9]/g, '')) === 0;

            if (isFree) {
                router.push('/');
            } else {
                router.push(`/checkout/pagamento?plan=${encodeURIComponent(planName)}&price=${encodeURIComponent(price)}&period=${encodeURIComponent(period)}&email=${encodeURIComponent(email)}`);
            }

        } catch (err) {
            setError("Ocorreu um erro. Por favor, tente novamente.");
            setLoading(false);
        }
    };

    // Show email confirmation pending screen
    if (emailConfirmationPending) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-3">Verifique o Seu Email</h1>
                <p className="text-slate-600 mb-6 text-lg">
                    Enviámos um email de confirmação para <span className="font-bold text-emerald-600">{email}</span>.
                </p>
                <p className="text-slate-500 mb-8">
                    Clique no link de confirmação no email e depois faça login para continuar com o pagamento.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => router.push(`/auth/login?next=${encodeURIComponent(`/checkout/pagamento?plan=${planName}&price=${price}&period=${period}`)}`)}
                        className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                        Ir para Login
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setEmailConfirmationPending(false)}
                        className="h-12 px-8 border-slate-300 text-slate-600 font-bold rounded-xl"
                    >
                        Usar Outro Email
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                    <span className="text-sm font-bold text-emerald-600">Criar Conta</span>
                </div>
                <div className="w-16 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">2</div>
                    <span className="text-sm font-medium text-slate-400">Pagamento</span>
                </div>
                <div className="w-16 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
                    <span className="text-sm font-medium text-slate-400">Confirmação</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Registration Form */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleCreateAccount} className="space-y-5">
                        {/* Honeypot field - hidden from users, visible to bots */}
                        <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                            <label htmlFor="website_url">Website</label>
                            <input
                                type="text"
                                id="website_url"
                                name="website_url"
                                tabIndex={-1}
                                autoComplete="off"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                            />
                        </div>
                        <div className="bg-white p-6 rounded-[15px] border border-slate-200 shadow-sm">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo *</label>
                                    <Input
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Ex: João Manuel"
                                        className="h-12 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Telefone</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            +258
                                        </div>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            type="tel"
                                            placeholder="8X XXX XXXX"
                                            className="pl-14 h-12 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Email *</label>
                                    <div className="relative">
                                        <Input
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="h-12 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium pr-10"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Password *</label>
                                    <div className="relative">
                                        <Input
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 6 caracteres"
                                            className="h-12 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <Button
                                    disabled={loading}
                                    className="w-full h-14 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner className="w-5 h-5" />
                                            Criando conta...
                                        </>
                                    ) : (
                                        <>
                                            Continuar para Pagamento
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-slate-400 text-xs">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Dados Seguros</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-emerald-600" />
                                <span>Encriptação SSL</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24">
                        <div className="bg-slate-900 rounded-[15px] p-6 text-white shadow-2xl">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                </div>
                                Resumo do Pedido
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-white/10">
                                    <span className="text-slate-400">Plano</span>
                                    <span className="font-bold text-white">{planName}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-white/10">
                                    <span className="text-slate-400">Ciclo</span>
                                    <span className="font-bold text-white">{period === "/mês" ? "Mensal" : "Anual"}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-black text-orange-500">{price}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-slate-400 text-xs mt-4">
                            Já tem conta?{" "}
                            <Link href="/auth/login" className="text-emerald-600 hover:underline font-bold">
                                Faça login aqui
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegistroPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <Link href="/planos" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Voltar aos Planos
                    </Link>
                    <Image
                        src="/Logo.png"
                        alt="Base Agro Data"
                        width={875}
                        height={491}
                        className="h-9 w-auto"
                    />
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <Lock className="w-3 h-3" />
                        Ambiente Seguro
                    </div>
                </div>
            </header>

            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner className="w-12 h-12" />
                </div>
            }>
                <RegistroContent />
            </Suspense>
        </div>
    );
}
