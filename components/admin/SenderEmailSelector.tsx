"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

    return (
        <div className="w-full min-w-0 bg-white">
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
