"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Mail, CheckCircle, Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function UserMessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const supabaseBrowser = createClient();

            const { data: { user } } = await supabaseBrowser.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    id,
                    read,
                    created_at,
                    message:messages (
                        id,
                        subject,
                        content,
                        sender_email,
                        created_at
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMessages(data);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        setMessages(prev => prev.map(m => m.id === notificationId ? { ...m, read: true } : m));
    };

    const openMessage = (msg: any) => {
        setSelectedMessage(msg);
        if (!msg.read) {
            markAsRead(msg.id);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Minhas Mensagens</h1>
                <p className="text-sm text-slate-500">Notificações e avisos da administração.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : messages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Tudo limpo!</h3>
                    <p className="text-slate-500 text-sm">Você não tem novas mensagens.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => openMessage(item)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative overflow-hidden ${item.read
                                    ? 'bg-white border-slate-100'
                                    : 'bg-orange-50/50 border-orange-100 shadow-sm'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.read ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`font-bold truncate pr-4 ${item.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                            {item.message?.subject || "Sem Assunto"}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.message?.content?.substring(0, 150) + "..." }} />
                                </div>
                                {!item.read && (
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500 block md:static"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Message Detail Dialog */}
            {selectedMessage && (
                <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 leading-tight">
                                {selectedMessage.message?.subject}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-xs">
                                <span>De: {selectedMessage.message?.sender_email || "Administração"}</span>
                                <span>•</span>
                                <span>{new Date(selectedMessage.message?.created_at).toLocaleString()}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 prose prose-sm max-w-none prose-slate">
                            <div dangerouslySetInnerHTML={{ __html: selectedMessage.message?.content }} />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
