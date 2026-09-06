"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SenderEmailSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const DEFAULT_EMAILS = [
    "geral@basededadosagro.com",
    "admin@basededadosagro.com",
    "suporte@basededadosagro.com",
    "info@basededadosagro.com",
    "noreply@basededadosagro.com"
];

export function SenderEmailSelector({ value, onChange }: SenderEmailSelectorProps) {
    const [emails, setEmails] = useState<string[]>(DEFAULT_EMAILS);
    const [newEmail, setNewEmail] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("platform_sender_emails");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults significantly to ensure defaults always exist but priority to saved
                const merged = Array.from(new Set([...DEFAULT_EMAILS, ...parsed]));
                // eslint-disable-next-line
                setEmails(merged);
            } catch (e) {
                console.error("Failed to parse saved emails", e);
            }
        }
    }, []);

    const handleAddEmail = () => {
        if (!newEmail || !newEmail.includes("@")) {
            alert("Por favor insira um email válido");
            return;
        }

        const updated = Array.from(new Set([...emails, newEmail]));
        setEmails(updated);
        localStorage.setItem("platform_sender_emails", JSON.stringify(updated));

        onChange(newEmail); // Select the new one
        setNewEmail("");
        setIsDialogOpen(false);
    };

    const handleDeleteEmail = (emailToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = emails.filter(e => e !== emailToDelete);
        setEmails(updated);
        localStorage.setItem("platform_sender_emails", JSON.stringify(updated));

        if (value === emailToDelete) {
            onChange(updated[0] || "");
        }
    };

    return (
        <div className="w-full min-w-0 bg-white">
            {/* Cadastrar Email — FORA do campo: encostado ao topo/direita,
                sem cantos e sem padding à volta; o campo vem logo a seguir. */}
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-800 rounded-none"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Cadastrar Email
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cadastrar Novo Email de Plataforma</DialogTitle>
                            <DialogDescription>
                                Adicione um novo endereço de email para ser usado como remetente nas mensagens do sistema.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Endereço de Email</label>
                                <Input
                                    placeholder="ex: novidades@basededadosagro.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAddEmail} className="bg-emerald-600 hover:bg-emerald-700 text-white">Adicionar Email</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full min-w-0 !h-10 rounded-none border-0 shadow-none bg-white">
                    <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <SelectValue placeholder="Selecione um email de origem" className="truncate" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {emails.map((email) => (
                        <SelectItem key={email} value={email} className="group cursor-pointer">
                            <div className="flex items-center justify-between w-full min-w-[300px]">
                                <span>{email}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
