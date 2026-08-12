"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { GraduationCap, Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle, User } from "lucide-react";
import { notFound } from "next/navigation";
import React, { useState, use, useEffect } from "react";
import { TrainingEnrollmentForm } from "@/components/TrainingEnrollmentForm";
import { supabase } from "@/lib/supabaseClient";

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [training, setTraining] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(false);

    useEffect(() => {
        const fetchTraining = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('trainings')
                .select('*')
                .eq('id', id)
                .is('deleted_at', null)
                .single();

            if (data) setTraining(data);
            setLoading(false);
        };

        fetchTraining();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
            </div>
        );
    }

    if (!training) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={training.title}
                icon={GraduationCap}
                backgroundImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Formação", href: "/servicos/formacao" },
                    { label: training.title, href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Training Info */}
                        <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Informações da Formação</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Data</p>
                                        <p className="font-bold text-slate-900">{training.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Duração</p>
                                        <p className="font-bold text-slate-900">{training.duration}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Local</p>
                                        <p className="font-bold text-slate-900">{training.venue}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Vagas</p>
                                        <p className="font-bold text-emerald-600">{training.spots_available || training.spots_total || 'Vagas limitadas'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="font-black text-lg text-slate-900 mb-3">Sobre a Formação</h3>
                                <p className="text-slate-600 leading-relaxed">{training.description}</p>
                            </div>
                        </div>

                        {/* Topics Covered */}
                        {training.topics && training.topics.length > 0 && (
                            <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8">
                                <h3 className="font-black text-lg text-slate-900 mb-4">Tópicos Abordados</h3>
                                <ul className="space-y-3">
                                    {training.topics.map((topic: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Requirements */}
                        {training.requirements && training.requirements.length > 0 && (
                            <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8">
                                <h3 className="font-black text-lg text-slate-900 mb-4">Requisitos</h3>
                                <ul className="space-y-2">
                                    {training.requirements.map((req: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-[#f97316] font-bold">•</span>
                                            <span className="text-slate-700">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* What's Included */}
                        {training.includes && training.includes.length > 0 && (
                            <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8">
                                <h3 className="font-black text-lg text-slate-900 mb-4">O que está incluído</h3>
                                <ul className="space-y-3">
                                    {training.includes.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Instructor Card */}
                        <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="w-5 h-5 text-slate-600" />
                                <h3 className="font-black text-lg text-slate-900">Formador</h3>
                            </div>

                            <div className="text-center mb-4">
                                {training.instructor?.image && (
                                    <img
                                        src={training.instructor.image}
                                        alt={training.instructor.name}
                                        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                                    />
                                )}
                                <h4 className="font-bold text-slate-900">{training.instructor?.name || 'Base Agro'}</h4>
                                <p className="text-sm text-slate-600">{training.instructor?.title || 'Especialista'}</p>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                {training.instructor?.bio || 'Formação técnica especializada para o desenvolvimento agrário.'}
                            </p>

                            <div className="border-t border-slate-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-600">Investimento:</span>
                                    <span className="text-2xl font-black text-[#f97316]">{training.price || 'Gratuito'}</span>
                                </div>

                                <button
                                    onClick={() => setEnrollmentOpen(true)}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6a0a] text-white font-bold px-6 py-4 rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    Inscrever-se Agora
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <p className="text-xs text-center text-slate-500 mt-3">
                                    {(training.spots_available || training.spots_total) ? `${training.spots_available || training.spots_total} vagas disponíveis` : 'Vagas limitadas'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEnrollmentOpen && (
                <TrainingEnrollmentForm
                    trainingId={id}
                    trainingTitle={training.title}
                    onClose={() => setEnrollmentOpen(false)}
                />
            )}
        </main>
    );
}
