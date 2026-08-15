"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Play, Clock, User } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
    title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
    video_url: z.string().url("URL inválido (deve ser YouTube ou Vimeo)"),
    specialist_name: z.string().min(2, "Nome do especialista é obrigatório"),
    specialist_role: z.string().default("").optional(),
    duration: z.string().min(2, "Duração é obrigatória (ex: 45 min)"),
    category: z.string().min(1, "Seleccione uma categoria"),
    description: z.string().default("").optional(),
    thumbnail_url: z.string().default("").optional(),
    is_featured: z.boolean(),
    is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface PodcastFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function PodcastForm({ initialData, isEditing = false }: PodcastFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("podcast_categories")
                .select("id, name")
                .eq("is_active", true)
                .order("name");
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            video_url: initialData?.video_url || "",
            specialist_name: initialData?.specialist_name || "",
            specialist_role: initialData?.specialist_role || "",
            duration: initialData?.duration || "",
            category: initialData?.category || "Estratégia",
            description: initialData?.description || "",
            thumbnail_url: initialData?.thumbnail_url || "",
            is_featured: initialData?.is_featured ?? false,
            is_active: initialData?.is_active ?? true,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        const supabase = createClient();
        try {
            // Helper to transform standard YT link to clean Embed URL
            let videoUrl = values.video_url;
            let videoId = '';
            try {
                const urlObj = new URL(videoUrl);
                if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.get('v')) {
                    videoId = urlObj.searchParams.get('v')!;
                } else if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.replace('/', '');
                } else if (urlObj.pathname.includes('/embed/')) {
                    videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0] || '';
                }
            } catch {
                // If URL parsing fails, try regex fallback
                const match = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]+)/);
                if (match) videoId = match[1];
            }
            if (videoId) {
                videoUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            const payload = { ...values, video_url: videoUrl };

            if (isEditing) {
                const { error } = await supabase
                    .from("podcasts")
                    .update({ ...payload }) // No updated_at in schema, add if needed or ignore
                    .eq("id", initialData.id);

                if (error) throw error;
                toast.success("Episódio actualizado com sucesso!");
            } else {
                const { error } = await supabase
                    .from("podcasts")
                    .insert([payload]);

                if (error) throw error;
                toast.success("Episódio criado com sucesso!");
            }
            router.push("/admin/podcast");
            router.refresh();
        } catch (error: any) {
            console.error("Erro ao guardar episódio:", error);
            toast.error("Erro ao guardar: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/podcast">
                            <Button variant="outline" size="icon" type="button">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                {isEditing ? "Editar Episódio" : "Novo Episódio"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {isEditing ? "Edite os detalhes do episódio abaixo" : "Preencha os dados para adicionar um novo vídeo"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/podcast">
                            <Button variant="ghost" type="button">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título do Episódio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: O Futuro do Agronegócio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="video_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL do Vídeo (YouTube/Vimeo)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Play className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input className="pl-10" placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                        </div>
                                    </FormControl>
                                    <p className="text-xs text-slate-500">Cole o link directo do YouTube. Nós ajustamos para embed automaticamente.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="specialist_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Convidado</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="Ex: Eng. Armindo" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="specialist_role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Especialidade / Cargo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Agrónomo, CEO da AgroTech" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-[25fr_75fr] gap-4">

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duração</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="Ex: 45 min" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria / Tema</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione um tema" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">

                        <FormField
                            control={form.control}
                            name="thumbnail_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capa do Episódio (Thumbnail)</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            disabled={loading}
                                            label="Thumbnail"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição / Resumo</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Breve resumo do que é abordado no episódio..."
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_featured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-amber-50 border-amber-100">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-amber-900">Episódio em Destaque</FormLabel>
                                        <p className="text-sm text-amber-700/80">
                                            Se marcado, aparecerá como o vídeo principal na secção.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-emerald-50 border-emerald-100">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-emerald-900">Episódio Activo</FormLabel>
                                        <p className="text-sm text-emerald-700/80">
                                            Se desmarcado, o episódio não será exibido no site.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    );
}
