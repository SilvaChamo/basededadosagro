"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
    title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
    description: z.string().optional(),
    full_description: z.string().optional(),
    category: z.string().min(1, "Seleccione uma categoria"),
    slug: z.string().min(2, "Slug inválido").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
    icon: z.string().optional(),
    is_active: z.boolean(),
    sub_services: z.array(z.object({
        title: z.string().min(1, "Obrigatório"),
        description: z.string().min(1, "Obrigatório")
    })),
    features: z.array(z.object({
        value: z.string().min(1, "Obrigatório")
    })),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function ServiceForm({ initialData, isEditing = false }: ServiceFormProps) {
    const router = useRouter();
    useAdminTopBar("");
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            full_description: initialData?.full_description || "",
            category: initialData?.category || "Logística e transporte",
            slug: initialData?.slug || "",
            icon: initialData?.icon || "",
            is_active: initialData?.is_active ?? true,
            sub_services: initialData?.sub_services || [],
            features: initialData?.features?.map((f: string) => ({ value: f })) || [],
        },
    });

    const { fields: subServiceFields, append: appendSubService, remove: removeSubService } = useFieldArray({
        control: form.control,
        name: "sub_services"
    });

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control: form.control,
        name: "features"
    });

    // Auto-generate slug from title if creating new
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        form.setValue("title", title);

        if (!isEditing) {
            const slug = title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            form.setValue("slug", slug);
        }
    };

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            // Flatten features back to string array for DB
            const dataToSave = {
                ...values,
                features: values.features.map(f => f.value),
                updated_at: new Date().toISOString()
            };

            if (isEditing) {
                const { error } = await supabase
                    .from("services")
                    .update(dataToSave)
                    .eq("id", initialData.id);

                if (error) throw error;
                toast.success("Serviço actualizado com sucesso!");
            } else {
                const { error } = await supabase
                    .from("services")
                    .insert([dataToSave]);

                if (error) throw error;
                toast.success("Serviço criado com sucesso!");
            }
            router.push("/admin/servicos");
            router.refresh();
        } catch (error: any) {
            console.error("Erro ao guardar serviço:", error);
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
                        <Link href="/admin/servicos">
                            <Button variant="outline" size="icon" type="button">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                {isEditing ? "Editar Serviço" : "Novo Serviço"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {isEditing ? "Edite os detalhes do serviço abaixo" : "Preencha os dados para criar um novo serviço"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/servicos">
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
                                    <FormLabel>Título do Serviço</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Consultoria Agrícola" {...field} onChange={handleTitleChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug (URL Amigável)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="consultoria-agricola" {...field} />
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
                                    <FormLabel>Categoria</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione uma categoria" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Logística e transporte">Logística e transporte</SelectItem>
                                            <SelectItem value="Lojas e insumos">Lojas e insumos</SelectItem>
                                            <SelectItem value="Compra e venda">Compra e venda</SelectItem>
                                            <SelectItem value="Assistência digital">Assistência digital</SelectItem>
                                            <SelectItem value="Feiras e eventos">Feiras e eventos</SelectItem>
                                            <SelectItem value="Gestão de conteúdo">Gestão de conteúdo</SelectItem>
                                            <SelectItem value="Vagas de emprego">Vagas de emprego</SelectItem>
                                            <SelectItem value="Consultoria digital">Consultoria digital</SelectItem>
                                            <SelectItem value="Formações e capacitações">Formações e capacitações</SelectItem>
                                            <SelectItem value="Inovação">Inovação</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição Curta</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Breve descrição do serviço..."
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ícone (Ou Nome do Ícone Lucide)</FormLabel>
                                    <div className="space-y-4">
                                        <FormControl>
                                            <Input placeholder="Ex: Tractor, Sprout, ou URL de imagem" {...field} />
                                        </FormControl>
                                        <p className="text-xs text-slate-500">
                                            Escreva o nome de um ícone (ex: <code>Tractor</code>, <code>Sprout</code>) ou cole o URL de uma imagem.
                                        </p>
                                        {/* Optional: Add ImageUpload if they want custom icons */}
                                        {/* <ImageUpload 
                                            value={field.value.startsWith('http') ? field.value : ''} 
                                            onChange={(url) => field.onChange(url)} 
                                            disabled={loading} 
                                        /> */}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Full Description */}
                        <FormField
                            control={form.control}
                            name="full_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição Completa (Visão Geral)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descrição detalhada que aparecerá na página do serviço..."
                                            className="resize-none min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ícone (Nome Lucide ou URL)</FormLabel>
                                        <div className="space-y-2">
                                            <FormControl>
                                                <Input placeholder="Ex: Tractor, Sprout, ou URL" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Use nomes como <code>Tractor</code>, <code>Sprout</code>, ou um link de imagem.
                                            </FormDescription>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-slate-50/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base text-slate-800">Serviço Activo</FormLabel>
                                            <p className="text-sm text-slate-500">
                                                Visível no site.
                                            </p>
                                        </div>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 transition-all cursor-pointer"
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Features List */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-base font-bold text-slate-900">Benefícios / Características</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendFeature({ value: "" })}
                                    className="h-8 border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-500"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {featureFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`features.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="Ex: Monitoria 24/7" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeature(index)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-services Section (Full Width) */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Soluções Especializadas (Sub-serviços)</h3>
                            <p className="text-sm text-slate-500">Adicione as soluções específicas dentro deste serviço.</p>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => appendSubService({ title: "", description: "" })}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-900"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Solução
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subServiceFields.map((field, index) => (
                            <div key={field.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-4 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSubService(index)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <FormField
                                    control={form.control}
                                    name={`sub_services.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Título da solução" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`sub_services.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Breve descrição da solução..."
                                                    className="resize-none min-h-[80px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </Form>
    );
}
