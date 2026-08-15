"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PROVINCES } from "@/lib/constants";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    role: z.string().min(2, "Cargo/Título deve ter pelo menos 2 caracteres"),
    category: z.string().min(2, "Categoria é obrigatória"),
    location: z.string().min(3, "Localização é obrigatória"),
    province: z.string().min(1, "Província é obrigatória"),
    district: z.string().optional(),
    email: z.string().email("Email inválido"),
    phone: z.string().min(9, "Telefone inválido"),
    whatsapp: z.string().optional(),
    linkedin: z.string().url("URL inválido").optional().or(z.literal("")),
    facebook: z.string().url("URL inválido").optional().or(z.literal("")),
    instagram: z.string().optional(),
    bio: z.string().min(10, "A biografia deve ser mais detalhada"),
    specialties: z.string().min(3, "Adicione pelo menos uma especialidade"),
    academic_level: z.string().optional(),
    profession: z.string().optional(),
    photo_url: z.string().optional(),
});

interface ProfessionalFormProps {
    initialData?: any;
    isAdmin?: boolean;
}

export function ProfessionalRegistrationForm({ initialData, isAdmin }: ProfessionalFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Anti-spam: honeypot field (should remain empty)
    const [honeypot, setHoneypot] = useState("");
    // Anti-spam: track form load time (minimum 5 seconds to submit)
    const [formLoadTime] = useState(Date.now());

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
            }
        };
        getSession();
    }, [supabase]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            role: initialData?.role || "",
            category: initialData?.category || "",
            location: initialData?.location || "",
            province: initialData?.province || "",
            district: initialData?.district || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            whatsapp: initialData?.whatsapp || "",
            linkedin: initialData?.linkedin || "",
            facebook: initialData?.facebook || "",
            instagram: initialData?.instagram || "",
            bio: initialData?.bio || "",
            specialties: initialData?.specialties || "",
            academic_level: initialData?.academic_level || "",
            profession: initialData?.profession || "",
            photo_url: initialData?.photo_url || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Anti-spam checks (skip for admin)
        if (!isAdmin) {
            // Honeypot check - if filled, it's likely a bot
            if (honeypot) {
                console.warn("Spam detected: honeypot filled");
                toast.error("Erro ao submeter", {
                    description: "Tente novamente mais tarde."
                });
                return;
            }

            // Time check - form filled too quickly (less than 5 seconds)
            const timeTaken = Date.now() - formLoadTime;
            if (timeTaken < 5000) {
                console.warn("Spam detected: form submitted too quickly", timeTaken);
                toast.error("Por favor, preencha o formulário com mais cuidado.", {
                    description: "O formulário foi submetido demasiado rápido."
                });
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                name: values.name,
                role: values.role,
                category: values.category,
                location: values.location,
                province: values.province,
                district: values.district,
                email: values.email,
                phone: values.phone,
                whatsapp: values.whatsapp,
                linkedin: values.linkedin,
                facebook: values.facebook,
                instagram: values.instagram,
                bio: values.bio,
                specialties: values.specialties,
                academic_level: values.academic_level,
                profession: values.profession,
                photo_url: values.photo_url,
                user_id: userId,
                // Status: if admin editing, keep existing status, otherwise default to pending
                status: isAdmin ? (initialData?.status || "active") : "pending",
                rating: initialData?.rating || 5.0,
                updated_at: new Date().toISOString(),
            };

            let error;

            // Check if it's a mock ID (which shouldn't be updated in DB)
            const isMock = initialData?.id && typeof initialData.id === 'string' && initialData.id.startsWith('mock-');

            if (initialData?.id && !isMock) {
                // Update existing real record
                const { error: err } = await supabase
                    .from("professionals")
                    .update(payload)
                    .eq("id", initialData.id);
                error = err;
            } else {
                // Create new record (or convert mock to real)
                const { error: err } = await supabase
                    .from("professionals")
                    .insert({
                        ...payload,
                        created_at: new Date().toISOString(),
                    });
                error = err;
            }

            if (error) throw error;

            // If not admin, ensure the user has 'Gratuito' plan in profiles
            if (!isAdmin && userId) {
                await supabase
                    .from('profiles')
                    .update({ plan: 'Free' })
                    .eq('id', userId);
            }

            if (isAdmin) {
                toast.success(initialData ? "Profissional actualizado!" : "Profissional criado!");
                router.push("/admin/profissionais");
                router.refresh();
            } else {
                setSuccess(true);
                toast.success("Registo enviado com sucesso!", {
                    description: "O seu perfil será analisado pela nossa equipa."
                });
                setTimeout(() => {
                    router.push("/servicos");
                }, 3000);
            }

        } catch (error: any) {
            console.error("Erro ao guardar:", JSON.stringify(error, null, 2));
            toast.error("Erro ao submeter", {
                description: error.message || "Tente novamente mais tarde."
            });
        } finally {
            setLoading(false);
        }
    }

    if (success && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Registo Recebido!</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
                    Obrigado por se juntar à nossa rede de talentos. O seu perfil foi enviado para aprovação e estará visível em breve.
                </p>
                <Button
                    onClick={() => router.push("/servicos")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 py-6 text-base"
                >
                    Voltar aos Talentos
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100">

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex gap-3 text-slate-600 text-sm">
                    <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p>Preencha os dados abaixo para criar o seu perfil profissional. Os campos marcados com <span className="text-orange-500 font-bold text-lg leading-none">*</span> são obrigatórios.</p>
                </div>

                {/* Honeypot field - hidden from users, visible to bots */}
                <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                    <label htmlFor="website_url">Website</label>
                    <input
                        type="text"
                        id="website_url"
                        name="website_url"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                    />
                </div>

                {/* PERSONAL INFO SECTION - RESTRUCTURED */}
                <div className="space-y-6">
                    <h3 className="font-bold text-xl text-slate-800 border-b pb-2">Informações Pessoais</h3>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch">

                        {/* LEFT COLUMN: PHOTO */}
                        <div className="md:w-48 shrink-0">
                            <div className="h-full min-h-[180px] relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50/50">
                                <ImageUpload
                                    value={form.watch('photo_url') || ""}
                                    onChange={(url) => form.setValue('photo_url', url)}
                                    label=""
                                    recommendedSize=""
                                    folder="professionals"
                                    className="w-full h-full absolute inset-0 flex items-center justify-center"
                                    imageClassName="w-full h-full object-cover"
                                    showRecommendedBadge={false}
                                    aspectRatio="square"
                                    maxSizeMB={1}
                                    maxWidth={800}
                                    maxHeight={800}
                                />
                                {!form.watch('photo_url') && (
                                    <p className="text-[9px] text-emerald-600 font-medium text-center absolute bottom-4 left-0 right-0 px-2 leading-tight pointer-events-none">
                                        800×800px · Máx. 1MB
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FIELDS */}
                        <div className="flex-1 w-full flex flex-col gap-2 justify-between">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="Nome Completo"
                                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-base"
                                                    {...field}
                                                />
                                                <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        placeholder="Telefone"
                                                        className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-base"
                                                        {...field}
                                                    />
                                                    <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="WhatsApp (opcional)"
                                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="Email"
                                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-base"
                                                    {...field}
                                                />
                                                <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Social Media - 3 fields */}
                    <div className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <FormField
                                control={form.control}
                                name="linkedin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="LinkedIn"
                                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="facebook"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Facebook"
                                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instagram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Instagram"
                                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-bold text-xl text-slate-800 border-b pb-2">Detalhes Profissionais</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                placeholder="Título / Cargo (ex: Eng. Agrónomo)"
                                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4"
                                                {...field}
                                            />
                                            <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
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
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                placeholder="Área de Actuação (ex: Veterinária)"
                                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4"
                                                {...field}
                                            />
                                            <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="specialties"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative group">
                                        <Input
                                            placeholder="Especialidades (separadas por vírgula)"
                                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4"
                                            {...field}
                                        />
                                        <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="w-full grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="academic_level"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4">
                                                <SelectValue placeholder="Nível Académico" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ensino_basico">Ensino Básico</SelectItem>
                                            <SelectItem value="ensino_medio">Ensino Médio</SelectItem>
                                            <SelectItem value="tecnico">Técnico Profissional</SelectItem>
                                            <SelectItem value="licenciatura">Licenciatura</SelectItem>
                                            <SelectItem value="mestrado">Mestrado</SelectItem>
                                            <SelectItem value="doutoramento">Doutoramento</SelectItem>
                                            <SelectItem value="pos_doutoramento">Pós-Doutoramento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="profession"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4">
                                                <SelectValue placeholder="Profissão" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="agronomo">Agrónomo</SelectItem>
                                            <SelectItem value="veterinario">Veterinário</SelectItem>
                                            <SelectItem value="zootecnista">Zootecnista</SelectItem>
                                            <SelectItem value="tecnico_agricola">Técnico Agrícola</SelectItem>
                                            <SelectItem value="engenheiro_florestal">Engenheiro Florestal</SelectItem>
                                            <SelectItem value="biologo">Biólogo</SelectItem>
                                            <SelectItem value="economista_agricola">Economista Agrícola</SelectItem>
                                            <SelectItem value="consultor">Consultor</SelectItem>
                                            <SelectItem value="pesquisador">Pesquisador</SelectItem>
                                            <SelectItem value="outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative group">
                                        <Textarea
                                            placeholder="Biografia Profissional - Descreva a sua experiência..."
                                            className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 pt-3"
                                            {...field}
                                        />
                                        <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-6">
                    <h3 className="font-bold text-xl text-slate-800 border-b pb-2">Localização</h3>
                    <div className="w-full grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue('district', '');
                                    }} defaultValue={field.value}>
                                        <FormControl>
                                            <div className="relative group">
                                                <SelectTrigger className="w-full h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4">
                                                    <SelectValue placeholder="Selecione a Província" />
                                                </SelectTrigger>
                                                <span className="absolute right-8 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                            </div>
                                        </FormControl>
                                        <SelectContent>
                                            {PROVINCES.map((prov) => (
                                                <SelectItem key={prov} value={prov}>
                                                    {prov}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder={form.watch('province') ? "Digite o Distrito" : "Selecione primeiro a Província"}
                                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!form.watch('province')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="col-span-full">
                                <FormControl>
                                    <div className="relative group">
                                        <Input
                                            placeholder="Morada / Localização Detalhada"
                                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pl-4"
                                            {...field}
                                        />
                                        <span className="absolute right-3 top-3 text-orange-500 text-2xl font-bold leading-none select-none pointer-events-none transform -translate-y-0.5">*</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <div className="pt-6 border-t mt-8 text-center md:text-left">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 rounded-agro-btn px-12 text-lg shadow-lg shadow-emerald-600/20"
                        disabled={loading}
                    >
                        {(
                            initialData ? "Guardar Alterações" : "Registar Perfil Profissional"
                        )}
                    </Button>
                </div>
            </form>
        </Form >
    );
}
