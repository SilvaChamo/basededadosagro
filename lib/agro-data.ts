export const MOZ_DATA: Record<string, string[]> = {
    "Maputo Cidade": ["Distrito Urbano 1", "Distrito Urbano 2", "Distrito Urbano 3", "Distrito Urbano 4", "Distrito Urbano 5", "Distrito Urbano 6", "Distrito Urbano 7", "KaMpfumo", "Nlhamankulu", "KaMaxaquene", "KaMavota", "KaMubukwana", "KaTembe", "KaNyaka"],
    "Maputo Província": ["Boane", "Magude", "Manhiça", "Marracuene", "Matola", "Matutuíne", "Moamba", "Namaacha"],
    "Gaza": ["Bilene", "Chibuto", "Chicualacuala", "Chigubo", "Chókwè", "Guijá", "Mabalane", "Manjacaze", "Massangena", "Massingir", "Xai-Xai"],
    "Inhambane": ["Funhalouro", "Govuro", "Homoíne", "Inhambane", "Inharrime", "Inhassoro", "Jangamo", "Mabote", "Massinga", "Maxixe", "Morrumbene", "Panda", "Vilankulo", "Zavala"],
    "Sofala": ["Beira", "Búzi", "Caia", "Chemba", "Cheringoma", "Chibabava", "Dondo", "Gorongosa", "Machanga", "Maringué", "Marromeu", "Muanza", "Nhamatanda"],
    "Manica": ["Bárue", "Chimoio", "Gondola", "Guro", "Macate", "Machaze", "Macossa", "Manica", "Mossurize", "Sussundenga", "Tambara", "Vanduzi"],
    "Tete": ["Angónia", "Cahora-Bassa", "Changara", "Chifunde", "Chiuta", "Dôa", "Macanga", "Magoé", "Marara", "Marávia", "Moatize", "Mutarara", "Tete", "Tsangano", "Zumbo"],
    "Zambézia": ["Alto Molócuè", "Chinde", "Derre", "Gilé", "Gurué", "Ile", "Inhassunge", "Luabo", "Lugela", "Maganja da Costa", "Milange", "Mocubela", "Mocuba", "Mopeia", "Morrumbala", "Mulevala", "Namacurra", "Namarroi", "Nicoadala", "Pebane", "Quelimane"],
    "Nampula": ["Angoche", "Eráti", "Ilha de Moçambique", "Lalaua", "Larde", "Liúpo", "Malema", "Meconta", "Mecubúri", "Memba", "Mogincual", "Mogovolas", "Moma", "Monapo", "Mossuril", "Muecate", "Murrupula", "Nacala-a-Velha", "Nacala-Porto", "Nacarôa", "Nampula", "Rapale", "Ribáuè"],
    "Cabo Delgado": ["Ancuabe", "Balama", "Chiúre", "Ibo", "Macomia", "Mecúfi", "Meluco", "Metuge", "Mocímboa da Praia", "Montepuez", "Mueda", "Muidumbe", "Namuno", "Nangaade", "Palma", "Pemba", "Quissanga"],
    "Niassa": ["Chimbonila", "Cuamba", "Lago", "Lichinga", "Majune", "Mandimba", "Marrupa", "Maúa", "Mavago", "Mecanhelas", "Mecula", "Metarica", "Muembe", "N'gauma", "Sanga"]
};

export const SECTOR_CATEGORIES: Record<string, string[]> = {
    "Agricultura": [
        "Agricultura de precisão",
        "Agricultura orgânica",
        "Agricultura sustentável",
        "Fruticultura",
        "Horticultura",
        "Irrigação",
        "Produção agrícola",
        "Silvicultura",
        "Viveiros",
        "Sustentabilidade agrícola",
        "Floricultura"
    ],
    "Pecuária": [
        "Apicultura",
        "Avicultura",
        "Pecuária",
        "Suinocultura"
    ],
    "Pesca & Aquicultura": [
        "Aquicultura"
    ],
    "Agro-indústria": [
        "Agro-industrial",
        "Agroindústria",
        "Processamento"
    ],
    "Serviços & Consultoria": [
        "Assistência técnica",
        "Certificação agrícola",
        "Consultoria agrícola",
        "Gestão agrícola",
        "Pesquisa agrícola",
        "Planeamento agrícola",
        "Seguros agrícolas",
        "Tecnologia agrícola"
    ],
    "Logística & Comércio": [
        "Insumos Biológicos",
        "Insumos Químicos",
        "Insumos Orgânicos",
        "Insumos Pecuários",
        "Insumos Mecânicos",
        "Insumos Tecnológicos",
        "Infraestruturas e Construção",
        "Armazenagem",
        "Exportação",
        "Transporte agrícola"
    ],
    "Finanças & Investimento": [
        "Crédito agrícola",
        "Seguro rural",
        "Investimentos",
        "Subsídios e Apoios",
        "Linhas de financiamento"
    ],
    "Organizações & Gestão": [
        "Agronegócio",
        "Cooperativas",
        "Segurança alimentar"
    ],
    "Energia": [
        "Energia renovável"
    ]
};

export const SECTORS = Object.keys(SECTOR_CATEGORIES);

export const VALUE_CHAINS = [
    "Produtor", "Consumidor", "Fornecedor", "Prestador de Serviços"
];

// Tipo de estabelecimento — usado no registo público de empresa para
// distinguir supermercados/lojas de outros tipos de negócio. Guardado na
// coluna já existente "registration_type" (mesma que o admin usa para
// Empresa/Loja), sem precisar de nova coluna na base de dados.
export const ESTABLISHMENT_TYPES = [
    "Empresa Agrícola",
    "Supermercado",
    "Indústria",
    "Loja de Insumos",
    "Cooperativa",
    "Distribuidor",
    "Outro",
];

export const COMPANY_DESIGNATIONS = [
    "Empresa Pública",
    "Empresa Privada",
    "Associação",
    "Cooperativa Agrícola",
    "ONG Internacional",
    "Outros"
];

export const COMPANY_SIZES = [
    "Micro Empresa",
    "Pequena Empresa",
    "Média Empresa",
    "Grande Empresa"
];

export const ALL_CATEGORIES = Array.from(
    new Set(
        Object.values(SECTOR_CATEGORIES).flat()
    )
).sort((a, b) => a.localeCompare(b));

export const STORE_CATEGORIES = [
    "Insumos Gerais",
    "Sementes",
    "Fertilizantes",
    "Maquinaria",
    "Peças e Manutenção",
    "Serviços Veterinários",
    "Restauração",
    "Diversos"
];
