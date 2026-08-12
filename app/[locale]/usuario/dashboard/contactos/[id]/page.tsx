import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, Tag } from "lucide-react";
import Link from "next/link";

export default async function ContactoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Mock data - in real app would fetch based on params.id

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Detalhes da Mensagem"
                description="Visualize os detalhes desta conversa."
            />

            <div className="bg-white rounded-[12px] border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/usuario/dashboard/contactos">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Interesse em Milho Branco</h2>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                Comprador Anónimo
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                31 Jan 2026
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                                Nova Mensagem
                            </span>
                        </div>
                    </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600">
                    <p>Olá,</p>
                    <p>
                        Gostaria de saber se vocês têm disponibilidade para entrega de 5 toneladas em Nampula.
                        Estamos interessados em fechar um contrato mensal para fornecimento contínuo.
                    </p>
                    <p>Aguardo o vosso retorno com cotação e prazos de entrega.</p>
                    <p>Atentamente,<br />Departamento de Compras</p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        Responder
                    </Button>
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                        Arquivar
                    </Button>
                </div>
            </div>
        </div>
    );
}
