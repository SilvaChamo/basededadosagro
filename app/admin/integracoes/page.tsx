"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Facebook, Linkedin, Save, Loader2, Info, Lock } from "lucide-react";

export default function IntegracoesPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [facebookData, setFacebookData] = useState({
        page_id: "",
        access_token: "",
        is_active: false
    });
    const [linkedinData, setLinkedinData] = useState({
        person_id: "",
        access_token: "",
        is_active: false
    });

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const { data } = await supabase
                .from('integrations')
                .select('*');

            if (isMounted && data) {
                const fb = data.find((i: any) => i.provider === 'facebook');
                const li = data.find((i: any) => i.provider === 'linkedin');

                if (fb) {
                    setFacebookData({
                        page_id: fb.credentials?.page_id || "",
                        access_token: fb.credentials?.access_token || "",
                        is_active: fb.is_active
                    });
                }
                if (li) {
                    setLinkedinData({
                        person_id: li.credentials?.person_id || "",
                        access_token: li.credentials?.access_token || "",
                        is_active: li.is_active
                    });
                }
                setLoading(false);
            } else if (isMounted) {
                setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [supabase]);

    const fetchIntegrations = useCallback(async () => {
        const { data } = await supabase
            .from('integrations')
            .select('*');

        if (data) {
            const fb = data.find((i: any) => i.provider === 'facebook');
            const li = data.find((i: any) => i.provider === 'linkedin');

            if (fb) {
                setFacebookData({
                    page_id: fb.credentials?.page_id || "",
                    access_token: fb.credentials?.access_token || "",
                    is_active: fb.is_active
                });
            }
            if (li) {
                setLinkedinData({
                    person_id: li.credentials?.person_id || "",
                    access_token: li.credentials?.access_token || "",
                    is_active: li.is_active
                });
            }
        }
        setLoading(false);
    }, [supabase]);

    const handleSave = async (provider: 'facebook' | 'linkedin', data: any) => {
        setSaving(provider);
        const payload = {
            provider,
            credentials: {
                ...(provider === 'facebook' ? { page_id: data.page_id, access_token: data.access_token } : { person_id: data.person_id, access_token: data.access_token })
            },
            is_active: data.is_active,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('integrations')
            .upsert(payload, { onConflict: 'provider' });

        if (error) {
            toast.error(`Erro ao guardar integração ${provider}: ${error.message}`);
        } else {
            toast.success(`Configurações de ${provider} guardadas!`);
        }
        setSaving(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Integrações de Redes Sociais</h1>
                <p className="text-slate-500 mt-2">Configure as APIs para automatizar a publicação de notícias.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Facebook Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div className="p-6 border-b border-slate-100 bg-blue-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Facebook className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-none">Meta (Facebook)</h3>
                                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Graph API</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${facebookData.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {facebookData.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-500 ml-1">Page ID</label>
                                <Input
                                    value={facebookData.page_id}
                                    onChange={(e) => setFacebookData({ ...facebookData, page_id: e.target.value })}
                                    placeholder="Ex: 1029384756..."
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-500 ml-1">Page Access Token</label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={facebookData.access_token}
                                        onChange={(e) => setFacebookData({ ...facebookData, access_token: e.target.value })}
                                        placeholder="EAA..."
                                        className="bg-slate-50 border-slate-200 pr-10"
                                    />
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 italic">Este token deve ser de longa duração (60 dias ou permanente).</p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="fb-active"
                                    checked={facebookData.is_active}
                                    onChange={(e) => setFacebookData({ ...facebookData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="fb-active" className="text-sm font-bold text-slate-700">Activar Publicação Automática</label>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-800 leading-relaxed font-medium">
                                Para obter o ID e o Token, precisa de criar uma App em <a href="https://developers.facebook.com" target="_blank" className="underline font-bold">developers.facebook.com</a> e conceder a permissão <code>pages_manage_posts</code>.
                            </div>
                        </div>

                        <Button
                            onClick={() => handleSave('facebook', facebookData)}
                            disabled={saving === 'facebook'}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                        >
                            {saving === 'facebook' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Configurações
                        </Button>
                    </div>
                </div>

                {/* LinkedIn Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div className="p-6 border-b border-slate-100 bg-sky-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-700 rounded-lg">
                                    <Linkedin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-none">LinkedIn</h3>
                                    <span className="text-xs text-sky-700 font-bold uppercase tracking-wider">UGC API</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${linkedinData.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {linkedinData.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-500 ml-1">Person ID (URN)</label>
                                <Input
                                    value={linkedinData.person_id}
                                    onChange={(e) => setLinkedinData({ ...linkedinData, person_id: e.target.value })}
                                    placeholder="Ex: ACvAAB..."
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-500 ml-1">Access Token</label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={linkedinData.access_token}
                                        onChange={(e) => setLinkedinData({ ...linkedinData, access_token: e.target.value })}
                                        placeholder="AQW..."
                                        className="bg-slate-50 border-slate-200 pr-10"
                                    />
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="li-active"
                                    checked={linkedinData.is_active}
                                    onChange={(e) => setLinkedinData({ ...linkedinData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                                />
                                <label htmlFor="li-active" className="text-sm font-bold text-slate-700">Activar Publicação Automática</label>
                            </div>
                        </div>

                        <div className="bg-sky-50 rounded-xl p-4 flex gap-3">
                            <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                            <div className="text-xs text-sky-900 leading-relaxed font-medium">
                                Requer o produto "Share on LinkedIn" activo na sua App do LinkedIn Developer Portal.
                            </div>
                        </div>

                        <Button
                            onClick={() => handleSave('linkedin', linkedinData)}
                            disabled={saving === 'linkedin'}
                            className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold h-11"
                        >
                            {saving === 'linkedin' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Configurações
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
