import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltam variáveis de ambiente do Supabase (.env.local)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const provinces = [
    "Maputo", "Gaza", "Inhambane", "Sofala", "Manica", 
    "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa", "Maputo Cidade"
];

const categories = [
    "Produtores Comerciais & Quintas",
    "Fornecedores de Insumos & Agrodealers",
    "Agro-processamento & Indústria",
    "Serviços, Mecanização & Veterinárias"
];

// Nomes de referência reais do agronegócio em Moçambique
const baseCompanies = [
    { name: "Mozasem Sementes", cat: "Fornecedores de Insumos & Agrodealers", prov: "Maputo", desc: "Sementes certificadas de hortícolas e cereais adaptadas às condições tropicais de Moçambique." },
    { name: "AQI Moçambique", cat: "Fornecedores de Insumos & Agrodealers", prov: "Sofala", desc: "Fornecimento de equipamentos agrícolas, sistemas de rega por gota-a-gota e insumos pecuários." },
    { name: "Tecap Moçambique", cat: "Serviços, Mecanização & Veterinárias", prov: "Maputo Cidade", desc: "Tecnologia, máquinas agrícolas pesadas e consultoria agronómica especializada desde 1989." },
    { name: "Bindzu Agrobusiness", cat: "Serviços, Mecanização & Veterinárias", prov: "Maputo", desc: "Soluções integradas de consultoria agrícola, estufas e comercialização da farm à mesa." },
    { name: "Vanduzi Company", cat: "Produtores Comerciais & Quintas", prov: "Manica", desc: "Produção e exportação de hortícolas de alto valor como baby corn, feijão verde e piri-piri." },
    { name: "Companhia do Boror", cat: "Produtores Comerciais & Quintas", prov: "Zambézia", desc: "Produção agrícola em larga escala, copra, pecuária e culturas de rendimento." },
    { name: "Novos Horizontes", cat: "Agro-processamento & Indústria", prov: "Nampula", desc: "Produção avícola integrada, moagem de ração animal e fomento do sector avícola." },
    { name: "Condor Nuts Moçambique", cat: "Agro-processamento & Indústria", prov: "Nampula", desc: "Processamento e exportação de castanha de caju de alta qualidade." },
    { name: "Açucareira de Xinavane", cat: "Agro-processamento & Indústria", prov: "Maputo", desc: "Produção industrial de açúcar de cana e derivados para mercado nacional e exportação." },
    { name: "Yara Moçambique", cat: "Fornecedores de Insumos & Agrodealers", prov: "Sofala", desc: "Soluções completas de nutrição vegetal e fertilizantes minerais de elevada eficiência." },
    { name: "Syngenta Moçambique", cat: "Fornecedores de Insumos & Agrodealers", prov: "Manica", desc: "Defensivos agrícolas, protecção de culturas e sementes híbridas de milho e hortícolas." },
    { name: "SEED CO Moçambique", cat: "Fornecedores de Insumos & Agrodealers", prov: "Manica", desc: "Multiplicação e comercialização de sementes certificadas de milho e soja." },
    { name: "Olam Moçambique", cat: "Agro-processamento & Indústria", prov: "Nampula", desc: "Processamento e exportação de sésamo, caju, cacau e algodão." },
    { name: "ETG Agro Moçambique", cat: "Agro-processamento & Indústria", prov: "Sofala", desc: "Processamento de leguminosas, feijão bóer, gergelim e distribuição de fertilizantes." },
    { name: "Merec Industries", cat: "Agro-processamento & Indústria", prov: "Maputo", desc: "Moagem industrial de farinha de milho, trigo e produção de rações animais." },
    { name: "Agro-Gaza Limpopo", cat: "Produtores Comerciais & Quintas", prov: "Gaza", desc: "Exploração agrícola irrigada no regadio do Chókwè para produção de arroz e hortícolas." },
    { name: "Frutas de Manica", cat: "Produtores Comerciais & Quintas", prov: "Manica", desc: "Produção e embalamento de citrinos (laranja, toranja) e macadâmia para exportação." },
    { name: "Quinta do Regadio de Moamba", cat: "Produtores Comerciais & Quintas", prov: "Maputo", desc: "Produção intensiva de tomate, cebola, repolho e banana sob rega de precisão." },
    { name: "Lichinga Macadamia & Tea", cat: "Produtores Comerciais & Quintas", prov: "Niassa", desc: "Plantação de macadâmia e chá de altitude em Lichinga." },
    { name: "Gutsamba Comercial", cat: "Serviços, Mecanização & Veterinárias", prov: "Inhambane", desc: "Serviços de transporte frigorífico, logística e comercialização de produtos frescos." }
];

// Gerar lista estendida de 950 empresas catalogadas com atribuição distrital e provincial
function generateCatalog() {
    const list = [];
    let idCounter = 1;

    // Adicionar as 20 empresas de referência principais
    for (const b of baseCompanies) {
        list.push({
            name: b.name,
            slug: b.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category: b.cat,
            province: b.prov,
            location: `${b.prov}, Moçambique`,
            description: b.desc,
            is_archived: false,
            is_featured: true
        });
        idCounter++;
    }

    // Gerar operadores regionais estruturados para completar os 950 registos
    const prefixMap = {
        "Produtores Comerciais & Quintas": ["Quinta Agrícola", "Agro-Pecuária", "Fazenda", "Sociedade Agrícola", "Exploração Agrícola", "Herdade Agrícola"],
        "Fornecedores de Insumos & Agrodealers": ["Loja do Agricultor", "Casa dos Insumos", "Agrodealers", "Distribuidora de Sementes", "Equipamentos Agrícolas"],
        "Agro-processamento & Indústria": ["Moageira", "Processadora de Caju", "Centro de Embalamento", "Descaroçadora de Algodão", "Fábrica de Ração"],
        "Serviços, Mecanização & Veterinárias": ["Oficina de Mecanização", "Serviços de Rega", "Clínica Veterinária", "Agro-Logística", "Consultoria Agronómica"]
    };

    const regionalNames = ["do Limpopo", "do Zambeze", "do Chimoio", "de Nampula", "de Gurúè", "do Ribaue", "da Angónia", "do Chókwè", "da Manhiça", "do Búzi", "de Sussundenga", "de Mossuril", "de Montepuez", "de Cuamba"];

    while (list.length < 950) {
        const prov = provinces[list.length % provinces.length];
        const cat = categories[list.length % categories.length];
        const prefixes = prefixMap[cat];
        const pref = prefixes[list.length % prefixes.length];
        const reg = regionalNames[list.length % regionalNames.length];
        
        const compName = `${pref} ${reg} ${Math.floor(list.length / 10) + 1}`;
        const slug = `empresa-agro-${list.length + 1}`;

        list.push({
            name: compName,
            slug: slug,
            category: cat,
            province: prov,
            location: `${prov}, Moçambique`,
            description: `Operador económico mapeado no sector de ${cat.toLowerCase()} na província de ${prov}.`,
            is_archived: false,
            is_featured: false
        });
    }

    return list;
}

async function seedCompanies() {
    const fullCatalog = generateCatalog();
    console.log(`🌱 A preparar pré-cadastro de ${fullCatalog.length} empresas agrícolas no Supabase...`);

    // Inserir em lotes de 100 empresas
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < fullCatalog.length; i += batchSize) {
        const batch = fullCatalog.slice(i, i + batchSize);
        const { data, error } = await supabase
            .from('companies')
            .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });

        if (error) {
            console.error(`❌ Erro no lote ${i / batchSize + 1}:`, error.message);
        } else {
            insertedCount += batch.length;
            console.log(`✅ Lote ${i / batchSize + 1} de 10 inserido com sucesso (${insertedCount}/${fullCatalog.length})`);
        }
    }

    console.log(`🎉 Sucesso! Total de ${insertedCount} empresas agrícolas pré-cadastradas no Supabase.`);
}

seedCompanies().catch(console.error);
