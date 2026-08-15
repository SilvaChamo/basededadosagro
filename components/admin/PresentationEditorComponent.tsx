"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Play, Image as ImageIcon, FileText, ChevronUp, ChevronDown, Layout, Sidebar as SidebarIcon, Menu, Maximize2, Monitor, Copy, Download, FileJson, FilePieChart, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


// Helper for generating IDs safely
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface PresentationEditorComponentProps {
    id: string;
    backPath: string;
}

export function PresentationEditorComponent({ id, backPath }: PresentationEditorComponentProps) {
    const isNew = id === "novo";
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [presentation, setPresentation] = useState({
        title: "",
        description: "",
        slug: "",
        slides: [
            { id: generateId(), title: "", antetitulo: "", content: "", image_url: "", image_side: "left", image_disabled: false, highlight_image: false, text_align: "center", title_align: "center", antetitulo_align: "center", cta_text: "", cta_link: "", cta_align: "center", animation_text: "fade-in", animation_image: "fade-in", title_size: 50, image_height: 550, line_height: 1.6, title_line_height: 1.2, paragraph_spacing: 1.5, antetitulo_color: "#10b981", title_color: "#ffffff" }
        ]
    });

    // Undo/Redo Stacks
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);

    // Helper to save current state to undo stack
    const saveToUndo = (state: any) => {
        setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(state))]);
        setRedoStack([]); // Clear redo stack on new action
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        const previousState = undoStack[undoStack.length - 1];
        const currentToRedo = JSON.parse(JSON.stringify(presentation));

        setRedoStack(prev => [...prev, currentToRedo]);
        setUndoStack(prev => prev.slice(0, -1));
        setPresentation(previousState);
        toast.info("Desfeito");
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const nextState = redoStack[redoStack.length - 1];
        const currentToUndo = JSON.parse(JSON.stringify(presentation));

        setUndoStack(prev => [...prev, currentToUndo]);
        setRedoStack(prev => prev.slice(0, -1));
        setPresentation(nextState);
        toast.info("Refeito");
    };

    useEffect(() => {
        if (isNew) return;
        let isMounted = true;

        const load = async () => {
            const { data } = await supabase
                .from('presentations')
                .select('*')
                .eq('id', id)
                .single();

            if (isMounted && data) {
                const slides = (data.slides && data.slides.length > 0) ? (data.slides).map((s: any, idx: number) => ({
                    ...s,
                    id: s.id || `slide-${idx}-${Date.now()}`,
                    image_side: s.image_side || 'left',
                    image_disabled: s.image_disabled || false,
                    highlight_image: s.highlight_image || false,
                    text_align: s.text_align || 'center',
                    title_align: s.title_align || 'center',
                    antetitulo_align: s.antetitulo_align || 'center',
                    cta_align: s.cta_align || 'center',
                    title_size: s.title_size || 50,
                    image_height: s.image_height || 550,
                    line_height: s.line_height || 1.6,
                    title_line_height: s.title_line_height || 1.2,
                    paragraph_spacing: s.paragraph_spacing || 1.5,
                    antetitulo_color: s.antetitulo_color || "#10b981",
                    title_color: s.title_color || "#ffffff"
                })) : [
                    { id: generateId(), title: "", antetitulo: "", content: "", image_url: "", image_side: "left", image_disabled: false, highlight_image: false, text_align: "center", title_align: "center", antetitulo_align: "center", cta_text: "", cta_link: "", cta_align: "center", animation_text: "fade-in", animation_image: "fade-in", title_size: 52, image_height: 550, line_height: 1.6, title_line_height: 1.2, paragraph_spacing: 1.5, antetitulo_color: "#10b981", title_color: "#ffffff" }
                ];

                setPresentation({
                    title: data.title,
                    description: data.description || "",
                    slug: data.slug,
                    slides
                });
                setLoading(false);
            } else if (isMounted) {
                setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, [id, isNew, supabase]);

    const handleAddSlide = () => {
        saveToUndo(presentation);
        setPresentation(prev => ({
            ...prev,
            slides: [...prev.slides, { id: generateId(), title: "", antetitulo: "", content: "", image_url: "", image_side: "left", image_disabled: false, highlight_image: false, text_align: "center", title_align: "center", antetitulo_align: "center", cta_text: "", cta_link: "", cta_align: "center", animation_text: "fade-in", animation_image: "fade-in", title_size: 52, image_height: 550, line_height: 1.6, title_line_height: 1.2, paragraph_spacing: 1.5, antetitulo_color: "#10b981", title_color: "#ffffff" }]
        }));
    };

    const handleDuplicateSlide = (index: number) => {
        const slideToDuplicate = presentation.slides[index];
        const duplicatedSlide = {
            ...slideToDuplicate,
            id: generateId(),
            title: `${slideToDuplicate.title} (Cópia)`,
            line_height: slideToDuplicate.line_height || 1.6
        };

        const newSlides = [...presentation.slides];
        newSlides.splice(index + 1, 0, duplicatedSlide);

        saveToUndo(presentation);
        setPresentation(prev => ({
            ...prev,
            slides: newSlides
        }));

        setActiveIndex(index + 1);
        toast.success("Slide duplicado!");
    };

    const handleRemoveSlide = (slideId: string) => {
        if (presentation.slides.length === 1) {
            toast.error("Uma apresentação deve ter pelo menos um slide.");
            return;
        }
        saveToUndo(presentation);
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.filter(s => s.id !== slideId)
        }));
    };

    const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
        const newSlides = [...presentation.slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        saveToUndo(presentation);
        setPresentation(prev => ({ ...prev, slides: newSlides }));
    };

    const updateSlide = (slideId: string, fields: any) => {
        saveToUndo(presentation);
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(s => s.id === slideId ? { ...s, ...fields } : s)
        }));
    };

    const handleExportPDF = async () => {
        setSaving(true);
        toast.info("A gerar PDF... Por favor, aguarde.");

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1280, 720]
            });

            // We need a way to render each slide
            // Since we can't easily wait for images to load in a hidden div, 
            // we'll try a simpler approach if possible or just use pptxgen which is cleaner for data-driven slides.
            // For now, let's implement a clean PPTX and a basic PDF.

            // Basic PDF implementation (Text only if images are hard to capture)
            // Ideally we'd capture the active slide or a temporary off-screen one.

            for (let i = 0; i < presentation.slides.length; i++) {
                const slide = presentation.slides[i];
                if (i > 0) doc.addPage([1280, 720], 'landscape');

                doc.setFillColor(15, 23, 42); // slate-900
                doc.rect(0, 0, 1280, 720, 'F');

                const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : { r: 255, g: 255, b: 255 };
                };

                const titleColor = hexToRgb(slide.title_color || "#ffffff");
                doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
                doc.setFontSize(40);
                doc.text(slide.title || "Apresentação", 60, 100);

                doc.setFontSize(24);
                const anteColor = hexToRgb(slide.antetitulo_color || "#10b981");
                doc.setTextColor(anteColor.r, anteColor.g, anteColor.b); // emerald-500
                doc.text(slide.antetitulo || "", 60, 140);

                // Content (strip HTML)
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = slide.content;
                const text = tempDiv.textContent || tempDiv.innerText || "";

                doc.setTextColor(200, 200, 200);
                doc.setFontSize(16);
                const splitText = doc.splitTextToSize(text, 600);
                doc.text(splitText, 60, 200);
            }

            doc.save(`${presentation.title || 'apresentacao'}.pdf`);
            toast.success("PDF gerado com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao gerar PDF.");
        } finally {
            setSaving(false);
        }
    };

    const handleExportSingleSlidePDF = async (index: number) => {
        setSaving(true);
        const slide = presentation.slides[index];
        toast.info(`A gerar PDF do slide ${index + 1}...`);

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1280, 720]
            });

            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 1280, 720, 'F');

            doc.setTextColor(255, 255, 255); // Only for fallback background?
            // Actually, we filled background with slate-900, so white text is good default.

            // Allow custom text colors in PDF (converting hex to RGB)
            const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 255, g: 255, b: 255 };
            };

            const titleColor = hexToRgb(slide.title_color || "#ffffff");
            doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
            doc.setFontSize(40);
            doc.text(slide.title || "Apresentação", 60, 100);

            doc.setFontSize(24);
            const anteColor = hexToRgb(slide.antetitulo_color || "#10b981");
            doc.setTextColor(anteColor.r, anteColor.g, anteColor.b); // emerald-500 default
            doc.text(slide.antetitulo || "", 60, 140);

            // Content (strip HTML)
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = slide.content;
            const text = tempDiv.textContent || tempDiv.innerText || "";

            doc.setTextColor(200, 200, 200);
            doc.setFontSize(16);
            const splitText = doc.splitTextToSize(text, 600);
            doc.text(splitText, 60, 200);

            doc.save(`${presentation.title || 'slide'}_${index + 1}.pdf`);
            toast.success("PDF do slide gerado!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao gerar PDF do slide.");
        } finally {
            setSaving(false);
        }
    };





    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD") // decompose diacritics
            .replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/\s+/g, "-") // spaces to dashes
            .replace(/[^\w\-]+/g, "") // remove non-words
            .replace(/\-\-+/g, "-") // collapse dashes
            .replace(/^-+/, "") // trim start
            .replace(/-+$/, ""); // trim end
    };

    const handleSave = async () => {
        if (!presentation.title) {
            toast.error("A apresentação precisa de um título.");
            return;
        }

        setSaving(true);
        const { data: userData } = await supabase.auth.getUser();

        // Generate slug from title
        let slug = slugify(presentation.title);

        // Append a short random string to ensure uniqueness if needed, 
        // or we could rely on the user to make unique titles. 
        // For better UX, let's append a short hash if it's not a new presentation 
        // effectively keeping the same slug if title doesn't change much, 
        // but actually, simpler is to just use the title. 
        // If it exists, we might get an error if there's a unique constraint.
        // Let's assume for now we want friendly URLs.

        // Better: append the first 4 chars of the ID to the slug to ensure uniqueness
        // But the ID might not be generated yet for new ones...

        // Let's just use title-randomString for now to be safe.
        // Actually, looking at the user request "deixar ate apresentação o resto tirar", 
        // they want `apresentacao/titulo-da-apresentacao`.
        // If we want it to be truly clean, we should try to save just the slugified title.
        // If it fails (duplicate), Supabase will throw error if there's a constraint.
        // Let's try to just save the slugified title first.

        // NOTE: If the user changes title, the slug changes -> cool.

        const payload: any = {
            title: presentation.title,
            description: presentation.description,
            slides: presentation.slides,
            user_id: userData.user?.id,
            updated_at: new Date().toISOString(),
            slug: slug
        };

        let res;
        if (isNew) {
            res = await supabase.from('presentations').insert([payload]).select().single();
        } else {
            res = await supabase.from('presentations').update(payload).eq('id', id).select().single();
        }

        if (res.error) {
            // If error is uniqueness violation, try appending random suffix
            if (res.error.code === '23505') { // unique_violation
                slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
                payload.slug = slug;
                if (isNew) {
                    res = await supabase.from('presentations').insert([payload]).select().single();
                } else {
                    res = await supabase.from('presentations').update(payload).eq('id', id).select().single();
                }
            }

            if (res.error) {
                toast.error("Erro ao guardar: " + res.error.message);
            } else {
                handleSuccess(res.data);
            }
        } else {
            handleSuccess(res.data);
        }

        setSaving(false);
    };

    const handleSuccess = (data: any) => {
        toast.success("Apresentação guardada!");
        if (isNew && data) {
            const currentPath = window.location.pathname;
            const newPath = currentPath.replace('/novo', `/${data.id}`);
            router.replace(newPath);
        }
    };

    const activeSlide = presentation.slides[activeIndex] || presentation.slides[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!activeSlide) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
                <p className="text-slate-500 font-medium">Nenhum slide encontrado.</p>
                <Button onClick={handleAddSlide} className="bg-emerald-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Slide
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            {/* Header Toolbar */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push(backPath)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                        <ArrowLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-black text-slate-900 leading-none uppercase tracking-tight truncate max-w-[200px] md:max-w-md m-0 p-0 mb-0">
                            {presentation.title || "Sem Título"}
                        </h1>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-emerald-100 mr-2">Editor de Apresentações</span>

                        {/* Undo / Redo Buttons */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button
                                onClick={handleUndo}
                                disabled={undoStack.length === 0}
                                className={cn(
                                    "p-1.5 border-r border-slate-100 hover:bg-slate-50 transition-colors",
                                    undoStack.length === 0 ? "opacity-30 cursor-not-allowed" : "text-slate-600 hover:text-emerald-600"
                                )}
                                title="Desfazer (Undo)"
                            >
                                <Undo2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={redoStack.length === 0}
                                className={cn(
                                    "p-1.5 hover:bg-slate-50 transition-colors",
                                    redoStack.length === 0 ? "opacity-30 cursor-not-allowed" : "text-slate-600 hover:text-emerald-600"
                                )}
                                title="Refazer (Redo)"
                            >
                                <Redo2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "p-2 rounded-lg transition-all border",
                            isSidebarOpen ? "bg-slate-100 text-slate-900 border-slate-300" : "text-slate-400 border-slate-200 hover:text-slate-600"
                        )}
                        title={isSidebarOpen ? "Esconder Barra Lateral" : "Mostrar Barra Lateral"}
                    >
                        <SidebarIcon className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-slate-200 mx-2" />

                    {!isNew && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const baseUrl = window.location.origin;
                                    const slug = (presentation as any).slug || id;
                                    const url = `${baseUrl}/apresentacao/${slug}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success("Link copiado para a área de transferência!");
                                }}
                                className="bg-white text-slate-600 font-bold border-slate-200 h-9 gap-2 text-xs"
                                title="Copiar Link Público"
                            >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                Link
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.open(`/apresentacao/${(presentation as any).slug || id}?fullscreen=true`, '_blank')}
                                className="bg-white text-slate-600 font-bold border-slate-200 h-9 gap-2 text-xs"
                            >
                                <Play className="w-3.5 h-3.5 fill-slate-600" />
                                Apresentar
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={saving}
                                        className="bg-white text-emerald-600 font-bold border-emerald-200 hover:bg-emerald-50 h-9 gap-2 text-xs"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Exportar
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                                        <FileText className="w-4 h-4 text-red-500" />
                                        <span>Exportar para PDF</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-9 px-6 rounded-lg shadow-sm gap-2 uppercase tracking-widest text-[10px]"
                    >
                        {<Save className="w-3.5 h-3.5" />}
                        {isNew ? "Criar" : "Guardar"}
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Slide Thumbnails */}
                <aside
                    className={cn(
                        "bg-slate-100 border-r border-slate-200 flex flex-col transition-all duration-300 shadow-inner overflow-hidden",
                        isSidebarOpen ? "w-64" : "w-0 border-none"
                    )}
                >
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Slides</h3>
                        <button
                            onClick={handleAddSlide}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors"
                            title="Novo Slide"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {presentation.slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                onClick={() => setActiveIndex(index)}
                                className={cn(
                                    "relative group cursor-pointer transition-all rounded-lg overflow-hidden border-2",
                                    activeIndex === index
                                        ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/10"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                )}
                            >
                                <div className="aspect-video bg-slate-50 relative overflow-hidden flex items-center justify-center">
                                    {slide.image_url ? (
                                        <img src={slide.image_url} alt="" className="w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="p-4 text-center">
                                            <p className="text-[8px] font-bold text-slate-300 uppercase truncate px-2">{slide.title || "Novo Slide"}</p>
                                        </div>
                                    )}
                                    <div className="absolute top-1 left-1 size-5 bg-white/80 rounded flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200">
                                        {index + 1}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMoveSlide(index, 'up'); }}
                                            disabled={index === 0}
                                            className="p-1 bg-white hover:bg-slate-50 text-slate-400 disabled:opacity-30 rounded border shadow-sm"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleMoveSlide(index, 'down'); }}
                                            disabled={index === presentation.slides.length - 1}
                                            className="p-1 bg-white hover:bg-slate-50 text-slate-400 disabled:opacity-30 rounded border shadow-sm"
                                        >
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(index); }}
                                            className="p-1 bg-white hover:bg-emerald-50 text-emerald-600 rounded border shadow-sm"
                                            title="Duplicar Slide"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveSlide(slide.id); }}
                                            className="p-1 bg-white hover:bg-rose-50 text-rose-500 rounded border shadow-sm mt-1"
                                            title="Remover Slide"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2 bg-white flex items-center">
                                    <p className="text-[9px] font-bold text-slate-600 truncate">{slide.title || `Slide ${index + 1}`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Workspace (Canvas) */}
                <main className="flex-1 overflow-y-auto bg-slate-200 relative p-8 flex flex-col items-center custom-scrollbar">

                    {/* The Active Slide "Canvas" */}
                    <div className="w-full max-w-5xl space-y-8 pb-12">


                        {/* Current Slide Editor (THE CANVAS) */}
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col h-auto relative translate-z-0">
                            {/* Slide Canvas Grid Background */}
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none"></div>

                            <div className="px-8 py-4 bg-emerald-600 text-white flex items-center justify-between shrink-0 z-10">
                                <div className="flex items-center gap-3">
                                    <Layout className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Editor de Slide #{activeIndex + 1}</span>
                                </div>
                            </div>

                            <div className="p-10 flex flex-col gap-10 z-10 relative">
                                {/* Header Section: Title/Antetitulo & Image */}
                                <div className="flex flex-col md:flex-row gap-10 items-start shrink-0">
                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Antetítulo</label>
                                            <Input
                                                value={activeSlide?.antetitulo || ""}
                                                onChange={(e) => updateSlide(activeSlide.id, { antetitulo: e.target.value })}
                                                placeholder="Digite o Antetítulo..."
                                                className="h-10 text-xl font-bold bg-white/50 border-slate-200 focus:ring-emerald-500 rounded-lg shadow-sm text-orange-500 placeholder:text-orange-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Título</label>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Tamanho</label>
                                                    <Input
                                                        type="number"
                                                        value={activeSlide?.title_size ?? 50}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            updateSlide(activeSlide.id, { title_size: val === '' ? '' : parseInt(val) });
                                                        }}
                                                        className="w-16 h-7 text-[12px] font-bold bg-white/50 border-slate-200 rounded text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-400">px</span>
                                                    <div className="flex items-center gap-2 border-l border-slate-200 pl-2 ml-2">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Espaçamento</label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="1"
                                                            max="3"
                                                            value={activeSlide?.title_line_height ?? 1.2}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                updateSlide(activeSlide.id, { title_line_height: val === '' ? '' : parseFloat(val) });
                                                            }}
                                                            className="w-16 h-7 text-[12px] font-bold bg-white/50 border-slate-200 rounded text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Textarea
                                                value={activeSlide?.title || ""}
                                                onChange={(e) => updateSlide(activeSlide.id, { title: e.target.value })}
                                                placeholder="Digite o Título principal..."
                                                className="min-h-[100px] text-2xl font-bold bg-white/50 border-slate-200 focus:ring-emerald-500 rounded-lg shadow-sm resize-none text-black placeholder:text-slate-400"
                                                style={{
                                                    fontSize: activeSlide?.title_size ? `${activeSlide.title_size / 2}px` : 'inherit',
                                                    lineHeight: activeSlide?.title_line_height || 1.2
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Image Selector */}
                                    <div className="w-full md:w-80 shrink-0 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3 text-emerald-500" />
                                                Imagem Lateral (30%)
                                            </label>
                                            <button
                                                onClick={() => updateSlide(activeSlide.id, { highlight_image: !activeSlide?.highlight_image })}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter transition-all border",
                                                    activeSlide?.highlight_image
                                                        ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105"
                                                        : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:border-slate-300"
                                                )}
                                                title="Destacar Imagem no Centro (Layout Cheio)"
                                            >
                                                <Maximize2 className={cn("w-3 h-3", activeSlide?.highlight_image && "animate-pulse")} />
                                                {activeSlide?.highlight_image ? "Destaque Ativo" : "Destacar no Centro"}
                                            </button>
                                        </div>
                                        <div className="bg-white rounded-lg border-2 border-dashed border-slate-200 transition-all hover:border-emerald-500 hover:bg-emerald-50/5 shadow-sm group overflow-hidden aspect-video relative">
                                            <ImageUpload
                                                value={activeSlide?.image_url}
                                                onChange={(url) => updateSlide(activeSlide.id, { image_url: url })}
                                                label="Upload Imagem"
                                                bucket="public-assets"
                                                folder="presentations"
                                                className="border-none bg-transparent rounded-none h-full w-full aspect-video"
                                                imageClassName="object-cover object-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section: FULL WIDTH & EXPANDED */}
                                <div className="flex flex-col h-auto">
                                    <div className="bg-white overflow-hidden h-auto">
                                        <RichTextEditor
                                            key={activeSlide.id}
                                            value={activeSlide?.content}
                                            onChange={(val) => updateSlide(activeSlide.id, { content: val })}
                                            placeholder="Descreva sua visão para este slide de forma detalhada..."
                                            className="bg-transparent"
                                            style={{ lineHeight: activeSlide?.line_height || 1.6 }}
                                            lineHeight={activeSlide?.line_height}
                                            onLineHeightChange={(val) => updateSlide(activeSlide.id, { line_height: val })}
                                            paragraphSpacing={activeSlide?.paragraph_spacing}
                                            onParagraphSpacingChange={(val) => updateSlide(activeSlide.id, { paragraph_spacing: val })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

// Helper for Color Picker
function ColorPicker({ color, onChange }: { color: string; onChange: (color: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    // Default colors
    const colors = [
        { color: "#000000", title: "Preto" },
        { color: "#475569", title: "Cinza" },
        { color: "#2563eb", title: "Azul" },
        { color: "#dc2626", title: "Vermelho" },
        { color: "#059669", title: "Verde (Site)" },
        { color: "#ea580c", title: "Laranja (Site)" },
        { color: "#ffffff", title: "Branco", border: true },
        // Add a few more for slides
        { color: "#10b981", title: "Esmeralda" },
        { color: "#f59e0b", title: "Amarelo" }
    ];

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = () => setIsOpen(false);
        // Delay adding listener to avoid immediate close
        const timeout = setTimeout(() => document.addEventListener('click', handleClick), 0);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener('click', handleClick);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                title="Cor do Texto"
            >
                <div
                    className="w-4 h-4 rounded-full border border-slate-200 ring-1 ring-black/5"
                    style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Cor</span>
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-xl grid grid-cols-5 gap-1.5 z-50 w-[160px]"
                    onClick={(e) => e.stopPropagation()} // Prevent close on palette click
                >
                    {colors.map((c) => (
                        <button
                            key={c.color}
                            className={cn(
                                "w-6 h-6 rounded-full hover:scale-110 transition-transform ring-offset-1 focus:ring-2 focus:ring-emerald-500 outline-none",
                                c.border && "border border-slate-200"
                            )}
                            style={{ backgroundColor: c.color }}
                            onClick={() => {
                                onChange(c.color);
                                setIsOpen(false);
                            }}
                            title={c.title}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
