import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

def set_cell_background(cell, hex_color):
    """Define a cor de fundo de uma célula da tabela"""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def create_document():
    doc = Document()

    # 1. Configurar Margens (3cm esquerda/superior, 2cm direita/inferior)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.18)      # ~3cm
        section.bottom_margin = Inches(0.79)   # ~2cm
        section.left_margin = Inches(1.18)     # ~3cm
        section.right_margin = Inches(0.79)    # ~2cm

    # Configurar estilo Normal (Times New Roman, 12pt, Justificado)
    normal_style = doc.styles['Normal']
    font = normal_style.font
    font.name = 'Times New Roman'
    font.size = Pt(11.5)
    font.color.rgb = RGBColor(0x11, 0x18, 0x27) # Dark Slate

    # ---------------------------------------------------------
    # CABEÇALHO DO DOCUMENTO
    # ---------------------------------------------------------
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_top_sub = p_top.add_run("ENTRECAMPOS — SERVIÇOS E TECNOLOGIA, LDA.\nBASE DE DADOS AGRO MOÇAMBIQUE\n")
    run_top_sub.font.name = 'Times New Roman'
    run_top_sub.font.size = Pt(10)
    run_top_sub.font.bold = True
    run_top_sub.font.color.rgb = RGBColor(0x05, 0x47, 0x36) # Verde Agrícola Institucional

    # Título Principal
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("NOTA INFORMATIVA DE REUNIÃO")
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(15)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x11, 0x18, 0x27)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("PROPOSTA DE PARCERIA E MAPEAMENTO DIGITAL UNIFICADO DO AGRONEGÓCIO MOÇAMBICANO")
    run_sub.font.name = 'Times New Roman'
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(0xD9, 0x6B, 0x27) # Laranja Terra

    doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # Caixa de Endereçamento Institucional (Tabela Discreta)
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("PARA:", "Direcção Geral do MADER & Fundo de Desenvolvimento Agrário (FAR, IP)"),
        ("DE:", "Silva Chamo — Director Geral da EntreCAMPOS / Base de Dados Agro"),
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

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ---------------------------------------------------------
    # FUNÇÃO AUXILIAR DE SECCÇÕES
    # ---------------------------------------------------------
    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x05, 0x47, 0x36)

    def add_body_p(text, bold_prefix="", space_after=3):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(space_after)
        
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Times New Roman'
            r_pre.font.bold = True
            r_pre.font.size = Pt(11)
            r_pre.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
            
        r_text = p.add_run(text)
        r_text.font.name = 'Times New Roman'
        r_text.font.size = Pt(11)
        r_text.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        return p

    # ---------------------------------------------------------
    # 1. CONTEXTUALIZAÇÃO E ENQUADRAMENTO INSTITUCIONAL
    # ---------------------------------------------------------
    add_heading_1("1. CONTEXTUALIZAÇÃO E ENQUADRAMENTO INSTITUCIONAL")
    add_body_p(
        "A plataforma Base de Dados Agro surge para responder a uma lacuna estrutural no agronegócio moçambicano: a dispersão de dados e a ausência de um registo digital unificado, centralizado e pesquisável dos intervenientes da cadeia de valor. O projecto alinha-se directamente com as directrizes do PEDSA II, do PNISA II e com os apelos governamentais para a modernização e digitalização do campo, com especial destaque para as prioridades apontadas recentemente pelo Presidente da República na abertura da 61.ª edição da FACIM 2026, onde se enfatizou a urgência de incorporar soluções tecnológicas computacionais no fomento produtivo."
    )

    # ---------------------------------------------------------
    # 2. DIMENSÃO ACTUAL E INDICADORES CHAVE DO SECTOR
    # ---------------------------------------------------------
    add_heading_1("2. DIMENSÃO ACTUAL E INDICADORES CHAVE DO SECTOR")
    add_body_p(
        "Para demonstrar a robustez e a utilidade prática do ecossistema, os dados consolidados do sector contemplam a produção nacional superior a 20 milhões de toneladas de produtos agrícolas (com um crescimento anual de 5%), um PIB agrícola avaliado em 91.4 mil milhões de Meticais no 2.º trimestre de 2025 (representando cerca de 24% do PIB total de Moçambique) e a absorção de 70% da força laboral activa do país. O nosso directório já integra mais de 950 empresas activas existentes no mercado nacional (abrangendo fornecedores de insumos agrícolas, tecnologia agrária, consultoria, processamento e serviços especializados em todas as 11 províncias)."
    )

    # ---------------------------------------------------------
    # 3. MAPEAMENTO REAL DAS 950 EMPRESAS
    # ---------------------------------------------------------
    add_heading_1("3. ESTRUTURA DO MAPEAMENTO INICIAL (950 EMPRESAS CATALOGADAS)")
    add_body_p(
        "O levantamento realizado pela equipa de pesquisa da EntreCAMPOS baseou-se no cruzamento rigoroso de registos públicos do Baú Único, IPEME, CTA e listas das Direcções Provinciais da Agricultura. O universo de 950 empresas decompõe-se da seguinte forma:"
    )

    categories = [
        ("• Produtores Comerciais e Quintas de Média/Grande Dimensão: ", "420 entidades privadas que produzem para o mercado formal e exportação."),
        ("• Fornecedores de Insumos e Equipamentos (Agrodealers): ", "210 empresas/lojas licenciadas (sementes, fertilizantes, rega e maquinaria)."),
        ("• Agro-processadores e Agro-indústria: ", "180 unidades industriais (moageiras, caju, algodão, açúcar, fruta e avicultura)."),
        ("• Prestadores de Serviços, Mecanização e Veterinárias: ", "140 empresas de transporte agrícola, consultoria e apoio técnico.")
    ]

    for prefix, desc in categories:
        add_body_p(desc, bold_prefix=prefix, space_after=2)

    # ---------------------------------------------------------
    # 4. O PAPEL PRETENDIDO DO MADER: PROVEDORIA, CERTIFICAÇÃO E DIFUSÃO
    # ---------------------------------------------------------
    add_heading_1("4. O PAPEL PRETENDIDO DO MADER: PROVEDORIA E CHANCELA INSTITUCIONAL")
    
    # Parágrafo Resumido Solicitado
    p_mader = doc.add_paragraph()
    p_mader.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_mader.paragraph_format.line_spacing = 1.15
    p_mader.paragraph_format.left_indent = Inches(0.2)
    p_mader.paragraph_format.right_indent = Inches(0.2)
    p_mader.paragraph_format.space_before = Pt(4)
    p_mader.paragraph_format.space_after = Pt(6)

    r_m = p_mader.add_run(
        "“Mais do que uma simples ponte digital entre o Estado e o público alvo da cadeia de valor agrária, pretendemos que o MADER assuma a posição de Provedor Institucional da Plataforma Base de Dados Agro, chancelando-a e autenticando-a como o repositório digital oficial, certificado e de elevada confiança no país. Sob este enquadramento, cabe ao MADER impulsionar a abertura de novos canais de financiamento e programas de fomento em articulação com os seus parceiros de cooperação internacional, bem como promover e difundir activamente a utilização da plataforma junto dos seus aliados estratégicos e de todas as suas delegações provinciais e distritais a nível nacional.”"
    )
    r_m.font.name = 'Times New Roman'
    r_m.font.size = Pt(11)
    r_m.font.bold = True
    r_m.font.italic = True
    r_m.font.color.rgb = RGBColor(0x05, 0x47, 0x36)

    mader_points = [
        ("• Conexão Estado-Público Alvo: ", "Ligar directamente o Ministério e o FAR, IP aos produtores rurais, fornecedores licenciados e intervenientes do mercado."),
        ("• Provedor e Entidade Certificadora: ", "Atribuição do selo oficial de conformidade e validação dos dados como fonte pública única de informação agrícola."),
        ("• Mobilização de Financiamento: ", "Abertura de canais de financiamento e integração de doadores/parceiros de cooperação (FIDA, Banco Mundial, BAD, UE)."),
        ("• Difusão nas Delegações Nacionais: ", "Disseminação institucional através de todas as Direcções Provinciais (DPAP) e Serviços Distritais (SDAE).")
    ]
    for prefix, desc in mader_points:
        add_body_p(desc, bold_prefix=prefix, space_after=2)

    # ---------------------------------------------------------
    # 5. O ARGUMENTO CENTRAL E DECLARAÇÃO DE PARCERIA
    # ---------------------------------------------------------
    add_heading_1("5. DECLARAÇÃO ESTRATÉGICA DE PARCERIA E POSICIONAMENTO")
    
    # Caixa Destacada de Citação / Declaração
    p_box = doc.add_paragraph()
    p_box.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_box.paragraph_format.left_indent = Inches(0.3)
    p_box.paragraph_format.right_indent = Inches(0.3)
    p_box.paragraph_format.space_before = Pt(4)
    p_box.paragraph_format.space_after = Pt(6)
    
    r_quote = p_box.add_run(
        "“Nós, na EntreCAMPOS, já fizemos o trabalho pesado de pesquisar e catalogar 950 das cerca de 2.000 empresas formais do país. Com a parceria institucional do MADER e do FAR, IP, pretendemos validar e auditar este universo inicial e alcançar as restantes 1.000 empresas, com o objectivo de dotar Moçambique do seu primeiro Mapa Digital com 100% dos operadores do agronegócio integrados.”"
    )
    r_quote.font.name = 'Times New Roman'
    r_quote.font.size = Pt(10.5)
    r_quote.font.bold = True
    r_quote.font.italic = True
    r_quote.font.color.rgb = RGBColor(0xD9, 0x6B, 0x27)

    # ---------------------------------------------------------
    # 6. GANHOS IMEDIATOS PARA O MADER E FAR, IP
    # ---------------------------------------------------------
    add_heading_1("6. GANHOS INSTITUCIONAIS PARA O MADER E O FAR, IP")
    
    gains = [
        ("1. Transparência e Eficiência no Fomento (FAR, IP): ", "Acesso a um repositório auditado de fornecedores de insumos por província, optimizando a distribuição de subsídios públicos."),
        ("2. Canal Directo de Comunicação Massiva: ", "Difusão imediata via Web, Email e SMS de editais, avisos fitossanitários, concursos públicos e políticas do Ministério."),
        ("3. Apoio ao Extensionismo Agrário: ", "Ferramenta móvel de apoio aos extensionistas no terreno para consulta de fichas técnicas, cotações em tempo real (SIMA/IPC) e apoio ao diagnóstico via inteligência artificial (AgroBotanica AI)."),
        ("4. Isenção de Custos Orçamentais: ", "A infraestrutura tecnológica é cedida sem encargo financeiro para os cofres do Estado, operando num modelo de cooperação pública-privada.")
    ]

    for prefix, desc in gains:
        add_body_p(desc, bold_prefix=prefix, space_after=2)

    # ---------------------------------------------------------
    # 7. ROTEIRO DE IMPLEMENTAÇÃO E PRÓXIMOS PASSOS
    # ---------------------------------------------------------
    add_heading_1("7. ROTEIRO PRAGMÁTICO DE IMPLEMENTAÇÃO")
    
    steps = [
        ("Fase 1 (Outubro 2026): ", "Constituição do Grupo de Trabalho Técnico com pontos focais da EntreCAMPOS, FAR, IP e MADER."),
        ("Fase 2 (Outubro 2026): ", "Assinatura do Memorando de Entendimento (MOU) para validação institucional de dados."),
        ("Fase 3 (Nov–Dez 2026): ", "Projecto Piloto de Validação numa província prioritária (ex: Manica ou Sofala)."),
        ("Fase 4 (Janeiro 2027): ", "Lançamento Oficial e Expansão para o Mapeamento 100% Nacional.")
    ]

    for prefix, desc in steps:
        add_body_p(desc, bold_prefix=prefix, space_after=2)

    # ---------------------------------------------------------
    # FECHO E ASSINATURA
    # ---------------------------------------------------------
    p_close = doc.add_paragraph()
    p_close.paragraph_format.space_before = Pt(10)
    p_close.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    r_c1 = p_close.add_run("Maputo, Setembro de 2026\n\n__________________________________________________\n")
    r_c1.font.name = 'Times New Roman'
    r_c1.font.size = Pt(10)
    
    r_c2 = p_close.add_run("SILVA CHAMO\n")
    r_c2.font.name = 'Times New Roman'
    r_c2.font.bold = True
    r_c2.font.size = Pt(11)
    
    r_c3 = p_close.add_run("Director Geral da EntreCAMPOS / Promotor da Base de Dados Agro\nContacto: +258 87 75 75 288 | E-mail: geral@basededadosagro.com")
    r_c3.font.name = 'Times New Roman'
    r_c3.font.size = Pt(9.5)
    r_c3.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Salvar Ficheiro na pasta Presentação e no root
    output_path1 = "/Users/imac/Desktop/APP/basededadosagro/Presentação/Nota_Informativa_MADER_FARIP.docx"
    output_path2 = "/Users/imac/Desktop/APP/basededadosagro/Nota_Informativa_MADER_FARIP.docx"
    doc.save(output_path1)
    doc.save(output_path2)
    print(f"✅ Documento Word atualizado com sucesso em: {output_path1}")

if __name__ == "__main__":
    create_document()
