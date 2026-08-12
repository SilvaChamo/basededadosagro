"use client";

import { ProfessionalRegistrationForm } from "@/components/ProfessionalRegistrationForm";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Same mock data as in the list page - for editing mockups
const MOCK_DATA = [
    { id: 'mock-1', name: 'Dr. Afonso Henriques', profession: 'Agrónomo Especialista', email: 'afonso@example.com', phone: '+258 84 123 4567', location: 'Maputo', status: 'active', experience: '10 anos', specialty: 'Culturas de Regadiu', photo_url: null },
    { id: 'mock-2', name: 'Eng. Beatriz Costa', profession: 'Veterinária', email: 'beatriz@example.com', phone: '+258 82 987 6543', location: 'Beira', status: 'active', experience: '6 anos', specialty: 'Pecuária', photo_url: null },
    { id: 'mock-3', name: 'Carlos Manuel', profession: 'Técnico Agrícola', email: 'carlos@example.com', phone: '+258 85 555 4433', location: 'Nampula', status: 'active', experience: '3 anos', specialty: 'Mecanização', photo_url: null },
    { id: 'mock-4', name: 'Dra. Elena Silva', profession: 'Gestora de Projectos', email: 'elena@agro.co.mz', phone: '+258 87 111 2233', location: 'Chimoio', status: 'active', experience: '8 anos', specialty: 'Agronegócio', photo_url: null },
    { id: 'real-1', name: 'Dra. Anabela Velho', profession: 'Médica Veterinária', email: 'vetcare.mz@gmail.com', phone: '+258 84 318 8240', location: 'Maputo (Vetcare)', status: 'active', experience: '15 anos', specialty: 'Clínica de Pequenos Animais', photo_url: null },
    { id: 'real-2', name: 'Eng. Narcisa Nhamitambo', profession: 'Especialista Agropecuária', email: 'narcisa.nh@vetcare.co.mz', phone: '+258 84 000 0000', location: 'Maputo', status: 'active', experience: '12 anos', specialty: 'Sanidade Animal', photo_url: null },
    { id: 'real-3', name: 'Dr. Feliciano Mazuze', profession: 'Investigador Agrário', email: 'info@iiam.gov.mz', phone: '+258 21 460 219', location: 'Maputo (IIAM)', status: 'active', experience: '20 anos', specialty: 'Investigação e Solo', photo_url: null },
    { id: 'real-4', name: 'Eng. Ricardo Santos', profession: 'Consultor de Agronegócio', email: 'geral@agricultura.gov.mz', phone: '+258 84 343 8999', location: 'Chimoio', status: 'active', experience: '9 anos', specialty: 'Gestão de Cadeias de Valor', photo_url: null },
];

export default function EditProfessionalPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMockData, setIsMockData] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;

            const id = params.id as string;

            // Check if this is a mock/real ID (starts with mock- or real-)
            if (id.startsWith('mock-') || id.startsWith('real-')) {
                const mockItem = MOCK_DATA.find(item => item.id === id);
                if (mockItem) {
                    setData(mockItem);
                    setIsMockData(true);
                }
                setLoading(false);
                return;
            }

            // Otherwise fetch from database
            const { data: professional } = await supabase
                .from('professionals')
                .select('*')
                .eq('id', id)
                .single();

            if (professional) setData(professional);
            setLoading(false);
        };

        fetchData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <p className="text-lg font-medium">Profissional não encontrado.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-6 px-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-black text-slate-800">
                    Editar Profissional
                    {isMockData && <span className="ml-2 text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Dados de Demonstração</span>}
                </h1>
            </div>
            <ProfessionalRegistrationForm initialData={data} isAdmin={true} />
        </div>
    );
}
