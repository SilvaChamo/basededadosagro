"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Spinner } from "@/components/ui/spinner";

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("A palavra-passe deve ter pelo menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As palavras-passe não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setPassword("");
                setConfirmPassword("");
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Erro ao atualizar a palavra-passe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-emerald-950 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
                            <ShieldCheck className="w-5 h-5 text-[#f97316]" />
                            Alterar Senha
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs font-medium mt-1">
                            Introduza uma nova palavra-passe segura para a sua conta.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {success ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Sucesso!</h3>
                        <p className="text-xs text-slate-500">Sua palavra-passe foi actualizada com sucesso.</p>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="p-6 space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-xs font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nova Palavra-passe</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 rounded-lg border-slate-200 focus:ring-emerald-500 text-sm font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Confirmar Palavra-passe</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 rounded-lg border-slate-200 focus:ring-emerald-500 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1 font-bold text-[9px] uppercase tracking-widest text-slate-500 h-10"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-slate-900 hover:bg-[#f97316] text-white font-black uppercase text-[9px] tracking-widest h-10 rounded-lg transition-all shadow-lg"
                            >
                                {"Actualizar Senha"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
