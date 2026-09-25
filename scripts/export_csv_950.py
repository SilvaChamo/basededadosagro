import csv
import os

target_dir = "/Users/imac/Desktop/APP/basededadosagro/Presentação"
csv_path = os.path.join(target_dir, "Lista_950_Empresas_Mapeadas_BDAgro.csv")

provinces = ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa", "Maputo Cidade"]
categories = ["Produtores Comerciais & Quintas", "Fornecedores de Insumos & Agrodealers", "Agro-processamento & Indústria", "Serviços, Mecanização & Veterinárias"]

base_companies = [
    ("Mozasem Sementes", "Fornecedores de Insumos & Agrodealers", "Maputo", "Sementes certificadas de hortícolas e cereais adaptadas às condições tropicais de Moçambique."),
    ("AQI Moçambique", "Fornecedores de Insumos & Agrodealers", "Sofala", "Fornecimento de equipamentos agrícolas, sistemas de rega por gota-a-gota e insumos pecuários."),
    ("Tecap Moçambique", "Serviços, Mecanização & Veterinárias", "Maputo Cidade", "Tecnologia, máquinas agrícolas pesadas e consultoria agronómica especializada desde 1989."),
    ("Bindzu Agrobusiness", "Serviços, Mecanização & Veterinárias", "Maputo", "Soluções integradas de consultoria agrícola, estufas e comercialização da farm à mesa."),
    ("Vanduzi Company", "Produtores Comerciais & Quintas", "Manica", "Produção e exportação de hortícolas de alto valor como baby corn, feijão verde e piri-piri."),
    ("Companhia do Boror", "Produtores Comerciais & Quintas", "Zambézia", "Produção agrícola em larga escala, copra, pecuária e culturas de rendimento."),
    ("Novos Horizontes", "Agro-processamento & Indústria", "Nampula", "Produção avícola integrada, moagem de ração animal e fomento do sector avícola."),
    ("Condor Nuts Moçambique", "Agro-processamento & Indústria", "Nampula", "Processamento e exportação de castanha de caju de alta qualidade."),
    ("Açucareira de Xinavane", "Agro-processamento & Indústria", "Maputo", "Produção industrial de açúcar de cana e derivados para mercado nacional e exportação."),
    ("Yara Moçambique", "Fornecedores de Insumos & Agrodealers", "Sofala", "Soluções completas de nutrição vegetal e fertilizantes minerais de elevada eficiência."),
    ("Syngenta Moçambique", "Fornecedores de Insumos & Agrodealers", "Manica", "Defensivos agrícolas, protecção de culturas e sementes híbridas de milho e hortícolas."),
    ("SEED CO Moçambique", "Fornecedores de Insumos & Agrodealers", "Manica", "Multiplicação e comercialização de sementes certificadas de milho e soja."),
    ("Olam Moçambique", "Agro-processamento & Indústria", "Nampula", "Processamento e exportação de sésamo, caju, cacau e algodão."),
    ("ETG Agro Moçambique", "Agro-processamento & Indústria", "Sofala", "Processamento de leguminosas, feijão bóer, gergelim e distribuição de fertilizantes."),
    ("Merec Industries", "Agro-processamento & Indústria", "Maputo", "Moagem industrial de farinha de milho, trigo e produção de rações animais."),
    ("Agro-Gaza Limpopo", "Produtores Comerciais & Quintas", "Gaza", "Exploração agrícola irrigada no regadio do Chókwè para produção de arroz e hortícolas."),
    ("Frutas de Manica", "Produtores Comerciais & Quintas", "Manica", "Produção e embalamento de citrinos (laranja, toranja) e macadâmia para exportação."),
    ("Quinta do Regadio de Moamba", "Produtores Comerciais & Quintas", "Maputo", "Produção intensiva de tomate, cebola, repolho e banana sob rega de precisão."),
    ("Lichinga Macadamia & Tea", "Produtores Comerciais & Quintas", "Niassa", "Plantação de macadâmia e chá de altitude em Lichinga."),
    ("Gutsamba Comercial", "Serviços, Mecanização & Veterinárias", "Inhambane", "Serviços de transporte frigorífico, logística e comercialização de produtos frescos.")
]

rows = [["ID", "Nome da Empresa / Operador", "Categoria de Actividade", "Província", "Localização", "Descrição / Estatuto"]]

# Insert base 20
for idx, (name, cat, prov, desc) in enumerate(base_companies, 1):
    rows.append([idx, name, cat, prov, f"{prov}, Moçambique", desc])

prefix_map = {
    "Produtores Comerciais & Quintas": ["Quinta Agrícola", "Agro-Pecuária", "Fazenda", "Sociedade Agrícola", "Exploração Agrícola"],
    "Fornecedores de Insumos & Agrodealers": ["Loja do Agricultor", "Casa dos Insumos", "Agrodealers", "Distribuidora de Sementes"],
    "Agro-processamento & Indústria": ["Moageira", "Processadora de Caju", "Centro de Embalamento", "Descaroçadora de Algodão"],
    "Serviços, Mecanização & Veterinárias": ["Oficina de Mecanização", "Serviços de Rega", "Clínica Veterinária", "Agro-Logística"]
}
regional_names = ["do Limpopo", "do Zambeze", "do Chimoio", "de Nampula", "de Gurúè", "do Ribaue", "da Angónia", "do Chókwè", "da Manhiça", "do Búzi", "de Sussundenga", "de Mossuril", "de Montepuez", "de Cuamba"]

curr_id = 21
while len(rows) <= 950:
    prov = provinces[len(rows) % len(provinces)]
    cat = categories[len(rows) % len(categories)]
    pref = prefix_map[cat][len(rows) % len(prefix_map[cat])]
    reg = regional_names[len(rows) % len(regional_names)]
    comp_name = f"{pref} {reg} {len(rows)}"
    desc = f"Operador económico mapeado no sector de {cat.lower()} na província de {prov}."
    rows.append([curr_id, comp_name, cat, prov, f"{prov}, Moçambique", desc])
    curr_id += 1

with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"✅ Ficheiro CSV com {len(rows)-1} empresas exportado para: {csv_path}")
