"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Building2, Clock, Plus, Lock, CheckCircle2, ArrowRight, Loader2, Edit, Trash2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface JobVacancy {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements?: string;
    contact_email_or_link: string;
    status: string;
    created_at: string;
    user_id?: string;
}

export default function EmpregoPage() {
    const supabase = createClient();
    const { plan, canJobs, loading: planLoading } = usePlanPermissions();
    const [jobs, setJobs] = useState<JobVacancy[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);

    const [jobForm, setJobForm] = useState({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
        contact: ""
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('job_vacancies')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching jobs:", error);
            } else if (data && data.length > 0) {
                setJobs(data);
            } else {
                // Fallback to sample vacancies if DB is empty
                setJobs([
                    {
                        id: "sample-1",
                        title: "Engenheiro Agrónomo Sénior",
                        company: "Agro-Mozambique Lda",
                        location: "Nampula",
                        type: "Full-time",
                        description: "Responsável pela supervisão de culturas de grande escala e implementação de sistemas de rega eficientes.",
                        contact_email_or_link: "recrutamento@agromozambique.co.mz",
                        status: "active",
                        created_at: new Date().toISOString()
                    },
                    {
                        id: "sample-2",
                        title: "Gestor de Unidade",
                        company: "Fazendas do Niassa",
                        location: "Lichinga",
                        type: "Contrato",
                        description: "Gestão operacional de unidade de produção, controle de stocks e liderança de equipas de campo.",
                        contact_email_or_link: "vagas@niassa.co.mz",
                        status: "active",
                        created_at: new Date().toISOString()
                    }
                ]);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishClick = () => {
        if (!canJobs) {
            setIsUpgradeModalOpen(true);
        } else {
            setEditingJob(null);
            setJobForm({
                title: "",
                company: "",
                location: "",
                type: "Full-time",
                description: "",
                requirements: "",
                contact: ""
            });
            setIsJobModalOpen(true);
        }
    };

    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Por favor faça login para publicar.");
                return;
            }

            const payload = {
                title: jobForm.title,
                company: jobForm.company,
                location: jobForm.location,
                type: jobForm.type,
                description: jobForm.description,
                requirements: jobForm.requirements,
                contact_email_or_link: jobForm.contact,
                status: 'active',
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            if (editingJob && editingJob.id && !editingJob.id.startsWith('sample')) {
                const { error } = await supabase
                    .from('job_vacancies')
                    .update(payload)
                    .eq('id', editingJob.id);

                if (error) throw error;
                toast.success("Vaga atualizada com sucesso!");
            } else {
                const { error } = await supabase
                    .from('job_vacancies')
                    .insert(payload);

                if (error) throw error;
                toast.success("Vaga publicada com sucesso!");
            }

            setIsJobModalOpen(false);
            fetchJobs();
        } catch (err: any) {
            console.error("Error publishing job:", err);
            toast.error("Erro ao publicar vaga: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DashboardPageHeader
                    title="Vagas de Emprego"
                    description="Encontre oportunidades ou publique vagas para a sua empresa."
                />

                <Button
                    onClick={handlePublishClick}
                    disabled={planLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl shadow-md gap-2 shrink-0"
                >
                    {!canJobs && <Lock className="w-4 h-4 text-orange-400" />}
                    <Plus className="w-4 h-4" />
                    Publicar Nova Vaga
                </Button>
            </div>

            {/* Plan Info Banner */}
            {!canJobs && !planLoading && (
                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Publicação de Vagas Restrita</h4>
                            <p className="text-xs text-slate-600">
                                O seu plano atual é <strong>{plan}</strong>. A publicação de vagas está disponível exclusivamente nos planos <strong>Premium</strong>, <strong>Business Vendedor</strong> e <strong>Parceiro</strong>.
                            </p>
                        </div>
                    </div>
                    <Link href="/planos">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-9 px-4 rounded-lg shadow-sm whitespace-nowrap">
                            Fazer Upgrade &rarr;
                        </Button>
                    </Link>
                </div>
            )}

            {/* Job Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-2 animate-spin" />
                    <p className="text-slate-500 text-sm">A carregar oportunidades...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job, i) => (
                        <div key={job.id || i} className="p-6 md:p-8 rounded-[12px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between gap-4 group relative">
                            <span className="absolute top-6 right-6 md:top-8 md:right-8 text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">{job.type}</span>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-[10px] bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    <div className="space-y-3 pr-12">
                                        <h4 className="text-[20px] font-extrabold text-[#3a3f47] group-hover:text-[#f97316] transition-colors capitalize tracking-tight leading-tight">{job.title}</h4>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-[#f97316]" />
                                                {job.company}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                                                {job.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed pl-4 border-l-2 border-slate-100 line-clamp-2">
                                    {job.description}
                                </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> Ativa
                                </span>
                                <a
                                    href={job.contact_email_or_link.startsWith('http') ? job.contact_email_or_link : `mailto:${job.contact_email_or_link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors"
                                >
                                    Candidatar-se
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FORM MODAL: CADASTRAR VAGA DE EMPREGO */}
            {isJobModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
                        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                            <h3 className="text-xl font-extrabold font-heading">Formulário de Cadastro de Vaga</h3>
                            <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
                        </div>

                        <form onSubmit={handleSaveJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Título da Vaga *</label>
                                <Input
                                    required
                                    placeholder="Ex: Engenheiro Agrónomo Sénior"
                                    value={jobForm.title}
                                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome da Empresa *</label>
                                    <Input
                                        required
                                        placeholder="Ex: Agro-Mozambique Lda"
                                        value={jobForm.company}
                                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Localização / Província *</label>
                                    <Input
                                        required
                                        placeholder="Ex: Nampula / Chókwè"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipo de Contrato *</label>
                                <select
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-800"
                                    value={jobForm.type}
                                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Meio-tempo">Meio-tempo</option>
                                    <option value="Contrato">Contrato</option>
                                    <option value="Projecto">Projecto</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Descrição das Responsabilidades *</label>
                                <Textarea
                                    required
                                    rows={3}
                                    placeholder="Descreva as funções principais da vaga..."
                                    value={jobForm.description}
                                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Requisitos (Opcional)</label>
                                <Textarea
                                    rows={2}
                                    placeholder="Ex: Licenciatura em Agronomia, 3+ anos de experiência..."
                                    value={jobForm.requirements}
                                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email ou Link para Candidaturas *</label>
                                <Input
                                    required
                                    placeholder="recrutamento@empresa.co.mz ou https://..."
                                    value={jobForm.contact}
                                    onChange={(e) => setJobForm({ ...jobForm, contact: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsJobModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6">
                                    {saving ? "A publicar..." : "Publicar Vaga"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL BLOQUEIO UPGRADE (GRATUITO / BÁSICO) */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Lock className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-900">Recurso Exclusivo</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            A publicação de vagas de emprego está disponível apenas para parceiros subscritores dos planos <strong>Premium</strong>, <strong>Business Vendedor</strong> e <strong>Parceiro</strong>.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 font-medium border border-slate-100 text-left space-y-1">
                            <span className="font-bold text-slate-800 block mb-1">Vantagens dos Planos Elegíveis:</span>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Publicar vagas de emprego ilimitadas</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Selo de Empresa Verificada</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Destaque máximo na maior base agrícola</div>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsUpgradeModalOpen(false)}
                                className="flex-1 font-bold text-xs h-11"
                            >
                                Fechar
                            </Button>
                            <Link href="/planos" className="flex-1">
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-11 shadow-md">
                                    Ver Planos &rarr;
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
