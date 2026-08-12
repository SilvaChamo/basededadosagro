import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users, Clock, Languages, Notebook, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function FormacaoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Mock data - in real app would fetch based on params.id
    const training = {
        title: "Agricultura de Precisão com Drones",
        date: "15-17 Fevereiro 2025",
        location: "Maputo, Moçambique",
        instructor: "Eng. Carlos Matola",
        duration: "3 dias",
        price: "15.000 MZN",
        spots_total: 20,
        spots_available: 12,
        description: "Este curso prático aborda o uso de drones para monitoramento de culturas, mapeamento de áreas agrícolas e aplicação precisa de insumos. Ideal para engenheiros agrónomos, técnicos e produtores que desejam modernizar suas operações.",
        topics: [
            "Introdução aos tipos de drones agrícolas",
            "Legislação e segurança de voo em Moçambique",
            "Planeamento de missões de voo",
            "Captura e processamento de imagens multispetrais",
            "Análise de índices de vegetação (NDVI)",
            "Aplicação prática em campo"
        ]
    };

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Detalhes da Formação"
                description="Informações completas sobre este curso."
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-4">
                            <Link href="/usuario/dashboard/formacao">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h2 className="text-lg font-bold text-slate-800">Visão Geral</h2>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">
                                    Tecnologia
                                </span>
                                <h1 className="text-2xl font-black text-slate-800 mb-2">{training.title}</h1>
                                <p className="text-slate-600 leading-relaxed">{training.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-lg flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Data</p>
                                        <p className="font-semibold text-slate-800">{training.date}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Localização</p>
                                        <p className="font-semibold text-slate-800">{training.location}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg flex items-start gap-3">
                                    <Users className="w-5 h-5 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Formador</p>
                                        <p className="font-semibold text-slate-800">{training.instructor}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Duração</p>
                                        <p className="font-semibold text-slate-800">{training.duration}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Notebook className="w-5 h-5 text-emerald-500" />
                                    Conteúdo Programático
                                </h3>
                                <ul className="space-y-3">
                                    {training.topics.map((topic, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[320px] space-y-6">
                    <div className="bg-white rounded-[12px] border border-slate-200 p-6 shadow-sm sticky top-24">
                        <div className="text-center mb-6">
                            <p className="text-sm text-slate-500 mb-1">Preço por participante</p>
                            <div className="text-3xl font-black text-slate-900">{training.price}</div>
                        </div>

                        <Button className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 mb-4">
                            Inscrever-se Agora
                        </Button>

                        <p className="text-center text-xs text-slate-500 mb-6">
                            Restam apenas <strong className="text-emerald-600">{training.spots_available} vagas</strong> de {training.spots_total}.
                        </p>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <h4 className="font-bold text-orange-800 text-sm mb-2">Precisa de ajuda?</h4>
                            <p className="text-xs text-orange-700 mb-3">
                                Entre em contacto connosco se tiver dúvidas sobre o curso ou formas de pagamento.
                            </p>
                            <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-800 h-9 text-xs">
                                Contactar Suporte
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
