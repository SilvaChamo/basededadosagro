import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProfessionalProfileClient from './ProfessionalProfileClient';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Mock data integration
const MOCK_DATA = [
    { id: 'mock-1', name: 'Dr. Afonso Henriques', profession: 'Agrónomo Especialista', category: 'Produção Vegetal', email: 'afonso@example.com', phone: '+258 84 123 4567', location: 'Maputo', province: 'Maputo', status: 'active', specialties: 'Culturas de Regadiu, Gestão de Solos', photo_url: null, bio: "Especialista com mais de 15 anos de experiência em Moçambique." },
    { id: 'mock-2', name: 'Eng. Beatriz Costa', profession: 'Veterinária', category: 'Saúde Animal', email: 'beatriz@example.com', phone: '+258 82 987 6543', location: 'Beira', province: 'Sofala', status: 'active', specialties: 'Pecuária, Nutrição Animal', photo_url: null, bio: "Dedicação total à saúde e bem-estar animal no sector produtivo." },
    { id: 'mock-3', name: 'Carlos Manuel', profession: 'Técnico Agrícola', category: 'Mecanização', email: 'carlos@example.com', phone: '+258 85 555 4433', location: 'Nampula', province: 'Nampula', status: 'active', specialties: 'Mecanização, Manutenção preventiva', photo_url: null },
    { id: 'mock-4', name: 'Dra. Elena Silva', profession: 'Gestora de Projectos', category: 'Agronegócio', email: 'elena@agro.co.mz', phone: '+258 87 111 2233', location: 'Chimoio', province: 'Manica', status: 'active', specialties: 'Gestão de Cadeias de Valor, Procurement', photo_url: null },
    { id: 'real-1', name: 'Dra. Anabela Velho', profession: 'Médica Veterinária', category: 'Clínica Veterinária', email: 'vetcare.mz@gmail.com', phone: '+258 84 318 8240', location: 'Maputo (Vetcare)', province: 'Maputo', status: 'active', specialties: 'Clínica de Pequenos Animais', photo_url: null },
    { id: 'real-2', name: 'Eng. Narcisa Nhamitambo', profession: 'Especialista Agropecuária', category: 'Produção Animal', email: 'narcisa.nh@vetcare.co.mz', phone: '+258 84 000 0000', location: 'Maputo', province: 'Maputo', status: 'active', specialties: 'Sanidade Animal', photo_url: null },
    { id: 'real-3', name: 'Dr. Feliciano Mazuze', profession: 'Investigador Agrário', category: 'Investigação', email: 'info@iiam.gov.mz', phone: '+258 21 460 219', location: 'Maputo (IIAM)', province: 'Maputo', status: 'active', specialties: 'Investigação e Solo', photo_url: null },
    { id: 'real-4', name: 'Eng. Ricardo Santos', profession: 'Consultor de Agronegócio', category: 'Consultoria', email: 'geral@agricultura.gov.mz', phone: '+258 84 343 8999', location: 'Chimoio', province: 'Manica', status: 'active', specialties: 'Gestão de Cadeias de Valor', photo_url: null },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;

    let professional;

    if (id.startsWith('mock-') || id.startsWith('real-')) {
        professional = MOCK_DATA.find(p => p.id === id);
    } else {
        const supabase = await createClient();
        const { data } = await supabase
            .from('professionals')
            .select('name, profession, category, bio, photo_url')
            .eq('id', id)
            .maybeSingle();
        professional = data;
    }

    if (!professional) {
        return {
            title: 'Profissional não encontrado',
            description: 'Rede de talentos agrários em Moçambique.'
        };
    }

    // Sem "| Base de Dados Agro" no fim — o template do layout raiz já
    // acrescenta " · Base de Dados Agro".
    const title = `${professional.name} — ${professional.profession || professional.category || 'Profissional agrário'}`;
    const description = professional.bio
        ? professional.bio.substring(0, 160) + (professional.bio.length > 160 ? '…' : '')
        : `Perfil profissional de ${professional.name}, na área de ${professional.category || 'agronegócio'} em Moçambique.`;
    const photo = (professional as { photo_url?: string | null }).photo_url;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'profile',
            ...(photo ? { images: [photo] } : {}),
        },
    };
}

export default async function ProfessionalDetailPage({ params }: PageProps) {
    const { id } = await params;
    let professional;

    if (id.startsWith('mock-') || id.startsWith('real-')) {
        professional = MOCK_DATA.find(p => p.id === id);
    } else {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching professional:', error);
            notFound();
        }
        professional = data;
    }

    if (!professional) {
        notFound();
    }

    return (
        <ProfessionalProfileClient professional={professional} />
    );
}
