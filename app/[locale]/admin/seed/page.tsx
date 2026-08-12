"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const articlesToInsert = [
    {
        title: 'Inadimplência ameaça continuidade do fornecimento de água',
        subtitle: 'Associação dos Fornecedores de Água de Moçambique alerta para crise financeira no sector.',
        content: '<p>A inadimplência atinge principalmente as zonas urbanas e suburbanas, onde a resistência ao pagamento é mais notória. O presidente da AFAM, Cossa, explicou que o cenário piorou significativamente entre Outubro de 2024 e Janeiro de 2025. Apesar de recomendações da Autoridade Reguladora de Águas para interromper os fornecimentos a clientes devedores, a medida tem-se revelado ineficaz, com a taxa de cobrança entre 30 e 40 por cento.</p>',
        type: 'Notícia',
        date: '2025-01-20',
        image_url: 'https://images.unsplash.com/photo-1542601906990-24d4c16419d4?q=80&w=1200&auto=format&fit=crop',
        slug: 'inadimplencia-agua-mocambique-2025',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Produção de GPL vai reforçar energia limpa e combater desmatamento',
        subtitle: 'Ministro dos Recursos Minerais e Energia confirma arranque da unidade de GPL para finais de 2025.',
        content: '<p>A unidade de produção de Gás de Petróleo Liquefeito (GPL) está praticamente concluída e poderá arrancar entre Dezembro de 2025 e os primeiros meses de 2026. O Governo espera reduzir em até 70% a necessidade de importar gás de botija, promovendo a substituição gradual da lenha e do carvão vegetal. O projecto é resultado de um acordo entre o Governo, a ENH e a Sasol no distrito de Inhassoro.</p>',
        type: 'Notícia',
        date: '2025-08-18',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        slug: 'producao-gpl-energia-limpa-mocambique',
        is_featured: true,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Moçambique e Banco Mundial apostam em agricultura sustentável',
        subtitle: 'Nova estratégia abandona subsídios pontuais e foca em projectos estruturais de longo prazo.',
        content: '<p>O Governo de Moçambique e o Banco Mundial estão a definir uma nova etapa de cooperação centrada na produção alimentar, industrialização florestal e sustentabilidade ambiental. O Ministério da Agricultura negocia instrumentos de apoio priorizando a segurança alimentar e a atração de investimento privado, com introdução de sistemas modernos de irrigação e tecnologia agrícola adaptada.</p>',
        type: 'Notícia',
        date: '2025-07-15',
        image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
        slug: 'banco-mundial-agricultura-sustentavel-mocambique-v2',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Moçambique e Zimbábwe lançam projecto transfronteiriço de 3.1M',
        subtitle: 'Iniciativa visa inclusão de pequenos produtores e agro-indústrias via FAO.',
        content: '<p>O projecto será executado em Moçambique pelo Ministério da Economia e Finanças, em parceria com a FAO. O foco está na inclusão de pequenos produtores e agro-indústrias, promovendo uma economia circular e maior integração regional. A governadora de Manica, Francisca Tomás, sublinhou que a iniciativa vai reduzir barreiras comerciais e melhorar a competitividade dos produtos na fronteira.</p>',
        type: 'Internacional',
        date: '2025-07-15',
        image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop',
        slug: 'mocambique-zimbabwe-projecto-transfronteirico',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Transformação agrária: FIDA reforça apoio à agricultura inclusiva',
        subtitle: 'Agricultura emprega 80% da população e deve ser motor da transformação económica.',
        content: '<p>Durante a IV Conferência da ONU sobre Financiamento ao Desenvolvimento, o presidente do FIDA, Álvaro Lario, destacou que a agricultura pode ser um motor da transformação económica. Um novo financiamento de 10 milhões de dólares do Fundo do Ambiente será canalizado para iniciativas de adaptação às mudanças climáticas, com foco na gestão da água e melhoria da qualidade do solo.</p>',
        type: 'Notícia',
        date: '2025-07-03',
        image_url: 'https://images.unsplash.com/photo-1595838788863-70d3c4f8875e?q=80&w=1200&auto=format&fit=crop',
        slug: 'fida-transformacao-agraria-mocambique',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Seguro agrícola passa a integrar política de resiliência climática',
        subtitle: 'Governo quer sistema padronizado para proteger 80% da população que depende do campo.',
        content: '<p>A directora de Políticas e Planificação do Ministério da Agricultura, Nilsa Paúnde, afirmou que o seguro agrário é uma ferramenta central para o desenvolvimento sustentável. O representante do Governo do Reino Unido destacou que o seguro pode facilitar o acesso ao crédito. A criação de um sistema funcional e coerente é vista como passo decisivo para enfrentar as alterações climáticas.</p>',
        type: 'Recursos',
        date: '2025-09-20',
        image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
        slug: 'seguro-agricola-politica-resiliencia',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Fábrica da Huawei em Moçambique pode impulsionar desenvolvimento rural',
        subtitle: 'Nova unidade produzirá aparelhos móveis adaptados à realidade rural.',
        content: '<p>A futura fábrica da Huawei produzirá aparelhos móveis adaptados à realidade rural, onde o acesso à tecnologia permanece limitado. A iniciativa alinha-se com os desígnios de industrialização digital. Durante o fórum ‘Huawei Electric Power Summit 2025’, Moçambique foi apontado como referência na modernização digital do sector eléctrico no continente africano.</p>',
        type: 'Oportunidade',
        date: '2025-06-27',
        image_url: 'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=1200&auto=format&fit=crop',
        slug: 'fabrica-huawei-mocambique-desenvolvimento-rural',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    },
    {
        title: 'Governo lança projecto de reabilitação da Estrada Nacional Nº 1',
        subtitle: 'Plano de 3.5 mil milhões de dólares visa garantir durabilidade da principal via do país.',
        content: '<p>A ANE contratou dois consultores internacionais para elaborar o projecto de reabilitação da EN1. As obras foram divididas em três lotes principais abrangendo Sofala, Zambézia e Cabo Delgado. Já foram assegurados 1.1 mil milhões de dólares com apoio do Banco Mundial para a primeira fase, vital para o escoamento da produção agrícola do norte e centro para o sul.</p>',
        type: 'Notícia',
        date: '2025-06-15',
        image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop',
        slug: 'reabilitacao-estrada-nacional-numero-um',
        is_featured: false,
        source: 'EntreCAMPOS',
        source_url: 'https://entrecampos.co.mz'
    }
];

export default function SeedPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);

    const handleSeed = async () => {
        setLoading(true);
        const logs: string[] = [];

        for (const article of articlesToInsert) {
            try {
                // Check dupes
                const { data: existing } = await supabase.from('articles').select('id').eq('slug', article.slug).single();
                if (existing) {
                    logs.push(`Skipped (Exists): ${article.title}`);
                    continue;
                }

                const { error } = await supabase.from('articles').insert([article]);
                if (error) {
                    logs.push(`Error: ${article.title} - ${error.message}`);
                } else {
                    logs.push(`Success: ${article.title}`);
                }
            } catch (e: any) {
                logs.push(`Exception: ${e.message}`);
            }
        }
        setResults(logs);
        setLoading(false);
        toast.success("Processo terminado!");
    };

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Seed Articles</h1>
            <Button onClick={handleSeed} disabled={loading}>
                {loading ? "Inserting..." : "Insert 5 Articles"}
            </Button>
            <div className="bg-slate-100 p-4 rounded text-xs font-mono space-y-1">
                {results.map((r, i) => <div key={i}>{r}</div>)}
            </div>
        </div>
    );
}
