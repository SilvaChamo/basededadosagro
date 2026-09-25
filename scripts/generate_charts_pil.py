import os
import math
from PIL import Image, ImageDraw, ImageFont

img_dir = "/Users/imac/Desktop/APP/basededadosagro/Presentação/_images"
os.makedirs(img_dir, exist_ok=True)

# Caminhos das Fontes Times New Roman no macOS
TIMES_REGULAR = "/System/Library/Fonts/Supplemental/Times New Roman.ttf"
TIMES_BOLD = "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        try:
            return ImageFont.truetype("Times New Roman", size)
        except:
            return ImageFont.load_default()

# ------------------------------------------------------------------------------
# 1. GERAR GRÁFICO DE PIZZA EM TIMES NEW ROMAN (Fundo Branco para Impressão)
# ------------------------------------------------------------------------------
def create_pie_chart_pil():
    width, height = 1350, 750
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    font_title = get_font(TIMES_BOLD, 28)
    font_legend = get_font(TIMES_BOLD, 18)
    font_legend_sub = get_font(TIMES_REGULAR, 17)
    font_percent = get_font(TIMES_BOLD, 22)

    # Título Principal em Times New Roman
    title_text = "Distribuição Estimada dos 950+ Operadores Mapeados por Categoria"
    draw.text((width // 2, 45), title_text, fill=(17, 24, 39, 255), font=font_title, anchor="ms")

    # Sectores & Cores Vibrantes
    sectors = [
        ("Produtores Comerciais & Quintas", 44, (5, 71, 54, 255)),        # Verde Escuro #054736
        ("Fornecedores de Insumos & Agrodealers", 22, (217, 107, 39, 255)), # Laranja #D96B27
        ("Agro-processamento & Indústria", 19, (37, 99, 235, 255)),       # Azul #2563EB
        ("Serviços, Mecanização & Veterinárias", 15, (71, 85, 105, 255))   # Slate #475569
    ]

    cx, cy, r = 410, 420, 245
    bbox = [cx - r, cy - r, cx + r, cy + r]

    start_angle = -90
    total = sum(s[1] for s in sectors)

    # Draw Pie Slices
    for name, val, color in sectors:
        sweep = (val / total) * 360
        end_angle = start_angle + sweep
        draw.pieslice(bbox, start_angle, end_angle, fill=color, outline=(255, 255, 255, 255), width=3)
        
        # Percentages
        mid_angle = math.radians(start_angle + sweep / 2)
        tx = cx + (r * 0.6) * math.cos(mid_angle)
        ty = cy + (r * 0.6) * math.sin(mid_angle)
        
        draw.text((tx, ty), f"{val}%", fill=(255, 255, 255, 255), font=font_percent, anchor="mm")
        start_angle = end_angle

    # Draw Legend Box on the Right
    lx, ly = 750, 230
    draw.rectangle([lx, ly, lx + 540, ly + 350], fill=(249, 250, 251, 255), outline=(209, 213, 219, 255), width=2)
    draw.text((lx + 25, ly + 35), "Categorias Mapeadas", fill=(5, 71, 54, 255), font=font_legend)

    curr_y = ly + 80
    for name, val, color in sectors:
        draw.rectangle([lx + 25, curr_y, lx + 53, curr_y + 28], fill=color, outline=(156, 163, 175, 255), width=1)
        label_text = f"{name} ({val}%)"
        draw.text((lx + 68, curr_y + 3), label_text, fill=(31, 41, 55, 255), font=font_legend_sub)
        curr_y += 62

    pie_path = os.path.join(img_dir, "grafico_operadores_pizza.png")
    img.save(pie_path)
    print(f"✅ Gráfico de Pizza em Times New Roman gerado: {pie_path}")
    return pie_path

# ------------------------------------------------------------------------------
# 2. GERAR GRÁFICO GANTT EM TIMES NEW ROMAN (Aumentado, Sem Sobreposições)
# ------------------------------------------------------------------------------
def create_gantt_chart_pil():
    width, height = 1500, 750
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    font_title = get_font(TIMES_BOLD, 30)
    font_phase = get_font(TIMES_BOLD, 20)
    font_task = get_font(TIMES_BOLD, 18)
    font_axis = get_font(TIMES_BOLD, 16)

    # Título Principal em Times New Roman
    title_text = "Roteiro de Cooperação MADER / FAR, IP & EntreCAMPOS"
    draw.text((width // 2, 50), title_text, fill=(17, 24, 39, 255), font=font_title, anchor="ms")

    # Margens e Escala Temporal
    # Left margin for Phase Labels: 140px
    # Timeline x-coords: 220px to 1420px (1200px total width)
    dates = [
        ("01/10/26", 220),
        ("16/10/26", 460),
        ("01/11/26", 700),
        ("01/12/26", 940),
        ("01/01/27", 1180),
        ("31/01/27", 1420)
    ]

    # Grid Lines Verticais (Cinza Claro)
    for d_text, xpos in dates:
        draw.line([(xpos, 110), (xpos, 600)], fill=(229, 231, 235, 255), width=1)
        draw.text((xpos, 635), d_text, fill=(55, 65, 81, 255), font=font_axis, anchor="ms")

    # Linha Vermelha de Início (01/10/26) Atravessando todo o Gráfico
    draw.line([(220, 110), (220, 600)], fill=(220, 38, 38, 255), width=3)

    # Fases e Barras
    tasks = [
        ("Fase 1", "Criação de Grupo de Trabalho Técnico", 220, 460, (5, 71, 54, 255)),     # Verde #054736
        ("Fase 2", "Assinatura de Memorando (MOU)", 460, 700, (217, 107, 39, 255)),        # Laranja #D96B27
        ("Fase 3", "Piloto de Validação Provincial", 700, 1180, (37, 99, 235, 255)),       # Azul #2563EB
        ("Fase 4", "Lançamento do Mapa 100% Nacional", 1180, 1420, (51, 65, 85, 255))      # Slate #334155
    ]

    y_pos = 145
    bar_h = 60

    for phase_id, title, x1, x2, color in tasks:
        # Phase Label na Esquerda (Times New Roman 20pt Negrito)
        draw.text((60, y_pos + bar_h // 2), phase_id, fill=(17, 24, 39, 255), font=font_phase, anchor="ls")

        # Rounded Bar
        draw.rounded_rectangle([x1, y_pos, x2, y_pos + bar_h], radius=8, fill=color, outline=(255, 255, 255, 255), width=2)
        
        # TEXTO DAS TAREFAS 100% LEGÍVEL EM TIMES NEW ROMAN:
        # Para a Fase 3 (barra longa), colocamos o texto branco dentro da barra.
        # Para as outras fases (barras de 15 a 30 dias), colocamos o texto em Times New Roman Negrito (#111827)
        # posicionado com margem de segurança ao lado da barra para NUNCA haver sobreposição entre letras!
        bar_w = x2 - x1
        if bar_w >= 400:
            # Dentro da barra em branco
            draw.text((x1 + bar_w // 2, y_pos + bar_h // 2), title, fill=(255, 255, 255, 255), font=font_task, anchor="mm")
        else:
            # À direita da barra em Times New Roman Escuro (sem sobreposição)
            if x2 + 400 <= width:
                draw.text((x2 + 15, y_pos + bar_h // 2), title, fill=(17, 24, 39, 255), font=font_task, anchor="lm")
            else:
                draw.text((x1 - 15, y_pos + bar_h // 2), title, fill=(17, 24, 39, 255), font=font_task, anchor="rm")

        y_pos += 110

    gantt_path = os.path.join(img_dir, "grafico_roteiro_gantt.png")
    img.save(gantt_path)
    print(f"✅ Gráfico Gantt em Times New Roman (Nítido) gerado: {gantt_path}")
    return gantt_path

if __name__ == "__main__":
    create_pie_chart_pil()
    create_gantt_chart_pil()
