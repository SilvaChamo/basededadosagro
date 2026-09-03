"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Search, Building2, MapPin, Clock, Edit, Trash2, CheckCircle, Handshake, Mail, Phone, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
}

interface PartnerInterest {
    id: string;
    full_name: string;
    company_name: string;
    email: string;
    phone: string;
    province: string;
    activity_sector: string;
    message: string;
    status: string;
    created_at: string;
}

export default function AdminEmpregoPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<'vagas' | 'parceiros'>('vagas');
    const [jobs, setJobs] = useState<JobVacancy[]>([]);
    const [partnerRequests, setPartnerRequests] = useState<PartnerInterest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state for job creation/editing
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
    const [saving, setSaving] = useState(false);

    const [jobForm, setJobForm] = useState({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
        contact: "",
        status: "active"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsRes, partnersRes] = await Promise.all([
                supabase.from('job_vacancies').select('*').order('created_at', { ascending: false }),
                supabase.from('partner_interests').select('*').order('created_at', { ascending: false })
            ]);

            if (jobsRes.data) setJobs(jobsRes.data);
            if (partnersRes.data) setPartnerRequests(partnersRes.data);
        } catch (err) {
            console.error("Error fetching admin data:", err);
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (job?: JobVacancy) => {
        if (job) {
            setEditingJob(job);
            setJobForm({
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                description: job.description,
                requirements: job.requirements || "",
                contact: job.contact_email_or_link,
                status: job.status
            });
        } else {
            setEditingJob(null);
            setJobForm({
                title: "",
                company: "",
                location: "",
                type: "Full-time",
                description: "",
                requirements: "",
                contact: "",
                status: "active"
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                title: jobForm.title,
                company: jobForm.company,
                location: jobForm.location,
                type: jobForm.type,
                description: jobForm.description,
                requirements: jobForm.requirements,
                contact_email_or_link: jobForm.contact,
                status: jobForm.status,
                user_id: user?.id,
                updated_at: new Date().toISOString()
            };

            if (editingJob) {
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
                toast.success("Nova vaga cadastrada com sucesso!");
            }

            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error("Error saving job:", err);
            toast.error("Erro ao salvar vaga: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm("Tem certeza que deseja eliminar esta vaga?")) return;

        try {
            const { error } = await supabase.from('job_vacancies').delete().eq('id', id);
            if (error) throw error;
            toast.success("Vaga eliminada.");
            fetchData();
        } catch (err) {
            toast.error("Erro ao eliminar vaga.");
        }
    };

    const handleUpdatePartnerStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('partner_interests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success("Estado do pedido atualizado.");
            fetchData();
        } catch (err) {
            toast.error("Erro ao atualizar pedido.");
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPartners = partnerRequests.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Gestão de Vagas & Plano Parceiro</h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Gerencie todas as oportunidades de emprego e pedidos de parceria da plataforma.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl px-5 h-11 shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Cadastrar Nova Vaga
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('vagas')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'vagas'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Vagas de Emprego ({jobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('parceiros')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'parceiros'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        <Handshake className="w-4 h-4 text-orange-500" />
                        Manifestações Plano Parceiro ({partnerRequests.length})
                    </button>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Pesquisar..."
                        className="pl-9 h-10 bg-white border-slate-200 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TAB CONTENT: VAGAS */}
            {activeTab === 'vagas' && (
                loading ? (
                    <div className="py-20 text-center">
                        <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">A carregar vagas...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-lg font-bold text-slate-700">Nenhuma vaga encontrada</h3>
                        <p className="text-slate-400 text-sm">Clique em "Cadastrar Nova Vaga" para criar a primeira vaga.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition-all">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${job.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {job.status === 'active' ? 'Ativa' : 'Encerrada'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{job.type}</span>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-900">{job.title}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-orange-500" /> {job.company}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-orange-500" /> {job.location}</span>
                                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {job.contact_email_or_link}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">{job.description}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        onClick={() => handleOpenModal(job)}
                                        variant="outline"
                                        className="h-9 px-3 text-xs font-bold gap-1"
                                    >
                                        <Edit className="w-3.5 h-3.5" /> Editar
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteJob(job.id)}
                                        variant="outline"
                                        className="h-9 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200 gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* TAB CONTENT: MANIFESTAÇÕES PLANO PARCEIRO */}
            {activeTab === 'parceiros' && (
                loading ? (
                    <div className="py-20 text-center">
                        <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">A carregar manifestações de interesse...</p>
                    </div>
                ) : filteredPartners.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                        <Handshake className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-lg font-bold text-slate-700">Nenhum pedido de parceria registado</h3>
                        <p className="text-slate-400 text-sm">As propostas enviadas pelo site aparecerão aqui.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPartners.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                                    <div>
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${item.status === 'pendente' ? 'bg-amber-50 text-amber-600 border-amber-200' : item.status === 'em_contacto' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {item.status}
                                        </span>
                                        <h3 className="text-lg font-extrabold text-slate-900 mt-1">{item.company_name}</h3>
                                        <p className="text-xs text-slate-500 font-bold">Responsável: {item.full_name}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <select
                                            className="h-9 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2"
                                            value={item.status}
                                            onChange={(e) => handleUpdatePartnerStatus(item.id, e.target.value)}
                                        >
                                            <option value="pendente">Pendente</option>
                                            <option value="em_contacto">Em Contacto</option>
                                            <option value="aprovado">Aprovado</option>
                                            <option value="arquivado">Arquivado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-600">
                                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-500" /> {item.email}</div>
                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" /> {item.phone}</div>
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {item.province} ({item.activity_sector})</div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 font-normal border border-slate-100">
                                    <span className="font-bold text-slate-900 block mb-1">Mensagem / Objectivos:</span>
                                    {item.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* MODAL CADASTRAR / EDITAR VAGA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
                        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                            <h3 className="text-xl font-bold">
                                {editingJob ? "Editar Vaga de Emprego" : "Cadastrar Nova Vaga"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSaveJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Título da Vaga *</label>
                                <Input
                                    required
                                    placeholder="Ex: Engenheiro Agrónomo Sénior"
                                    value={jobForm.title}
                                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Empresa *</label>
                                    <Input
                                        required
                                        placeholder="Ex: Agro-Mozambique Lda"
                                        value={jobForm.company}
                                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Localização *</label>
                                    <Input
                                        required
                                        placeholder="Ex: Nampula / Chókwè"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Tipo de Contrato *</label>
                                    <select
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm"
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
                                    <label className="text-xs font-bold text-slate-700 uppercase">Estado *</label>
                                    <select
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm"
                                        value={jobForm.status}
                                        onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                                    >
                                        <option value="active">Ativa</option>
                                        <option value="closed">Encerrada</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Descrição da Vaga *</label>
                                <Textarea
                                    required
                                    rows={3}
                                    placeholder="Descrição das responsabilidades..."
                                    value={jobForm.description}
                                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Email / Link para Candidatura *</label>
                                <Input
                                    required
                                    placeholder="recrutamento@empresa.co.mz"
                                    value={jobForm.contact}
                                    onChange={(e) => setJobForm({ ...jobForm, contact: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                    {saving ? "A guardar..." : "Guardar Vaga"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
