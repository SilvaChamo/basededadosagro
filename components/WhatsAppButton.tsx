"use client";

import React, { useState } from "react";
import { MessageCircle, Radio, X } from "lucide-react";

export function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 mb-3 w-72 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                WA
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs leading-tight">Canal & Suporte WhatsApp</h4>
                                <p className="text-[10px] text-emerald-600 font-bold">Base de Dados Agro</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <a
                            href="https://whatsapp.com/channel/0029VaOfficialBDAgro"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 transition-all text-slate-800 group"
                        >
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Radio className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950">Aderir ao Canal Oficial</p>
                                <p className="text-[10px] text-emerald-700 font-medium">Receba editais e cotações</p>
                            </div>
                        </a>

                        <a
                            href="https://wa.me/258877575288?text=Ol%C3%A1%2C%20gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Base%20de%20Dados%20Agro."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-slate-800 group"
                        >
                            <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Falar com Assistente</p>
                                <p className="text-[10px] text-slate-500 font-medium">Atendimento directo</p>
                            </div>
                        </a>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center group"
                aria-label="Opções do WhatsApp"
            >
                <MessageCircle className="w-6 h-6 fill-current" />
            </button>
        </div>
    );
}
