import os
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

target_dir = "/Users/imac/Desktop/APP/basededadosagro/Presentação"
img_dir = "/Users/imac/Desktop/APP/basededadosagro/Presentação/_images"
os.makedirs(img_dir, exist_ok=True)

# ==============================================================================
# 1. GERAR GRÁFICO DE PIZZA (DISTRIBUIÇÃO DOS 950 OPERADORES)
# ==============================================================================
def generate_pie_chart():
    labels = [
        'Produtores Comerciais & Quintas\n(44% - ~420 Entidades)',
        'Fornecedores de Insumos & Agrodealers\n(22% - ~210 Lojas/Empresas)',
        'Agro-processamento & Indústria\n(19% - ~180 Unidades)',
        'Serviços, Mecanização & Veterinárias\n(15% - ~140 Empresas)'
    ]
    sizes = [44, 22, 19, 15]
    colors = ['#1e1b18', '#4a1525', '#2d4a4d', '#5c3a21'] # Exact colors from attached image
    explode = (0.03, 0.03, 0.03, 0.03)

    fig, ax = plt.subplots(figsize=(7.5, 4.5), dpi=300)
    fig.patch.set_facecolor('#111827') # Dark theme matching screenshot background
    ax.set_facecolor('#111827')

    wedges, texts, autotexts = ax.pie(
        sizes, 
        explode=explode, 
        labels=None, 
        autopct='%1.0f%%',
        pctdistance=0.65,
        startangle=90,
        colors=colors,
        textprops=dict(color="white", weight="bold", fontsize=11)
    )

    # Styling autotexts
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(12)

    # Title
    ax.set_title(
        "Distribuição Estimada dos 950+ Operadores Mapeados por Categoria", 
        color="white", 
        fontsize=13, 
        weight="bold", 
        pad=15
    )

    # Custom Legend
    legend_labels = [
        'Produtores Comerciais & Quintas (44%)',
        'Fornecedores de Insumos & Agrodealers (22%)',
        'Agro-processamento & Indústria (19%)',
        'Serviços, Mecanização & Veterinárias (15%)'
    ]
    legend = ax.legend(
        wedges, 
        legend_labels, 
        title="Categorias Mapeadas", 
        loc="center left", 
        bbox_to_anchor=(0.95, 0.5),
        frameon=True,
        facecolor='#1f2937',
        edgecolor='#374151'
    )
    plt.setp(legend.get_title(), color='white', weight='bold', fontsize=10)
    for text in legend.get_texts():
        text.set_color('white')
        text.set_fontsize(9.5)

    plt.tight_layout()
    pie_path = os.path.join(img_dir, "grafico_operadores_pizza.png")
    plt.savefig(pie_path, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"✅ Gráfico de Pizza gerado: {pie_path}")
    return pie_path

# ==============================================================================
# 2. GERAR GRÁFICO GANTT / LINHA DO TEMPO (ROTEIRO DE COOPERAÇÃO)
# ==============================================================================
def generate_gantt_chart():
    fig, ax = plt.subplots(figsize=(9, 3.8), dpi=300)
    fig.patch.set_facecolor('#111827')
    ax.set_facecolor('#111827')

    phases = [
        "Fase 4: Lançamento do Mapa 100% Nacional",
        "Fase 3: Piloto de Validação Provincial",
        "Fase 2: Assinatura de Memorando (MOU)",
        "Fase 1: Grupo de Trabalho Técnico"
    ]
    
    # Start days and durations relative to Oct 1 2026
    start_days = [92, 31, 15, 0]   # Jan 1 2027, Nov 1 2026, Oct 16 2026, Oct 1 2026
    durations  = [31, 61, 15, 15]  # Jan (31d), Nov-Dec (61d), Oct 16-31 (15d), Oct 1-15 (15d)
    bar_colors = ['#4f46e5', '#38bdf8', '#64748b', '#60a5fa'] # Styled matching screenshot

    bars = ax.barh(phases, durations, left=start_days, height=0.45, color=bar_colors, edgecolor='white', linewidth=1)

    # Title
    ax.set_title("Roteiro de Cooperação MADER / FAR, IP & EntreCAMPOS", color="white", fontsize=13, weight="bold", pad=15)

    # Styling axes
    ax.set_xlim(-5, 130)
    ax.set_xlabel("Cronograma Executivo (Outubro 2026 a Janeiro 2027)", color="white", fontsize=10, weight="bold")
    
    # Custom x-ticks for months/dates
    x_ticks = [0, 15, 31, 61, 92, 123]
    x_labels = ['01/10/26', '16/10/26', '01/11/26', '01/12/26', '01/01/27', '31/01/27']
    ax.set_xticks(x_ticks)
    ax.set_xticklabels(x_labels, color='#d1d5db', fontsize=9)

    ax.tick_params(axis='y', colors='white', labelsize=10)
    ax.grid(axis='x', color='#374151', linestyle='--', alpha=0.7)

    # Add text labels on top of bars
    task_labels = [
        "Lançamento do Mapa 100% Nacional (Jan 2027)",
        "Piloto de Validação Provincial (Nov–Dez 2026)",
        "Assinatura de Memorando - MOU (Out 2026)",
        "Grupo de Trabalho Técnico (Out 2026)"
    ]
    for bar, label in zip(bars, task_labels):
        width = bar.get_width()
        start = bar.get_x()
        ax.text(start + width/2, bar.get_y() + bar.get_height()/2, label,
                ha='center', va='center', color='white', fontsize=8.5, weight='bold')

    plt.tight_layout()
    gantt_path = os.path.join(img_dir, "grafico_roteiro_gantt.png")
    plt.savefig(gantt_path, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"✅ Gráfico Gantt gerado: {gantt_path}")
    return gantt_path

if __name__ == "__main__":
    generate_pie_chart()
    generate_gantt_chart()
