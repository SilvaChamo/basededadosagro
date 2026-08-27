import {
    Building2, ShoppingBag, Users, FileText, Tractor, Sprout,
    FlaskConical, Droplets, Bug, Truck, Cpu, Warehouse,
    Plane, Snowflake, Stethoscope, Briefcase, User, UserCog,
    Leaf, Globe, Bolt, Flower2, Landmark, Coins, Factory,
    Ship, FileLineChart, CloudSun, BookOpen, FileDigit,
    Home, Map, LandPlot, Microscope, Wheat, TreePalm,
    Thermometer, Mountain, Shovel, Boxes, Receipt, BarChart
} from "lucide-react";

export type Company = {
    id: string;
    slug?: string;
    name: string;
    tag: string;
    description: string;
    logoUrl: string;
    type: string;
    image?: string;
    isVerified?: boolean;
    bio?: string;
    activity?: string;
    province?: string;
    valueChain?: string;
};

// Categorias de notícias: única fonte de verdade partilhada entre os filtros
// do blog (app/[locale]/blog/page.tsx) e o seletor de categorias do editor
// de notícias (components/admin/ArticleForm.tsx). Mantém as duas listas
// sempre iguais — sem isto, uma notícia com uma categoria só presente no
// editor mas ausente aqui nunca aparece filtrada no blog.
export const NEWS_CATEGORIES = [
    "Notícia",
    "Internacional",
    "Guia",
    "Evento",
    "Oportunidade",
    "Curiosidade",
    "Recursos",
    "Mulher Agro",
    "Ambiente",
    "Mercado",
];

// Tipos que pertencem à secção Documentos (basededados.articles.type) —
// única fonte de verdade partilhada entre admin/noticias (para excluir
// estes tipos de "Todas as Notícias") e admin/documentos (para os filtros
// por separador). Inclui variantes antigas/minúsculas já usadas na base de
// dados para não perder documentos existentes.
export const DOCUMENT_TYPES = [
    "Relatório", "Relatórios",
    "Legislação", "Política Agrária", "Políticas Agrárias",
    "Documento", "document", "PDF", "Artigo Técnico",
];

// Categorias de documentos: única fonte de verdade para o seletor de
// categorias do editor de Documentos (components/admin/DocumentForm.tsx) —
// nunca deve incluir categorias de Notícias (ver NEWS_CATEGORIES), mesmo
// partilhando a tabela `articles`.
export const DOCUMENT_CATEGORIES = [
    "Relatório",
    "Legislação",
    "Política Agrária",
    "Documento",
    "Artigo Técnico",
];

export const COMPANY_CATEGORIES = [
    "Agricultura de precisão",
    "Agricultura orgânica",
    "Agricultura sustentável",
    "Agro-industrial",
    "Agroindústria",
    "Agronegócio",
    "Apicultura",
    "Aquicultura",
    "Armazenagem",
    "Assistência técnica",
    "Avicultura",
    "Certificação agrícola",
    "Consultoria agrícola",
    "Cooperativas",
    "Crédito agrícola",
    "Energia renovável",
    "Exportação",
    "Financiamento",
    "Floricultura",
    "Fruticultura",
    "Gestão agrícola",
    "Horticultura",
    "Insumos agrícolas",
    "Investimento agrícola",
    "Irrigação",
    "Máquinas/equipamento",
    "Pecuária",
    "Pesquisa agrícola",
    "Planeamento agrícola",
    "Processamento",
    "Produção agrícola",
    "Segurança alimentar",
    "Seguros agrícolas",
    "Silvicultura",
    "Suinocultura",
    "Sustentabilidade agrícola",
    "Tecnologia agrícola",
    "Transporte agrícola",
    "Viveiros"
];

export const PROVINCES = [
    "Maputo Cidade",
    "Maputo Província",
    "Gaza",
    "Inhambane",
    "Manica",
    "Sofala",
    "Tete",
    "Zambézia",
    "Nampula",
    "Niassa",
    "Cabo Delgado"
];

export const FEATURED_COMPANIES: Company[] = [
    {
        id: '1',
        name: 'Ministerio de agricultura',
        tag: 'Legislação e politicas agrárias',
        description: 'Gestão governamental e normas.',
        logoUrl: 'https://placehold.co/100x60/054a29/fff?text=MINAG',
        type: 'Empresa pública',
        image: 'https://placehold.co/600x400/054a29/white?text=Agricultura'
    },
    {
        id: '4',
        name: 'Milenium BIM',
        tag: 'Financiamento agrário',
        description: 'Crédito para produtores.',
        logoUrl: 'https://placehold.co/100x60/054a29/fff?text=BIM',
        type: 'Financiamento',
        image: 'https://placehold.co/600x400/054a29/white?text=Financas'
    }
];

export const SEARCH_DATA = {
    produtos: [
        { title: 'Carne Bovina Premium', sub: 'Pecuária de Corte - 100% Orgânica', icon: Building2, image: 'https://images.unsplash.com/photo-1620993512803-b09e4bd373ce?q=80&w=800&auto=format&fit=crop' },
        { title: 'Trator Magnat 5000', sub: 'Máquinas Agrícolas de alta potência', icon: Tractor, image: 'https://images.unsplash.com/photo-1595166687295-8a24558e8055?q=80&w=800&auto=format&fit=crop' },
        { title: 'Sementes de Milho Híbrido', sub: 'Resistente a secas e pragas', icon: Sprout, image: 'https://images.unsplash.com/photo-1634839818821-6fcc1362e453?q=80&w=800&auto=format&fit=crop' },
        { title: 'Fertilizante Nitrogenado XP', sub: 'Nutrição intensiva para solos pobres', icon: FlaskConical, image: 'https://images.unsplash.com/photo-1628173516104-aa263884cb95?q=80&w=800&auto=format&fit=crop' },
        { title: 'Kit de Irrigação Gota-a-Gota', sub: 'Economia de 40% de água', icon: Droplets, image: 'https://images.unsplash.com/photo-1596707323533-5c74384a3c1e?q=80&w=800&auto=format&fit=crop' },
        { title: 'Pesticida Bio-Verde', sub: 'Controlo de pragas sem químicos tóxicos', icon: Bug, image: 'https://images.unsplash.com/photo-1587049488737-2954a7f92021?q=80&w=800&auto=format&fit=crop' },
        { title: 'Camião Agrário 15T', sub: 'Transporte pesado para colheitas', icon: Truck, image: 'https://images.unsplash.com/photo-1522033626293-1b07223b2049?q=80&w=800&auto=format&fit=crop' },
        { title: 'Sensores de Humidade IoT', sub: 'Tecnologia agrícola de precisão', icon: Cpu, image: 'https://images.unsplash.com/photo-1581093588401-fbb0739829ff?q=80&w=800&auto=format&fit=crop' },
        { title: 'Silo Metálico 500 Ton', sub: 'Armazenamento seguro de cereais', icon: Warehouse, image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb77c3a9?q=80&w=800&auto=format&fit=crop' },
        { title: 'Drones Pulverizadores', sub: 'Aplicação aérea de precisão', icon: Plane, image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop' }
    ],
    profissionais: [
        { title: 'Eng. Carlos Mondlane', sub: 'Engenheiro Agrícola - Esp. em Hidráulica', icon: UserCog, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { title: 'Dra. Ana Paula', sub: 'Veterinária - Especialista em Grandes Animais', icon: Stethoscope, image: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { title: 'Sr. João Muchanga', sub: 'Consultor Agrário - Gestão de Projectos', icon: Briefcase, image: 'https://randomuser.me/api/portraits/men/85.jpg' },
        { title: 'Téc. Ricardo Silva', sub: 'Extensionista Rural - Apoio a Cooperativas', icon: Users, image: 'https://randomuser.me/api/portraits/men/11.jpg' },
        { title: 'Dr. Samuel Chivambo', sub: 'Investigador - Biotecnologia de Solos', icon: FlaskConical, image: 'https://randomuser.me/api/portraits/men/62.jpg' },
        { title: 'Marta Sitoe', sub: 'Gestora Agrícola - Especialista em Agronegócio', icon: User, image: 'https://randomuser.me/api/portraits/women/65.jpg' },
        { title: 'José Langa', sub: 'Técnico Agrícola - Operador de Máquinas', icon: Tractor, image: 'https://randomuser.me/api/portraits/men/3.jpg' },
        { title: 'Agrónomo Pedro Tembe', sub: 'Especialista em Culturas de Sequeiro', icon: Leaf, image: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { title: 'Eng. Lucas Nhaca', sub: 'Especialista em Energias Renováveis no Campo', icon: Bolt, image: 'https://randomuser.me/api/portraits/men/55.jpg' },
        { title: 'Téc. Helena Vilanculos', sub: 'Especialista em Floricultura Exportação', icon: Flower2, image: 'https://randomuser.me/api/portraits/women/29.jpg' }
    ],
    empresas: [
        { title: 'AgroMoçambique Lda', sub: 'Agro-negócio - Produção de Frutas', icon: Building2, location: 'Maputo', logo: 'https://placehold.co/100x100/22c55e/ffffff?text=AGRO' },
        { title: 'Cooperativa Boa Esperança', sub: 'Agro-negócio - Pequenos Produtores', icon: Users, location: 'Gaza', logo: 'https://placehold.co/100x100/f97316/ffffff?text=CBE' },
        { title: 'Instituto de Investigação Agrária', sub: 'Tecnologia - Ciência Agrária', icon: Landmark, location: 'Maputo', logo: 'https://placehold.co/100x100/0f172a/ffffff?text=IIAM' },
        { title: 'Fundação Rural Crescer', sub: 'Agro-negócio - Microcrédito Rural', icon: Coins, location: 'Nampula', logo: 'https://placehold.co/100x100/3b82f6/ffffff?text=FRC' },
        { title: 'Grains Moz Holding', sub: 'Indústria - Processamento de Cereais', icon: Factory, location: 'Manica', logo: 'https://placehold.co/100x100/eab308/ffffff?text=GMH' },
        { title: 'Centro Logístico da Beira', sub: 'Indústria - Terminais de Carga', icon: Ship, location: 'Sofala', logo: 'https://placehold.co/100x100/64748b/ffffff?text=CLB' },
        { title: 'MozFertil S.A.', sub: 'Fertilizantes - Produção Local', icon: FlaskConical, location: 'Tete', logo: 'https://placehold.co/100x100/a855f7/ffffff?text=MOZF' },
        { title: 'Logística do Niassa', sub: 'Indústria - Transporte de Milho', icon: Truck, location: 'Niassa', logo: 'https://placehold.co/100x100/84cc16/ffffff?text=LOGN' },
        { title: 'BioSeeds Moçambique', sub: 'Insumos - Sementes Nativas', icon: Sprout, location: 'Inhambane', logo: 'https://placehold.co/100x100/10b981/ffffff?text=BIOS' },
        { title: 'Mecanização de Gaza', sub: 'Máquinas - Aluguer de Equipamento', icon: Tractor, location: 'Gaza', logo: 'https://placehold.co/100x100/f59e0b/ffffff?text=MECA' }
    ],
    artigos: [
        { title: 'Estudo sobre Variedades de Arroz', sub: 'Publicado por IIAM - 2023', icon: FileLineChart, image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop' },
        { title: 'Impacto Climático no Chokwé', sub: 'Revista Científica de Agronomia', icon: CloudSun, image: 'https://images.unsplash.com/photo-1595837346853-2777174668ba?q=80&w=800&auto=format&fit=crop' },
        { title: 'Conservação de Tomate', sub: 'Guia Prático para Agricultores', icon: BookOpen, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop' },
        { title: 'Manual de Mecanização FAO', sub: 'Documento Técnico de Fomento', icon: FileDigit, image: 'https://images.unsplash.com/photo-1517429676770-49666c5fa540?q=80&w=800&auto=format&fit=crop' },
        { title: 'Evolução dos Preços do Açúcar', sub: 'Relatório Semestral de Mercado', icon: BarChart, image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop' },
        { title: 'Pragas de Citrinos em Manica', sub: 'Boletim de Alerta Fitossanitário', icon: Bug, image: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?q=80&w=800&auto=format&fit=crop' },
        { title: 'Guia de Fertirrigação Moderno', sub: 'Manual de Eficiência Hídrica', icon: Droplets, image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=800&auto=format&fit=crop' },
        { title: 'Políticas para o Pequeno Produtor', sub: 'Análise Legislativa 2024', icon: Receipt, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop' },
        { title: 'Zonamento Agrário do Norte', sub: 'Atlas de Potencial Agro-ecológico', icon: Map, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop' },
        { title: 'Armazenamento Pós-colheita', sub: 'Melhores Práticas para Silos', icon: Boxes, image: 'https://images.unsplash.com/photo-1563200958-38448ea92c57?q=80&w=800&auto=format&fit=crop' }
    ],
    propriedades: [
        { title: 'Fazenda Vale do Limpopo', sub: '500 Hectares - Produção de Cereais', icon: LandPlot, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop' },
        { title: 'Quinta das Oliveiras', sub: 'Área de Regadio - Horticultura', icon: Home, image: 'https://images.unsplash.com/photo-1512395563583-b78fc440a34e?q=80&w=800&auto=format&fit=crop' },
        { title: 'Herdade do Sol', sub: 'Pecuária e Pastagens - Gaza', icon: Warehouse, image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?q=80&w=800&auto=format&fit=crop' },
        { title: 'Terras Altas de Manica', sub: 'Ideal para Fruticultura', icon: Map, image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=800&auto=format&fit=crop' },
        { title: 'Plantação de Eucaliptos', sub: 'Reflorestamento e Papel - Niassa', icon: TreePalm, image: 'https://images.unsplash.com/photo-1503785640985-f62e3aeee448?q=80&w=800&auto=format&fit=crop' },
        { title: 'Horta Comunitária Namaacha', sub: 'Produção Biológica Local', icon: Wheat, image: 'https://images.unsplash.com/photo-1591857177580-dc82b9e4e119?q=80&w=800&auto=format&fit=crop' },
        { title: 'Pomar de Mangas e Citrinos', sub: 'Certificado GlobalG.A.P - Inhambane', icon: Flower2, image: 'https://images.unsplash.com/photo-1546268060-9092906b1c15?q=80&w=800&auto=format&fit=crop' },
        { title: 'Centro de Formação Rural', sub: 'Campo Experimental - Boane', icon: Microscope, image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=800&auto=format&fit=crop' },
        { title: 'Área de Concessão Algodoeira', sub: 'Exploração de Grandes Extensões', icon: Leaf, image: 'https://images.unsplash.com/photo-1508920551061-0f7f32958742?q=80&w=800&auto=format&fit=crop' },
        { title: 'Pastos do Chimoio', sub: 'Criação de Pequenos Ruminantes', icon: Mountain, image: 'https://images.unsplash.com/photo-1494553424160-f1c5c567a508?q=80&w=800&auto=format&fit=crop' }
    ]
};
