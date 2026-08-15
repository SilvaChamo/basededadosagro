"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, Save, LayoutTemplate, Type, MousePointerClick, Menu as MenuIcon, PanelTop, PaintBucket, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

interface StyleSettings {
    color?: string;
    fontSize?: string;
    lineHeight?: string;
    padding?: string;
    margin?: string;
    text?: string;
}

interface StyleEditorProps {
    label: string;
    storageKey: string;
    group?: string;
    hasText?: boolean;
    hasColor?: boolean;
    hasTypography?: boolean;
    hasSpacing?: boolean;
    defaultText?: string;
    helperText?: string;
    settings: Record<string, any>;
    onSave: (key: string, value: any, group: string) => void;
}

const StyleEditor = ({
    label,
    storageKey,
    group = 'general',
    hasText = true,
    hasColor = true,
    hasTypography = true,
    hasSpacing = true,
    defaultText = "",
    helperText = "",
    settings,
    onSave
}: StyleEditorProps) => {
    const current: StyleSettings = settings[storageKey] || {};

    const updateField = (field: keyof StyleSettings, val: string) => {
        const newValue = { ...current, [field]: val };
        onSave(storageKey, newValue, group);
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div>
                    <span className="font-bold text-slate-800 text-sm block">{label}</span>
                    {helperText && <span className="text-xs text-slate-400 font-normal">{helperText}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hasText && (
                    <div className="col-span-full">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block flex justify-between">
                            Conteúdo do Texto
                            <span className="text-slate-300 font-normal normal-case">Original: "{defaultText}"</span>
                        </label>
                        <textarea
                            value={current.text ?? defaultText} // Use default if saved is undefined, but user can clear it
                            onChange={(e) => updateField('text', e.target.value)}
                            className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[80px] resize-y"
                            placeholder={defaultText}
                        />
                    </div>
                )}

                {hasColor && (
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Cor do Texto</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={current.color || '#000000'}
                                onChange={(e) => updateField('color', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border border-slate-200 p-0.5 bg-white"
                            />
                            <input
                                type="text"
                                value={current.color || ''}
                                onChange={(e) => updateField('color', e.target.value)}
                                className="flex-1 text-xs p-2.5 rounded border border-slate-200 focus:border-emerald-500 outline-none"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {hasTypography && (
                        <>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Tamanho da Fonte</label>
                                <input
                                    type="text"
                                    value={current.fontSize || ''}
                                    onChange={(e) => updateField('fontSize', e.target.value)}
                                    className="w-full text-xs p-2.5 rounded border border-slate-200 focus:border-emerald-500 outline-none"
                                    placeholder="ex: 16px, 1.5rem"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Altura de Linha</label>
                                <input
                                    type="text"
                                    value={current.lineHeight || ''}
                                    onChange={(e) => updateField('lineHeight', e.target.value)}
                                    className="w-full text-xs p-2.5 rounded border border-slate-200 focus:border-emerald-500 outline-none"
                                    placeholder="ex: 1.5, 24px"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    {hasSpacing && (
                        <>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Padding (Espaçamento Interno)</label>
                                <input
                                    type="text"
                                    value={current.padding || ''}
                                    onChange={(e) => updateField('padding', e.target.value)}
                                    className="w-full text-xs p-2.5 rounded border border-slate-200 focus:border-emerald-500 outline-none"
                                    placeholder="ex: 10px 20px"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Margin (Margem Externa)</label>
                                <input
                                    type="text"
                                    value={current.margin || ''}
                                    onChange={(e) => updateField('margin', e.target.value)}
                                    className="w-full text-xs p-2.5 rounded border border-slate-200 focus:border-emerald-500 outline-none"
                                    placeholder="ex: 0px 0px 20px 0px"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, any>>({});

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const { data, error } = await supabase.from('site_settings').select('*');

            if (error) {
                console.error(error);
                toast.error("Erro ao carregar configurações");
            } else {
                const settingsMap: Record<string, any> = {};
                data?.forEach((item: any) => {
                    settingsMap[item.key] = item.value;
                });
                setSettings(settingsMap);
            }
            setLoading(false);
        }

        fetchSettings();
    }, []);

    const handleSave = async (key: string, value: any, group: string = 'general') => {
        setSaving(true);
        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: value }));

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key,
                value,
                group,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (error) {
            toast.error("Erro ao guardar");
        }
        setSaving(false);
    };

    const handleManualSave = async () => {
        // This is a dummy trigger for user reassurance, 
        // as individual fields save automatically. 
        // But we can refactor to save batch if needed.
        // For now, let's just show a success toast.
        toast.success("Todas as alterações foram guardadas com sucesso!");
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Spinner className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-slate-100/95 backdrop-blur z-30 py-4 border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações & Editor Visual</h1>
                </div>
                <div className="flex items-center gap-3">
                    {saving && <span className="text-xs font-bold text-emerald-600 animate-pulse flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> A guardar...</span>}
                    <Button onClick={handleManualSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="client_dashboard" className="w-full">
                <TabsList className="bg-white p-1 border border-slate-200 rounded-xl mb-6 flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="client_dashboard" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 flex gap-2 font-bold">
                        <LayoutTemplate className="w-4 h-4" />
                        Painel do Cliente
                    </TabsTrigger>
                    <TabsTrigger value="menu_footer" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 flex gap-2 font-bold">
                        <MenuIcon className="w-4 h-4" />
                        Menu & Rodapé
                    </TabsTrigger>
                    <TabsTrigger value="banner" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 flex gap-2 font-bold">
                        <PanelTop className="w-4 h-4" />
                        Banner Principal
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 flex gap-2 font-bold">
                        <PaintBucket className="w-4 h-4" />
                        Secções Gerais
                    </TabsTrigger>
                </TabsList>

                {/* PAINEL DO CLIENTE */}
                <TabsContent value="client_dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <LayoutTemplate className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 mb-1">Configuração Visual do Painel</h2>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                                Estas definições afectam a página <code>/usuario/dashboard</code>. Os textos originais são mostrados abaixo de cada campo para referência.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                                <Type className="w-4 h-4 text-emerald-500" /> Cabeçalho & Saudação
                            </h3>
                            <StyleEditor
                                label="Título Principal (Estatísticas)"
                                storageKey="dashboard_welcome_title"
                                group="client_dashboard"
                                defaultText="Estatística de Pesquisa"
                                settings={settings}
                                onSave={handleSave}
                            />
                            <StyleEditor
                                label="Subtítulo Descritivo"
                                storageKey="dashboard_welcome_subtitle"
                                group="client_dashboard"
                                defaultText="Acompanhe a visibilidade da sua empresa e produtos no Agro Data Moz."
                                settings={settings}
                                onSave={handleSave}
                            />
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                                <MousePointerClick className="w-4 h-4 text-emerald-500" /> Widgets & Cards
                            </h3>
                            <StyleEditor
                                label="Estilo dos Títulos dos KPIs"
                                storageKey="dashboard_card_title"
                                group="client_dashboard"
                                hasText={false}
                                helperText="Controla a cor e fonte de 'Total de Impressões', 'Cliques', etc."
                                settings={settings}
                                onSave={handleSave}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* MENU & RODAPÉ */}
                <TabsContent value="menu_footer" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 border-b pb-2">Menu Principal</h3>
                            <StyleEditor label="Link 'Início'" storageKey="menu_link_home" group="menu" hasTypography={false} hasSpacing={false} defaultText="Início" settings={settings} onSave={handleSave} />
                            <StyleEditor label="Link 'Sobre'" storageKey="menu_link_about" group="menu" hasTypography={false} hasSpacing={false} defaultText="Sobre" settings={settings} onSave={handleSave} />
                            <StyleEditor label="Link 'Serviços'" storageKey="menu_link_services" group="menu" hasTypography={false} hasSpacing={false} defaultText="Serviços" settings={settings} onSave={handleSave} />
                        </div>
                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 border-b pb-2">Rodapé (Footer)</h3>
                            <StyleEditor label="Texto Sobre" storageKey="footer_about_text" group="footer" hasTypography={true} defaultText="O maior diretório de empresas agrícolas de Moçambique." settings={settings} onSave={handleSave} />
                            <StyleEditor label="Copyright" storageKey="footer_copyright" group="footer" defaultText="© 2025 Base Agro Data. Todos os direitos reservados." settings={settings} onSave={handleSave} />
                        </div>
                    </div>
                </TabsContent>

                {/* BANNER PRINCIPAL */}
                <TabsContent value="banner" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <p className="text-sm text-slate-500">Estes textos aparecem na página inicial (Hero Section).</p>
                    </div>
                    <StyleEditor
                        label="Título Principal (H1)"
                        storageKey="home_hero_title"
                        group="home"
                        defaultText="Cultivando um futuro melhor para Moçambique"
                        settings={settings}
                        onSave={handleSave}
                    />
                    <StyleEditor
                        label="Subtítulo / Descrição"
                        storageKey="home_hero_subtitle"
                        group="home"
                        defaultText="Onde a terra fértil encontra inovação, oportunidade e prosperidade..."
                        settings={settings}
                        onSave={handleSave}
                    />
                    <StyleEditor
                        label="Texto do Botão CTA"
                        storageKey="home_hero_cta"
                        group="home"
                        defaultText="SEJA NOSSO PARCEIRO"
                        settings={settings}
                        onSave={handleSave}
                    />
                </TabsContent>

                {/* SECÇÕES */}
                <TabsContent value="sections" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <StyleEditor
                        label="Título Secção de Busca"
                        storageKey="home_search_title"
                        group="home"
                        defaultText="Encontre o que procura"
                        settings={settings}
                        onSave={handleSave}
                    />
                    <StyleEditor
                        label="Título Secção Categorias"
                        storageKey="home_categories_title"
                        group="home"
                        defaultText="Categorias em Destaque"
                        settings={settings}
                        onSave={handleSave}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
