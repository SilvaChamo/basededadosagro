"use client";

import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Mail, Lock, User, CheckCircle, AlertCircle, Loader2, ArrowRight, Eye, EyeOff, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthFormProps {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
    initialMode?: "login" | "register"
}

export function AuthForm(props: AuthFormProps) {
    const searchParams = props.searchParams ? React.use(props.searchParams) : {};
    const paramsMode = searchParams && 'mode' in searchParams ? searchParams.mode : undefined;
    const initialMode = props.initialMode || (paramsMode === "register" ? "register" : "login");
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(initialMode === "login");
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Math Captcha State
    const [mathChallenge, setMathChallenge] = useState({ num1: 0, num2: 0, answer: 0 });
    const [userCaptchaAnswer, setUserCaptchaAnswer] = useState("");

    // Anti-spam states
    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

    // Generate Captcha
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setMathChallenge({ num1, num2, answer: num1 + num2 });
        setUserCaptchaAnswer("");
    };

    React.useEffect(() => {
        generateCaptcha();
    }, []);

    // Phone Auth States
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState("");

    // Create Supabase client for browser
    const supabase = createClient();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "+258"
    });

    const handleGeneratePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setFormData({ ...formData, password, confirmPassword: password });
        setShowPassword(true); // Show it so they can see/copy
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        // Anti-spam checks
        if (honeypot) {
            console.warn("Spam detected: honeypot filled");
            setStatus({ type: 'error', message: "Erro ao processar. Tente novamente." });
            return;
        }

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 3000) { // 3 seconds for login might be okay, but 5 is safer. Let's use 3 for login specifically to be less annoying.
            console.warn("Spam detected: submitted too quickly", timeTaken);
            setStatus({ type: 'error', message: "Por favor, aguarde um pouco antes de submeter." });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            // PHONE AUTH HANDLER
            if (authMethod === 'phone') {
                if (!showOtpInput) {
                    // Step 1: Send OTP
                    const cleanPhone = formData.phoneNumber.replace(/\s/g, '').replace(/-/g, '');
                    const { error } = await supabase.auth.signInWithOtp({
                        phone: cleanPhone,
                    });
                    if (error) throw error;

                    setShowOtpInput(true);
                    setStatus({ type: 'success', message: `Código enviado para ${cleanPhone}` });
                } else {
                    // Step 2: Verify OTP
                    const cleanPhone = formData.phoneNumber.replace(/\s/g, '').replace(/-/g, '');
                    const { data, error } = await supabase.auth.verifyOtp({
                        phone: cleanPhone,
                        token: otpCode,
                        type: 'sms',
                    });

                    if (error) throw error;

                    if (data.session) {
                        // Check role and plan for redirect
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('role, plan')
                            .eq('id', data.session.user.id)
                            .single();

                        setLoading(false);
                        if (profile?.role === 'admin') {
                            router.push("/admin");
                        } else {
                            router.push("/usuario/dashboard");
                        }
                    }
                }
                return;
            }

            // EMAIL AUTH HANDLER
            if (isResetPassword) {
                if (parseInt(userCaptchaAnswer) !== mathChallenge.answer) {
                    generateCaptcha();
                    throw new Error("Resposta da soma incorreta. Tente novamente.");
                }
                const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                    redirectTo: `${window.location.origin}/login?mode=recovery`,
                });
                if (error) throw error;
                setStatus({ type: 'success', message: 'Link de redefinição enviado para o seu e-mail!' });
                return;
            }

            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;

                if (data.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, plan')
                        .eq('id', data.user.id)
                        .single();

                    if (profile?.role === 'admin') {
                        setLoading(false);
                        router.push("/admin");
                    } else {
                        // Check for redirect param
                        const params = new URLSearchParams(window.location.search);
                        const redirectTo = params.get('next');
                        setLoading(false);

                        // All users now go to dashboard or the requested 'next' page
                        router.push(redirectTo || "/usuario/dashboard");
                    }
                }
            } else {
                // REGISTRATION VALIDATION
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("As senhas não coincidem.");
                }

                const cleanPhone = formData.phoneNumber.replace(/\s/g, '').replace(/-/g, '');

                if (parseInt(userCaptchaAnswer) !== mathChallenge.answer) {
                    generateCaptcha();
                    throw new Error("Resposta da soma incorreta. Tente novamente.");
                }

                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                            phone: cleanPhone,
                        }
                    }
                });

                if (error) throw error;

                if (data.session && data.user) {
                    await supabase.from('profiles').update({
                        plan: 'Free',
                        phone: cleanPhone,
                        full_name: formData.fullName,
                        sms_notifications: false // Default for Free
                    }).eq('id', data.user.id);
                    // Check for redirect param
                    const params = new URLSearchParams(window.location.search);
                    const redirectTo = params.get('next');
                    setLoading(false);
                    router.push(redirectTo || "/usuario/dashboard");
                } else {
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                        email: formData.email,
                        password: formData.password,
                    });

                    if (!signInError) {
                        setLoading(false);
                        const params = new URLSearchParams(window.location.search);
                        const redirectTo = params.get('next');
                        router.push(redirectTo || "/usuario/dashboard");
                    } else {
                        setStatus({ type: 'success', message: 'Conta criada! Verifique sua caixa de entrada para confirmar o e-mail.' });
                    }
                }
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
        // Enforce name and phone for registration via social
        if (!isLogin) {
            if (!formData.fullName || formData.fullName.length < 3) {
                setStatus({ type: 'error', message: 'Por favor, insira o seu nome completo antes de continuar.' });
                return;
            }
            if (!formData.phoneNumber || formData.phoneNumber.length < 9) {
                setStatus({ type: 'error', message: 'Por favor, insira um número de telefone válido antes de continuar.' });
                return;
            }
        }

        const params = new URLSearchParams(window.location.search);
        const next = params.get('next') || '/usuario/dashboard';

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });
        if (error) setStatus({ type: 'error', message: error.message });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Top Orange Line */}
            <div className="fixed top-0 left-0 w-full h-[6px] bg-[#f97316] z-[50] shadow-[0_2px_10px_rgba(249,115,22,0.3)]" />

            {/* Bottom Orange Line */}
            <div className="fixed bottom-0 left-0 w-full h-[6px] bg-[#f97316] z-[50] shadow-[0_-2px_10px_rgba(249,115,22,0.3)]" />

            {/* Premium Soft Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Primary Soft Gradient Base */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />

                {/* Animated Orbs for "Suave" effect */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-50/40 rounded-full blur-[100px] animate-pulse [animation-delay:4s]" />

                {/* Grainy Texture for depth */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Background Image Overlay (Original) */}
                <div
                    className="absolute inset-0 z-0 opacity-[0.15] bg-center bg-cover bg-no-repeat mix-blend-multiply"
                    style={{ backgroundImage: "url('/assets/cta-gradient-bg.webp')" }}
                />
            </div>

            <div className="w-full max-w-[420px] px-4 relative z-10">
                <div className="bg-white rounded-[15px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_20px_rgba(249,115,22,0.05)] p-9 border border-slate-100 form-premium-card ring-1 ring-black/[0.05] relative overflow-hidden">
                    {/* Fundo 100% Sólido para o Logo */}

                    <div className="text-center mb-7">
                        <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105 opacity-100 !opacity-100">
                            <Image
                                src="/Logo.svg"
                                alt="Base Agro Data"
                                width={160}
                                height={64}
                                className="h-16 w-auto mx-auto object-contain opacity-100 !opacity-100"
                                priority
                            />
                        </Link>
                    </div>

                    {status && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-[13px] animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            {status.message}
                        </div>
                    )}

                    {isLogin && (
                        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => { setAuthMethod('email'); setShowOtpInput(false); setStatus(null); setCaptchaToken(null); }}
                                className={`text-[11px] font-bold uppercase tracking-wide py-2 rounded-agro-btn transition-all ${authMethod === 'email' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAuthMethod('phone'); setShowOtpInput(false); setStatus(null); setCaptchaToken(null); }}
                                className={`text-[11px] font-bold uppercase tracking-wide py-2 rounded-agro-btn transition-all ${authMethod === 'phone' ? 'bg-white text-[#f97316] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Telefone (SMS)
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">

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

                        {/* REGISTRATION FIELDS (Name & Phone) */}
                        {!isLogin && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-1.5">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                        <div className="candy-border-wrapper rounded-agro-btn">
                                            <Input
                                                type="text"
                                                required={!isLogin}
                                                placeholder="Seu Nome Completo"
                                                className="pl-11 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                        <div className="candy-border-wrapper rounded-agro-btn">
                                            <Input
                                                type="tel"
                                                required={!isLogin}
                                                placeholder="Seu Número de Telefone (+258...)"
                                                className="pl-11 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EMAIL AUTH FIELDS (Login Email OR Register) */}
                        {((isLogin && authMethod === 'email') || !isLogin) && (
                            <>

                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                    <div className="candy-border-wrapper rounded-agro-btn">
                                        <Input
                                            type="email"
                                            required
                                            placeholder="exemplo@servico.com"
                                            className="pl-11 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {!isResetPassword && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                            <div className="candy-border-wrapper rounded-agro-btn">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    placeholder="Digite sua senha"
                                                    className="pl-11 pr-24 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                                                {!isLogin && (
                                                    <button
                                                        type="button"
                                                        onClick={handleGeneratePassword}
                                                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-agro-btn transition-colors"
                                                        title="Gerar Senha"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /></svg>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {!isLogin && (
                                            <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                                <div className="candy-border-wrapper rounded-agro-btn">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        required={!isLogin}
                                                        placeholder="Sua senha novamente"
                                                        className="pl-11 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* PHONE AUTH FIELDS */}
                        {isLogin && authMethod === 'phone' && (
                            <>
                                {!showOtpInput ? (
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                        <div className="candy-border-wrapper rounded-agro-btn">
                                            <Input
                                                type="tel"
                                                required
                                                placeholder="9X XXX XXXX"
                                                className="pl-11 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                            Inclua o código do país (ex: +258 para Moçambique)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative animate-in fade-in slide-in-from-right-4">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-20" />
                                        <div className="candy-border-wrapper rounded-agro-btn">
                                            <Input
                                                type="text"
                                                required
                                                placeholder="000 000"
                                                className="pl-11 h-10 bg-white/95 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-400 rounded-agro-btn transition-all duration-300 relative z-10"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowOtpInput(false)}
                                            className="text-[10px] text-[#f97316] hover:underline mt-2 ml-1"
                                        >
                                            Alterar número de telefone
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-[#f97316] text-white font-black h-10 rounded-agro-btn shadow-lg transition-all text-[11px] uppercase tracking-wider group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    <span className="flex items-center justify-center gap-1.5">
                                        {authMethod === 'phone'
                                            ? (showOtpInput ? "Confirmar Código" : "Enviar Código")
                                            : (isResetPassword ? "Resetar" : isLogin ? "Entrar" : "Criar")
                                        }
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </Button>

                            {/* Only show Social Login on Email Tab or if configured otherwise. Typically Phone auth is standalone or merged. Keeping it here for consistency. */}
                            {!isResetPassword && authMethod === 'email' && (
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleSocialLogin('google'); }}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 h-10 w-12 rounded-agro-btn border border-slate-200 bg-white text-slate-700 font-bold text-[10px] hover:border-[#f97316] hover:bg-[#f97316]/5 transition-all shadow-sm uppercase tracking-tight"
                                        title="Entrar com Google"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={(e) => { e.preventDefault(); handleSocialLogin('facebook'); }}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 h-10 w-12 rounded-agro-btn border border-slate-200 bg-white text-slate-700 font-bold text-[10px] hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all shadow-sm uppercase tracking-tight"
                                        title="Entrar com Facebook"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* MATH CAPTCHA - Only for Register or Reset */}
                        {((!isLogin) || isResetPassword) && (
                            <div className="flex items-center gap-3 mt-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm z-20">
                                            {mathChallenge.num1} + {mathChallenge.num2} = ?
                                        </div>
                                        <Input
                                            type="number"
                                            required
                                            placeholder="Sua Resposta"
                                            className="pl-24 h-10 bg-white/90 backdrop-blur-sm focus:bg-white border-white/20 shadow-sm border-none focus-candy text-[13px] text-slate-900 placeholder:text-slate-900 placeholder:opacity-100 rounded-agro-btn transition-all duration-300 relative z-10"
                                            value={userCaptchaAnswer}
                                            onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={generateCaptcha}
                                        className="h-10 w-10 flex items-center justify-center rounded-agro-btn border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                                        title="Gerar nova soma"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLogin && authMethod === 'email' && (
                            <div className="text-center">
                                <Link href="/planos" className="text-[10px] font-bold text-[#f97316] hover:underline uppercase tracking-widest transition-all">
                                    Registar um plano
                                </Link>
                            </div>
                        )}



                        <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsResetPassword(!isResetPassword);
                                    setIsLogin(true);
                                    setStatus(null);
                                    setCaptchaToken(null);
                                    if (authMethod !== 'email') setAuthMethod('email'); // Reset supports mostly email
                                }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-[#f97316] uppercase tracking-widest transition-colors"
                            >
                                {isResetPassword ? "Voltar ao Login" : "Redefinir senha"}
                            </button>
                            {!isResetPassword && authMethod === 'email' && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsLogin(!isLogin);
                                        setStatus(null);
                                        setCaptchaToken(null);
                                    }}
                                    className="text-[10px] font-bold text-slate-400 hover:text-[#f97316] uppercase tracking-widest transition-colors ml-auto"
                                >
                                    {isLogin ? "Registe-se aqui" : "Voltar ao Login"}
                                </button>
                            )}
                        </div>
                    </form>

                </div>
            </div>
        </div >
    );
}
