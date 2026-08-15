"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

interface NotificationPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NotificationPaymentModal({ isOpen, onClose, onSuccess }: NotificationPaymentModalProps) {
    const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        // Simular processamento Mpesa
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-none bg-white p-0 overflow-hidden rounded-2xl">
                <div className="h-2 bg-emerald-500 w-full" />

                <div className="p-8">
                    {step === 'input' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8 text-emerald-600" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-slate-900 text-center">Activar Alertas SMS</DialogTitle>
                                    <DialogDescription className="text-center text-slate-500 mt-2">
                                        Seu plano não inclui alertas SMS automáticos. Activa agora por apenas <span className="font-bold text-slate-900">50 MT / mês</span>.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        placeholder="Número Mpesa (84/85)"
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-bold"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <Button
                                    className="w-full h-12 bg-[#e61c23] hover:bg-[#c4151a] text-white font-black uppercase tracking-widest"
                                    onClick={() => setStep('confirm')}
                                    disabled={!phone || phone.length < 9}
                                >
                                    Pagar com M-Pesa
                                </Button>
                            </div>
                        </div>
                    )}

                    

                    {step === 'success' && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Activo com Sucesso!</h3>
                            <p className="text-slate-500">Alertas SMS activados para a sua conta.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
