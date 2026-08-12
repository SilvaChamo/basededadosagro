"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CreditCard,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Info,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

function PagamentoContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const router = useRouter();

    const planName = searchParams.get("plan") || "Básico";
    const price = searchParams.get("price") || "1 000 MT";
    const period = searchParams.get("period") || "/mês";
    const userEmail = searchParams.get("email") || "";

    const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "visa">("mpesa");
    const [loading, setLoading] = useState(false);

    // Extract numeric price
    const priceNumeric = parseInt(price.replace(/[^0-9]/g, "")) || 0;
    const priceFormatted = priceNumeric.toLocaleString("pt-PT") + " MT";

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Activate Plan Logic
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 1. Update Profile Plan
                await supabase
                    .from('profiles')
                    .update({ plan: planName })
                    .eq('id', user.id);

                // 2. Update Company Plan (if exists)
                await supabase
                    .from('companies')
                    .update({ plan: planName })
                    .eq('user_id', user.id);
            }
        } catch (error) {
            console.error("Error activating plan:", error);
            // Even if activation fails safely, we might want to log it or handle it.
            // For now, we proceed to success to not block the user, 
            // but in a real app, this should be handled more robustly via webhooks.
        }

        // Redirect to success page
        router.push(`/checkout/sucesso?plan=${encodeURIComponent(planName)}`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600">Conta Criada</span>
                </div>
                <div className="w-16 h-1 bg-emerald-600 rounded-full" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                    <span className="text-sm font-bold text-orange-600">Pagamento</span>
                </div>
                <div className="w-16 h-1 bg-slate-200 rounded-full" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
                    <span className="text-sm font-medium text-slate-400">Confirmação</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Payment Form */}
                <div className="lg:col-span-7">
                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("mpesa")}
                            className={`flex flex-col items-center justify-center p-5 rounded-[15px] border-2 transition-all group cursor-pointer ${paymentMethod === "mpesa"
                                ? "border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/5"
                                : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <div className={`p-4 rounded-full mb-3 flex items-center justify-center transition-colors ${paymentMethod === "mpesa" ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-slate-200"
                                }`}>
                                <Image
                                    src="/assets/Mpesa.png"
                                    alt="M-Pesa"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <span className={`font-bold ${paymentMethod === "mpesa" ? "text-slate-900" : "text-slate-500"}`}>M-Pesa</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPaymentMethod("visa")}
                            className={`flex flex-col items-center justify-center p-5 rounded-[15px] border-2 transition-all group cursor-pointer ${paymentMethod === "visa"
                                ? "border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/5"
                                : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <div className={`p-4 rounded-full mb-3 flex items-center justify-center transition-colors ${paymentMethod === "visa" ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-slate-200"
                                }`}>
                                <Image
                                    src="/assets/Visa.webp"
                                    alt="Visa"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <span className={`font-bold ${paymentMethod === "visa" ? "text-slate-900" : "text-slate-500"}`}>Cartão Visa</span>
                        </button>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handlePayment} className="space-y-5">
                        <div className="bg-white p-6 rounded-[15px] border border-slate-200 shadow-sm">
                            {paymentMethod === "mpesa" ? (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 p-2 shadow-sm flex items-center justify-center">
                                            <Image
                                                src="/assets/Mpesa.png"
                                                alt="M-Pesa"
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">Pagamento via M-Pesa</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Número de Telefone M-Pesa</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                +258
                                            </div>
                                            <Input
                                                required
                                                type="tel"
                                                placeholder="8X XXX XXXX"
                                                className="pl-14 h-12 bg-slate-50 border-slate-200 rounded-[8px] focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-[8px] flex gap-3">
                                        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-orange-800">
                                            Receberá uma notificação no telemóvel para inserir o PIN do M-Pesa e autorizar o pagamento.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 p-2 shadow-sm flex items-center justify-center">
                                            <Image
                                                src="/assets/Visa.webp"
                                                alt="Visa"
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">Cartão de Crédito / Débito</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Nome no Cartão</label>
                                        <Input
                                            required
                                            placeholder="EX: JOÃO MANUEL"
                                            className="h-12 bg-slate-50 border-slate-200 rounded-[8px] uppercase font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Número do Cartão</label>
                                        <div className="relative">
                                            <Input
                                                required
                                                placeholder="XXXX XXXX XXXX XXXX"
                                                className="h-12 bg-slate-50 border-slate-200 rounded-[8px] font-medium"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <CreditCard className="w-5 h-5 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Validade</label>
                                            <Input
                                                required
                                                placeholder="MM / AA"
                                                className="h-12 bg-slate-50 border-slate-200 rounded-[8px] font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">CVV</label>
                                            <div className="relative">
                                                <Input
                                                    required
                                                    placeholder="123"
                                                    className="h-12 bg-slate-50 border-slate-200 rounded-[8px] font-medium"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                    <Lock className="w-4 h-4 text-slate-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <Button
                                    disabled={loading}
                                    className="w-full h-14 rounded-[10px] bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processando pagamento...
                                        </>
                                    ) : (
                                        <>
                                            Pagar {priceFormatted}
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-slate-400 text-xs">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Pagamento Seguro</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-emerald-600" />
                                <span>Dados Encriptados</span>
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
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
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
                                {userEmail && (
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <span className="text-slate-400">Email</span>
                                        <span className="font-medium text-slate-300 text-sm">{userEmail}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-black text-orange-500">{price}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PagamentoPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <Link href="/planos" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold text-sm group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </Link>
                    <Image
                        src="/Logo.svg"
                        alt="Base Agro Data"
                        width={180}
                        height={60}
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
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin"></div>
                </div>
            }>
                <PagamentoContent />
            </Suspense>
        </div>
    );
}
