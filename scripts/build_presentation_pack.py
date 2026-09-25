import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

def set_cell_bg(cell, hex_color):
    """Define a cor de fundo de uma célula"""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def apply_doc_formatting(doc):
    """Aplica margens e estilo padrão (Times New Roman 11pt Justificado)"""
    for section in doc.sections:
        section.top_margin = Inches(1.18)      # ~3cm
        section.bottom_margin = Inches(0.79)   # ~2cm
        section.left_margin = Inches(1.18)     # ~3cm
        section.right_margin = Inches(0.79)    # ~2cm
    
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x11, 0x18, 0x27)

def add_h1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x05, 0x47, 0x36) # Verde Agrícola Institucional
    return p

def add_h2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(7)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0xD9, 0x6B, 0x27) # Laranja Terra
    return p

def add_p(doc, text, bold_prefix="", space_after=3.5, italic=False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(space_after)
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Times New Roman'
        r_b.font.bold = True
        r_b.font.size = Pt(11)
    r_t = p.add_run(text)
    r_t.font.name = 'Times New Roman'
    r_t.font.size = Pt(11)
    r_t.font.italic = italic
    return p

def add_callout(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.right_indent = Inches(0.2)
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.italic = True
    r.font.color.rgb = RGBColor(0x05, 0x47, 0x36)
    return p

def add_image_centered(doc, img_path, caption_text="", width_in=5.8):
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run()
        run.add_picture(img_path, width=Inches(width_in))
        
        if caption_text:
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(6)
            r_cap = p_cap.add_run(caption_text)
            r_cap.font.name = 'Times New Roman'
            r_cap.font.size = Pt(9.5)
            r_cap.font.italic = True
            r_cap.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

# Target Output Directory
target_dir = "/Users/imac/Desktop/APP/basededadosagro/Presentação"
img_dir = "/Users/imac/Desktop/APP/basededadosagro/Presentação/_images"

pie_path = os.path.join(img_dir, "grafico_operadores_pizza.png")
gantt_path = os.path.join(img_dir, "grafico_roteiro_gantt.png")

# ==============================================================================
# DOC 1: NOTA INFORMATIVA INTEGRADA COM IMAGENS EMBUTIDAS (Nota_Informativa_MADER_FARIP.docx)
# ==============================================================================
def generate_nota_informativa():
    doc = Document()
    apply_doc_formatting(doc)

    # CABEÇALHO OFICIAL
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_top.paragraph_format.space_after = Pt(2)
    r_top = p_top.add_run("ENTRECAMPOS — SERVIÇOS E TECNOLOGIA, LDA.\nBASE DE DADOS AGRO MOÇAMBIQUE\n")
    r_top.font.bold = True
    r_top.font.size = Pt(9.5)
    r_top.font.color.rgb = RGBColor(0x05, 0x47, 0x36)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("NOTA INFORMATIVA DE REUNIÃO DE TRABALHO")
    r_title.font.size = Pt(14)
    r_title.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run("PROPOSTA DE PARCERIA E MAPEAMENTO DIGITAL UNIFICADO DO SECTOR AGRÁRIO MOÇAMBICANO")
    r_sub.font.size = Pt(10.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0xD9, 0x6B, 0x27)

    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("PARA:", "Direcção Geral do MADER & Fundo de Desenvolvimento Agrário (FAR, IP)"),
        ("DE:", "Silva Chamo — Director Geral da EntreCAMPOS / Promotor da Base de Dados Agro"),
        ("ASSUNTO:", "Parceria Institucional para Validação do Mapeamento Digital do Sector Agrário"),
        ("DATA:", "Setembro de 2026 | Maputo, Moçambique")
    ]
    for i, (label, val) in enumerate(meta_data):
        row = meta_table.rows[i]
        c1, c2 = row.cells[0], row.cells[1]
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(label)
        r1.font.bold = True
        r1.font.size = Pt(10)
        p1.paragraph_format.space_after = Pt(1)
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(val)
        r2.font.size = Pt(10)
        p2.paragraph_format.space_after = Pt(1)

    # 1. CONTEXTUALIZAÇÃO E ENQUADRAMENTO INSTITUCIONAL
    add_h1(doc, "1. CONTEXTUALIZAÇÃO E ENQUADRAMENTO INSTITUCIONAL")
    add_p(doc, " A plataforma Base de Dados Agro surge para responder a uma lacuna estrutural no agronegócio moçambicano: a dispersão de dados e a ausência de um registo digital unificado, centralizado e pesquisável dos intervenientes de toda a cadeia de valor agrícola nacional. A proliferação de iniciativas desarticuladas tem dificultado a fiscalização, a monitorização de programas públicos e o acesso rápido a informações de mercado fidedignas.")
    add_p(doc, " O projecto alinha-se directamente com as directrizes estratégicas do PEDSA II (Plano Estratégico de Desenvolvimento do Sector Agrário) e do PNISA II (Plano Nacional de Investimento do Sector Agrário), bem como com os apelos governamentais para a modernização tecnológica e digitalização do campo. Destacam-se, a este propósito, as prioridades vincadas recentemente pelo Presidente da República na abertura da 61.ª edição da FACIM 2026, que exortou a urgência do uso da tecnologia como catalisador da produtividade, transparência e industrialização do sector agrário moçambicano.")

    # 2. DIMENSÃO ACTUAL E INDICADORES CHAVE DO SECTOR
    add_h1(doc, "2. DIMENSÃO ACTUAL E INDICADORES CHAVE DO SECTOR")
    add_p(doc, " Para demonstrar a robustez e a utilidade prática do ecossistema, o levantamento efectivado consolida os indicadores oficiais macroeconómicos e a amostragem real do tecido empresarial privado:")
    add_p(doc, "• Enquadramento da Estrutura Agrária: Em Moçambique, a base da agricultura é maioritariamente familiar e de subsistência (abrangendo cerca de 4 milhões de explorações familiares). Todavia, ao analisar o sector empresarial e comercial registado, estimam-se cerca de 2.000 empresas e operadores económicos activos a atuar no mercado nacional.")
    add_p(doc, "• Directório de Empresas (Amostra Representativa): A plataforma conta actualmente com mais de 950 empresas activas cadastradas no mercado nacional (fornecedores de insumos agrícolas, tecnologia agrária, consultoria, agro-processamento e serviços conexos). Este número reflete o directório activo da plataforma, servindo como uma amostra representativa e actualizada (~47%) dos intervenientes do sector privado comercial em Moçambique.")

    # Tabela 1: Indicadores Macroeconómicos Oficiais
    p_t1 = doc.add_paragraph()
    p_t1.paragraph_format.space_before = Pt(4)
    p_t1.paragraph_format.space_after = Pt(2)
    r_t1 = p_t1.add_run("Tabela 1: Desempenho Macroeconómico Oficial do Sector Agrário (2025/2026)")
    r_t1.font.bold = True
    r_t1.font.size = Pt(10)
    r_t1.font.color.rgb = RGBColor(0x05, 0x47, 0x36)

    table_stats = doc.add_table(rows=4, cols=3)
    table_stats.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Indicador Macroeconómico", "Valor Oficial (2025/2026)", "Fonte Institucional & Impacto"]
    hdr_cells = table_stats.rows[0].cells
    for j, h_text in enumerate(headers):
        set_cell_bg(hdr_cells[j], "054736")
        p = hdr_cells[j].paragraphs[0]
        r = p.add_run(h_text)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    stats_rows = [
        ("Produção Agrária Nacional", "20M+ de Toneladas (+5% cresc.)", "MADER / INE — Crescimento contínuo no campo."),
        ("PIB Agrícola Nacional", "91.4 Mil Milhões MZN (~24% PIB)", "INE (Contas Nacionais Q2) — Motor económico."),
        ("Emprego Agrícola", "70% da Força Laboral Nacional", "INE / CAP — Sustento da maioria da população.")
    ]
    for i, (c1, c2, c3) in enumerate(stats_rows):
        row_cells = table_stats.rows[i+1].cells
        if i % 2 == 1:
            for cell in row_cells:
                set_cell_bg(cell, "F9FAFB")
        for j, val in enumerate([c1, c2, c3]):
            p = row_cells[j].paragraphs[0]
            p.paragraph_format.space_after = Pt(1.5)
            p.paragraph_format.space_before = Pt(1.5)
            r = p.add_run(val)
            r.font.size = Pt(9.5)

    # INSERÇÃO DO GRÁFICO DE PIZZA EMBUTIDO (IMAGEM ANEXA 1)
    add_image_centered(
        doc, 
        pie_path, 
        caption_text="Figura 1: Distribuição Estimada dos 950+ Operadores Mapeados por Categoria (Gráfico Circular)", 
        width_in=5.5
    )

    # 3. INOVAÇÕES TECNOLÓGICAS E FERRAMENTAS PRÁTICAS
    add_h1(doc, "3. INOVAÇÕES TECNOLÓGICAS E FERRAMENTAS PRÁTICAS DA PLATAFORMA")
    add_p(doc, "A plataforma disponibiliza recursos digitais avançados desenhados para apoiar directamente o trabalho no terreno dos produtores, técnicos e extensionistas do MADER:")
    add_p(doc, "• Scanner Inteligente e Doctor Plants (AgroBotanica AI): Ferramentas baseadas em inteligência artificial computacional que permitem identificar pragas, doenças nas culturas e o valor nutritivo das plantas em segundos, através da câmara do telemóvel.")
    add_p(doc, "• Geolocalização de Insumos e Serviços: Sistema georeferenciado que facilita a localização de fornecedores próximos por província e distrito, permitindo comparar preços, especificações técnicas e variações de produtos no mercado em tempo real.")
    add_p(doc, "• Repositório e Transparência de Mercado: Espaço centralizado de consulta de notícias, cotações de mercado em tempo real (SIMA/IPC), bibliografias técnicas e avisos institucionais do sector.")

    # 4. OPORTUNIDADES DE PARCERIA COM O MADER / FAR, IP
    add_h1(doc, "4. OPORTUNIDADES DE PARCERIA E EIXOS DE COOPERAÇÃO COM O MADER / FAR, IP")
    add_p(doc, "A cooperação institucional visa potenciar a eficiência das políticas públicas através dos seguintes eixos de acção:")
    add_p(doc, "1. Validação e Apoio a Programas Públicos: Servir de base de consulta fiável para a constituição de listas de fornecedores e prestadores de serviços certificados para os programas de fomento e subsídio geridos pelo FAR, IP (ex: Programa Sustenta).")
    add_p(doc, "2. Monitorização e Transparência Operacional: Apoiar na mitigação de desvios, duplicações e na verificação rigorosa de operadores económicos elegíveis no ecossistema agrário.")
    add_p(doc, "3. Difusão Directa de Políticas e Editais: Utilizar a plataforma como canal directo de comunicação massiva (Web, Email e SMS) para divulgar avisos públicos, linhas de financiamento, legislação e iniciativas governamentais junto dos operadores do sector.")

    # 5. GANHOS INSTITUCIONAIS IMEDIATOS PARA O ESTADO
    add_h1(doc, "5. GANHOS INSTITUCIONAIS IMEDIATOS PARA O ESTADO")
    add_p(doc, "• Isenção de Custos Orçamentais: A infraestrutura tecnológica encontra-se totalmente desenvolvida e pronta para operação, sem acarretar qualquer encargo financeiro para os cofres do Estado.")
    add_p(doc, "• Fortalecimento do Extensionismo Agrário: Os extensionistas passam a dispor de um catálogo digital portátil de insumos e ferramentas de auxílio ao diagnóstico fitossanitário no campo.")
    add_p(doc, "• Rastreabilidade e Dados Auditáveis: Garantia de dados consolidados para apoiar a tomada de decisão política do Ministério.")

    # 6. DECLARAÇÃO ESTRATÉGICA DE PARCERIA
    add_h1(doc, "6. DECLARAÇÃO ESTRATÉGICA DE POSICIONAMENTO E COOPERAÇÃO")
    add_callout(doc, "“Nós, na EntreCAMPOS, já fizemos o trabalho pesado de pesquisar e catalogar 950 das cerca de 2.000 empresas formais do país. Com a parceria institucional do MADER e do FAR, IP, pretendemos validar e auditar este universo inicial e alcançar as restantes 1.000 empresas, com o objectivo de dotar Moçambique do seu primeiro Mapa Digital com 100% dos operadores do agronegócio integrados.”")

    # 7. ROTEIRO DE COOPERAÇÃO E CRONOGRAMA DE IMPLEMENTAÇÃO (Da imagem do Gantt)
    add_h1(doc, "7. ROTEIRO DE COOPERAÇÃO E CRONOGRAMA DE IMPLEMENTAÇÃO")
    add_p(doc, "Para operacionalizar a parceria com total segurança técnica e institucional, propõe-se a execução do seguinte roteiro cronológico de acções:")

    # INSERÇÃO DO GRÁFICO GANTT EMBUTIDO (IMAGEM ANEXA 2)
    add_image_centered(
        doc, 
        gantt_path, 
        caption_text="Figura 2: Roteiro de Cooperação MADER / FAR, IP & EntreCAMPOS (Gráfico Gantt da Linha de Tempo)", 
        width_in=5.8
    )

    # 8. FECHO E ASSINATURA FORMAL
    p_close = doc.add_paragraph()
    p_close.paragraph_format.space_before = Pt(12)
    p_close.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c1 = p_close.add_run("Maputo, Setembro de 2026\n\n\n__________________________________________________\n")
    r_c1.font.size = Pt(10.5)
    r_c2 = p_close.add_run("SILVA CHAMO\n")
    r_c2.font.bold = True
    r_c2.font.size = Pt(11)
    r_c3 = p_close.add_run("Director Geral da EntreCAMPOS / Promotor da Base de Dados Agro\nContacto: +258 87 75 75 288 | E-mail: geral@basededadosagro.com")
    r_c3.font.size = Pt(9.5)
    r_c3.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    path = os.path.join(target_dir, "Nota_Informativa_MADER_FARIP.docx")
    doc.save(path)
    print(f"✅ Nota Informativa com Imagens Gerada: {path}")

# ==============================================================================
# DOC 4: DOCUMENTO DA LISTA DAS 950 EMPRESAS MAPEADAS (Lista_950_Empresas_Mapeadas_BDAgro.docx)
# ==============================================================================
def generate_950_companies_doc():
    doc = Document()
    apply_doc_formatting(doc)

    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_top = p_top.add_run("ENTRECAMPOS — REPOSITÓRIO NACIONAL DE OPERADORES AGRÁRIOS\n")
    r_top.font.bold = True
    r_top.font.size = Pt(10)
    r_top.font.color.rgb = RGBColor(0x05, 0x47, 0x36)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("CATÁLOGO E LISTAGEM DE 950 EMPRESAS AGRÍCOLAS MAPEADAS")
    r_title.font.size = Pt(14)
    r_title.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("AMOSTRA REPRESENTATIVA DO SECTOR PRIVADO COMERCIAL EM MOÇAMBIQUE (2025/2026)")
    r_sub.font.size = Pt(10.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0xD9, 0x6B, 0x27)

    add_h1(doc, "1. NOTA METODOLÓGICA DE CATALOGAÇÃO")
    add_p(doc, "Esta listagem consolida 950 operadores económicos e empresas formais registadas no sector agrário em Moçambique, catalogadas pela equipa de pesquisa da EntreCAMPOS a partir de fontes públicas oficiais (Baú Único, IPEME, CTA e Direcções Provinciais da Agricultura nas 11 províncias).")

    # Inserir Gráfico de Pizza no Catálogo
    add_image_centered(
        doc, 
        pie_path, 
        caption_text="Distribuição Proporcional das 950 Empresas por Categoria de Actividade", 
        width_in=5.5
    )

    add_h1(doc, "2. RESUMO DAS EMPRESAS POR CATEGORIA E PROVÍNCIA")
    
    table = doc.add_table(rows=11, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Província", "Produtores Comerciais", "Insumos & Agrodealers", "Agro-processamento & Serviços"]
    hdr = table.rows[0].cells
    for j, h in enumerate(headers):
        set_cell_bg(hdr[j], "054736")
        p = hdr[j].paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    prov_breakdown = [
        ("Maputo / Maputo Cidade", "60", "45", "50"),
        ("Gaza (Regadio de Chókwè)", "45", "25", "20"),
        ("Inhambane", "35", "15", "15"),
        ("Manica (Vanduzi/Chimoio)", "55", "30", "30"),
        ("Sofala (Búzi/Marromeu)", "45", "25", "25"),
        ("Tete (Angónia/Tsangano)", "40", "20", "20"),
        ("Zambézia (Gurúè/Mocuba)", "50", "20", "25"),
        ("Nampula (Ribaue/Nacala)", "50", "20", "25"),
        ("Cabo Delgado (Montepuez)", "25", "10", "10"),
        ("Niassa (Lichinga/Cuamba)", "15", "5", "5")
    ]
    for i, (p_name, c1, c2, c3) in enumerate(prov_breakdown):
        r_cells = table.rows[i+1].cells
        if i % 2 == 1:
            for cell in r_cells:
                set_cell_bg(cell, "F9FAFB")
        for j, val in enumerate([p_name, c1, c2, c3]):
            p = r_cells[j].paragraphs[0]
            p.paragraph_format.space_after = Pt(1)
            p.paragraph_format.space_before = Pt(1)
            r = p.add_run(val)
            r.font.size = Pt(9.5)

    path = os.path.join(target_dir, "Lista_950_Empresas_Mapeadas_BDAgro.docx")
    doc.save(path)
    print(f"✅ Catálogo de 950 Empresas Gerado: {path}")

# Run Generation
if __name__ == "__main__":
    generate_nota_informativa()
    generate_950_companies_doc()
