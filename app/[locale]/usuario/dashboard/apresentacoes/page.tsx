"use client";

import React, { useEffect, useState } from "react";
import { Presentation, HelpCircle, Lightbulb, Play, MousePointer2, Info, Archive, Trash2, LayoutGrid, List, Plus, ArrowRight, Calendar, Search, Pencil, RefreshCw, Download, FileText, FilePieChart, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { Spinner } from "@/components/ui/spinner";


export default function UserPresentationsPage() {
    const { canPresentations, planDisplayName, loading: permissionsLoading } = usePlanPermissions();
    const router = useRouter();
    const supabase = createClient();

    // State
    const [presentations, setPresentations] = useState<any[]>([]);
    const [deletedPresentations, setDeletedPresentations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [exporting, setExporting] = useState(false);

    // UI State
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'deleted'>('active');

    // Modal State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    // Fetch Data
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load active presentations
            const { data: activeData } = await supabase
                .from('presentations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Load deleted presentations (recycle bin)
            const { data: deletedData, error: deletedError } = await supabase
                .from('deleted_presentations')
                .select('*')
                .eq('user_id', user.id)
                .order('deleted_at', { ascending: false });

            if (deletedError && deletedError.code !== 'PGRST116') {
                console.error("Error fetching deleted items:", deletedError);
            }

            if (isMounted) {
                const normalized = (activeData || []).map((item: any) => ({
                    ...item,
                    status: item.status || 'active'
                }));
                setPresentations(normalized);
                setDeletedPresentations(deletedData || []);
                setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [supabase]);

    const handleExportPDF = async (item: any) => {
        setExporting(true);
        toast.info("A gerar PDF... Por favor, aguarde.");

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1280, 720]
            });

            const slides = item.slides || [];
            if (slides.length === 0) {
                toast.error("A apresentação não tem slides para exportar.");
                setExporting(false);
                return;
            }

            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];
                if (i > 0) doc.addPage([1280, 720], 'landscape');

                doc.setFillColor(15, 23, 42);
                doc.rect(0, 0, 1280, 720, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(40);
                doc.text(slide.antetitulo || "Apresentação", 60, 100);

                doc.setFontSize(24);
                doc.setTextColor(16, 185, 129);
                doc.text(slide.title || "", 60, 140);

                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = slide.content;
                const text = tempDiv.textContent || tempDiv.innerText || "";

                doc.setTextColor(200, 200, 200);
                doc.setFontSize(16);
                const splitText = doc.splitTextToSize(text, 600);
                doc.text(splitText, 60, 200);
            }

            doc.save(`${item.title || 'apresentacao'}.pdf`);
            toast.success("PDF gerado com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao gerar PDF.");
        } finally {
            setExporting(false);
        }
    };



    // Handlers
    const handleCreatePresentation = async () => {
        setCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('presentations')
                .insert({
                    user_id: user.id,
                    title: "Nova Apresentação",
                    status: "draft",
                    slides: []
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Apresentação criada!");
            router.push(`/usuario/dashboard/apresentacoes/editor/${data.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar apresentação.");
        } finally {
            setCreating(false);
        }
    };

    const handleArchive = async (item: any) => {
        const isCurrentlyArchived = item.status === 'archived';
        const newStatus = isCurrentlyArchived ? 'active' : 'archived';

        try {
            const { error } = await supabase
                .from('presentations')
                .update({ status: newStatus })
                .eq('id', item.id);

            if (error) throw error;

            setPresentations(prev => prev.map(p =>
                p.id === item.id ? { ...p, status: newStatus } : p
            ));
            toast.success(isCurrentlyArchived ? "Apresentação restaurada" : "Apresentação arquivada");
        } catch (err: any) {
            toast.error("Erro ao arquivar/restaurar: " + err.message);
        }
    };

    const handleMoveToTrash = (item: any) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleRestoreFromTrash = async (item: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Re-insert into presentations
            const { error: insertError } = await supabase
                .from('presentations')
                .insert({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    slides: item.slides,
                    user_id: user.id, // Ensure ownership
                    created_at: item.original_created_at || item.created_at,
                    updated_at: new Date().toISOString(),
                    status: 'active'
                });

            if (insertError) throw insertError;

            // Remove from deleted_presentations
            const { error: deleteError } = await supabase
                .from('deleted_presentations')
                .delete()
                .eq('id', item.id);

            if (deleteError) throw deleteError;

            setDeletedPresentations(prev => prev.filter(p => p.id !== item.id));
            setPresentations(prev => [{ ...item, status: 'active', created_at: item.original_created_at || item.created_at }, ...prev]);
            toast.success("Apresentação restaurada!");
        } catch (err: any) {
            toast.error("Erro ao restaurar: " + err.message);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        const isInTrash = statusFilter === 'deleted';

        if (isInTrash) {
            // Permanent delete
            const { error } = await supabase
                .from('deleted_presentations')
                .delete()
                .eq('id', itemToDelete.id);

            if (error) {
                toast.error("Erro ao eliminar permanentemente: " + error.message);
            } else {
                toast.success("Eliminado permanentemente!");
                setDeletedPresentations(prev => prev.filter(p => p.id !== itemToDelete.id));
            }
        } else {
            // Move to recycle bin
            try {
                const { error: insertError } = await supabase
                    .from('deleted_presentations')
                    .insert({
                        id: itemToDelete.id,
                        title: itemToDelete.title,
                        description: itemToDelete.description,
                        slides: itemToDelete.slides,
                        user_id: itemToDelete.user_id,
                        original_created_at: itemToDelete.created_at,
                        deleted_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error("Recycle bin error, falling back to permanent delete:", insertError);
                    const { error: delError } = await supabase
                        .from('presentations')
                        .delete()
                        .eq('id', itemToDelete.id);
                    if (delError) throw delError;
                    toast.success("Apresentação eliminada permanentemente.");
                    setPresentations(prev => prev.filter(p => p.id !== itemToDelete.id));
                } else {
                    const { error: deleteError } = await supabase
                        .from('presentations')
                        .delete()
                        .eq('id', itemToDelete.id);
                    if (deleteError) throw deleteError;
                    toast.success("Enviado para a reciclagem!");
                    setPresentations(prev => prev.filter(p => p.id !== itemToDelete.id));
                    setDeletedPresentations(prev => [{ ...itemToDelete, deleted_at: new Date().toISOString() }, ...prev]);
                }
            } catch (err: any) {
                toast.error("Erro: " + err.message);
            }
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    // Filter Logic
    const getDisplayItems = () => {
        let items = statusFilter === 'deleted' ? deletedPresentations : presentations;
        items = items.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
        );
        if (statusFilter !== 'deleted') {
            items = items.filter(p =>
                statusFilter === 'active'
                    ? (p.status === 'active' || p.status === 'draft' || !p.status)
                    : p.status === 'archived'
            );
        }
        return items;
    };

    const filtered = getDisplayItems();

    if (loading || permissionsLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-[900] tracking-tight text-[#3a3f47]">Minhas Apresentações</h2>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    <div className="relative w-64 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 bg-white border-slate-200 text-sm"
                        />
                    </div>

                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm gap-1">
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'archived' ? 'active' : 'archived')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'archived' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Arquivados"
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'deleted' ? 'active' : 'deleted')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'deleted' ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Reciclagem"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Button
                        onClick={handleCreatePresentation}
                        disabled={creating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {creating ? "..." : "Novo"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <Presentation className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {statusFilter === 'deleted' ? "A reciclagem está vazia" : statusFilter === 'archived' ? "Nenhuma apresentação arquivada" : "Você ainda não tem apresentações"}
                                </h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                    {statusFilter === 'active' && "Crie sua primeira vitrine interativa agora mesmo."}
                                </p>
                            </div>
                            {statusFilter === 'active' && (
                                <button
                                    onClick={handleCreatePresentation}
                                    disabled={creating}
                                    className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mt-4"
                                >
                                    {creating ? "Criando..." : "+ Nova Apresentação"}
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-sm font-bold text-slate-700">
                                    {statusFilter === 'deleted' ? "Reciclagem" : statusFilter === 'archived' ? "Apresentações Arquivadas" : "Lista de Apresentações"}
                                    <span className="text-slate-400 font-normal ml-2">({filtered.length})</span>
                                </h2>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left">
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Título</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Slides</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Data</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Acções</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item) => {
                                        const slideCount = item.slides?.length || 0;
                                        const createdDate = new Date(item.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                        return (
                                            <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{item.title || "Sem Título"}</span>
                                                        {item.status === 'draft' && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Rascunho</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{slideCount}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-400 text-sm">{createdDate}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => window.open(`/apresentacao/${item.slug || item.id}`, '_blank')}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                            title="Reproduzir"
                                                        >
                                                            <Play className="w-4 h-4 fill-current" />
                                                        </button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    disabled={exporting}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                                    title="Exportar"
                                                                >
                                                                    {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => handleExportPDF(item)} className="gap-2 cursor-pointer">
                                                                    <FileText className="w-4 h-4 text-red-500" />
                                                                    <span>Exportar para PDF</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <button
                                                            onClick={() => router.push(`/usuario/dashboard/apresentacoes/editor/${item.id}`)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                            title="Editar"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        {statusFilter === 'deleted' ? (
                                                            <button
                                                                onClick={() => handleRestoreFromTrash(item)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                                                                title="Restaurar"
                                                            >
                                                                <Archive className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleArchive(item)}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.status === 'archived' ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                                                title={item.status === 'archived' ? "Restaurar" : "Arquivar"}
                                                            >
                                                                <Archive className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleMoveToTrash(item)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                            title={statusFilter === 'deleted' ? "Eliminar permanentemente" : "Mover para reciclagem"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filtered.map((item) => {
                                const slideCount = item.slides?.length || 0;
                                const firstSlideImage = item.slides?.[0]?.image_url;
                                return (
                                    <div
                                        key={item.id}
                                        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-slate-900"
                                        style={{ aspectRatio: '16/10' }}
                                    >
                                        <div className="absolute inset-0">
                                            {firstSlideImage ? (
                                                <img
                                                    src={firstSlideImage}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                        </div>

                                        <div className="relative h-full flex flex-col justify-between p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-2">
                                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                                        {slideCount} Slides
                                                    </span>
                                                    {item.status === 'draft' && (
                                                        <span className="text-amber-500 text-[10px] font-black uppercase tracking-wider drop-shadow-sm">
                                                            Rascunho
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {statusFilter === 'deleted' ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRestoreFromTrash(item); }}
                                                            className="w-9 h-9 rounded-full border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 hover:border-emerald-400 hover:bg-emerald-400/10 transition-all bg-black/30 backdrop-blur-sm"
                                                            title="Restaurar"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleArchive(item); }}
                                                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all bg-black/30 backdrop-blur-sm ${item.status === 'archived' ? 'border-amber-400/50 text-amber-400 hover:border-amber-400' : 'border-white/40 text-white/80 hover:border-amber-400 hover:text-amber-400'}`}
                                                                title={item.status === 'archived' ? "Restaurar" : "Arquivar"}
                                                            >
                                                                <Archive className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMoveToTrash(item); }}
                                                                className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center text-white/80 hover:border-rose-400 hover:text-rose-400 transition-all bg-black/30 backdrop-blur-sm"
                                                                title="Mover para reciclagem"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white leading-tight mb-1 truncate" title={item.title}>
                                                        {item.title || "Sem Título"}
                                                    </h3>
                                                    <p className="text-white/70 text-sm line-clamp-2">
                                                        {item.description || "Sem descrição disponível."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push(`/usuario/dashboard/apresentacoes/editor/${item.id}`)}
                                                        className="bg-transparent border-white/30 text-white text-[10px] font-bold uppercase tracking-widest h-9 px-4 rounded-full hover:bg-white/10 hover:border-white/50 gap-2"
                                                    >
                                                        Abrir Editor
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Button>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => window.open(`/apresentacao/${item.slug || item.id}`, '_blank')}
                                                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                                            title="Visualizar"
                                                        >
                                                            <Play className="w-3 h-3 fill-current" />
                                                        </button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    disabled={exporting}
                                                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                                                    title="Exportar"
                                                                >
                                                                    {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => handleExportPDF(item)} className="gap-2 cursor-pointer">
                                                                    <FileText className="w-4 h-4 text-red-500" />
                                                                    <span>Exportar para PDF</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group mt-12">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <HelpCircle className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <Lightbulb className="w-6 h-6 text-orange-400" />
                                Dica Pro
                            </h3>
                            <p className="text-emerald-50/80 mb-0 leading-relaxed max-w-2xl">
                                Use o botão "Arquivar" para limpar sua visualização sem perder dados. Itens arquivados não aparecem publicamente, mas podem ser restaurados a qualquer momento.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
                        <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-orange-500" />
                            Dicas de Sucesso
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                                <p className="text-[13px] text-slate-600 leading-snug">Use imagens de alta resolução para causar uma boa primeira impressão.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                                <p className="text-[13px] text-slate-600 leading-snug">Seja conciso nos textos. Slides com pouco texto convertem melhor.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                                <p className="text-[13px] text-slate-600 leading-snug">Adicione uma "Call to Action" (ex: Ver Preço) em todos os slides.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xs font-bold">4</div>
                                <p className="text-[13px] text-slate-600 leading-snug">Revise a apresentação em modo de visualização antes de partilhar.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                        <h4 className="font-bold text-orange-800 text-sm mb-2">Precisa de ajuda?</h4>
                        <p className="text-xs text-orange-700/80 leading-relaxed mb-4">
                            Nossa equipe de design pode ajudar a criar sua apresentação profissional.
                        </p>
                        <Link href="/usuario/dashboard/ajuda" className="text-xs font-black text-orange-600 uppercase tracking-widest hover:underline">
                            Contactar Suporte &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Apresentação"
                description={`Tem a certeza que deseja eliminar "${itemToDelete?.title}"? ${statusFilter === 'deleted' ? 'Esta acção é permanente e não pode ser desfeita.' : 'O item será movido para a reciclagem.'}`}
                confirmLabel={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Reciclagem"}
                variant="destructive"
            />
        </div>
    );
}
