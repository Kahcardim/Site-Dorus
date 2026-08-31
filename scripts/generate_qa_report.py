from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "relatorio-validacao-site-dorus.pdf"

NAVY = colors.HexColor("#0E2340")
BLUE = colors.HexColor("#0A438E")
LIGHT_BLUE = colors.HexColor("#EEF6FF")
GREEN = colors.HexColor("#128C43")
LIGHT_GREEN = colors.HexColor("#EAF7EF")
ORANGE = colors.HexColor("#D36B16")
LIGHT_ORANGE = colors.HexColor("#FFF4E8")
INK = colors.HexColor("#17243A")
MUTED = colors.HexColor("#5A687D")
LINE = colors.HexColor("#D8E2F0")
WHITE = colors.white


def register_fonts():
    pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))


register_fonts()

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="ReportTitle", fontName="Arial-Bold", fontSize=28, leading=32,
    textColor=WHITE, alignment=TA_LEFT, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="ReportSubtitle", fontName="Arial", fontSize=12, leading=17,
    textColor=colors.HexColor("#DCE9F8"), spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="SectionTitle", fontName="Arial-Bold", fontSize=19, leading=23,
    textColor=NAVY, spaceBefore=2, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="SubTitle", fontName="Arial-Bold", fontSize=12, leading=15,
    textColor=BLUE, spaceBefore=7, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="BodyTextCustom", fontName="Arial", fontSize=9.2, leading=13.3,
    textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Small", fontName="Arial", fontSize=7.5, leading=10.2,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="SmallBold", fontName="Arial-Bold", fontSize=7.5, leading=10.2,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="CardTitle", fontName="Arial-Bold", fontSize=11, leading=13,
    textColor=NAVY, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="CardBody", fontName="Arial", fontSize=8.5, leading=12,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="Status", fontName="Arial-Bold", fontSize=9.5, leading=12,
    textColor=WHITE, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="Footer", fontName="Arial", fontSize=7.5, leading=9,
    textColor=MUTED, alignment=TA_CENTER,
))


def p(text, style="BodyTextCustom"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph("&#8226; " + text, ParagraphStyle(
        name="BulletDynamic", parent=styles["BodyTextCustom"], leftIndent=10,
        firstLineIndent=-7, spaceAfter=4,
    ))


def callout(title, body, background=LIGHT_BLUE, accent=BLUE):
    inner = [p(title, "CardTitle"), p(body, "CardBody")]
    table = Table([[inner]], colWidths=[170 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.6, accent),
        ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return table


def data_table(rows, widths, header=True, font_size=7.7):
    cooked = []
    for row_index, row in enumerate(rows):
        style = "SmallBold" if header and row_index == 0 else "Small"
        cooked.append([p(str(cell), style) for cell in row])
    table = Table(cooked, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        commands += [
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ]
    for row_index in range(1 if header else 0, len(rows)):
        if row_index % 2 == 0:
            commands.append(("BACKGROUND", (0, row_index), (-1, row_index), colors.HexColor("#F7F9FC")))
    table.setStyle(TableStyle(commands))
    return table


class ReportDoc(BaseDocTemplate):
    pass


def page_background(canvas, doc):
    canvas.saveState()
    if doc.page == 1:
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.setFillColor(GREEN)
        canvas.rect(0, 0, A4[0], 11 * mm, fill=1, stroke=0)
    else:
        canvas.setFillColor(WHITE)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.setFillColor(NAVY)
        canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
        canvas.setFont("Arial-Bold", 8)
        canvas.setFillColor(WHITE)
        canvas.drawString(20 * mm, A4[1] - 7.6 * mm, "D'ORUS - RELATORIO DE VALIDACAO")
        canvas.setFont("Arial", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawCentredString(A4[0] / 2, 9 * mm, f"Pagina {doc.page} - Branch qa/full-site-ux-review - 30/08/2026")
    canvas.restoreState()


def build_story():
    story = []
    logo = ROOT / "assets" / "dorus-logo-3d.webp"
    if logo.exists():
        image = Image(str(logo), width=52 * mm, height=18 * mm)
        story.extend([image, Spacer(1, 24 * mm)])
    else:
        story.append(Spacer(1, 45 * mm))

    story += [
        p("Relatorio de validacao<br/>UX, SEO e conversoes", "ReportTitle"),
        p("Revisao completa do site D'orus Assistencia Tecnica", "ReportSubtitle"),
        Spacer(1, 9 * mm),
        Table([[p("PRONTO PARA VALIDACAO - NAO PUBLICADO", "Status")]], colWidths=[92 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#55D487")),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
        Spacer(1, 15 * mm),
        p("Escopo", "CardTitle"),
        p("Centralizacao e responsividade, CTAs, oito servicos, guias, rodape, garantia, SEO, GA4, agenda e atualizacao automatica das avaliacoes.", "ReportSubtitle"),
        Spacer(1, 6 * mm),
        p("Repositorio de destino: backup privado", "Small"),
        p("Branch: qa/full-site-ux-review", "Small"),
        p("Site principal e GitHub Pages: sem alteracoes e sem deploy", "Small"),
        PageBreak(),
    ]

    story += [
        p("1. Resumo executivo", "SectionTitle"),
        callout(
            "Resultado da validacao",
            "A versao revisada passou nos validadores locais e na matriz visual desktop e mobile. Nenhuma alteracao foi publicada no site principal. O material foi preparado exclusivamente na branch de backup para aprovacao.",
            LIGHT_GREEN, GREEN,
        ),
        Spacer(1, 6 * mm),
        p("Principais entregas", "SubTitle"),
        bullet("Titulos e blocos principais centralizados ou alinhados de forma consistente, sem estouro horizontal."),
        bullet("CTAs profissionais adicionados em Sobre e Guias e padronizados nos oito produtos."),
        bullet("Garantia minima de 90 dias comunicada nos oito servicos, nos CTAs e no rodape."),
        bullet("Rodape ampliado com CNPJ 30.204.892/0001-03, credito Desenvolvido por Kauan Cardim e icones oficiais de Instagram e WhatsApp."),
        bullet("Guia central ampliado com problemas comuns dos oito aparelhos e links diretos para cada servico."),
        bullet("GA4 reorganizado com eventos legiveis para leads, CTAs, agendamento e redes sociais, sem dados pessoais."),
        bullet("Protecao adicional impede que uma ficha Google incorreta sobrescreva o fallback visual."),
        Spacer(1, 5 * mm),
        callout(
            "Portao de publicacao",
            "Esta entrega nao autoriza deploy. Antes de publicar, validar o link da branch, ajustar o Place ID no Apps Script, criar as definicoes personalizadas no GA4 e repetir um smoke teste na URL final.",
            LIGHT_ORANGE, ORANGE,
        ),
        PageBreak(),
    ]

    story += [
        p("2. UX, CTAs e responsividade", "SectionTitle"),
        p("Os componentes foram ajustados sem trocar a identidade visual do site. A intervencao preserva tipografia, cores, estrutura de navegacao e comportamento dos contatos.", "BodyTextCustom"),
        data_table([
            ["Area", "Alteracao", "Resultado esperado"],
            ["Sobre", "Titulo em uma linha quando houver espaco e CTA final com duas rotas.", "Leitura mais limpa e proximo passo visivel."],
            ["Guias", "CTA final e diretorio dos oito aparelhos.", "Conteudo util conectado aos servicos."],
            ["Servicos", "Captador reduzido e profissional, sem retirar conversao.", "Menor ocupacao vertical e melhor hierarquia."],
            ["Produtos", "CTA contextual com agenda, WhatsApp, domicilio e garantia.", "Mensagem coerente em todos os oito detalhes."],
            ["Contato e agenda", "Titulo, subtitulo e seletor de jornada centralizados.", "Diferenca entre conversar e escolher data fica clara."],
            ["Rodape", "Dados legais, credito, links e redes sociais reais.", "Fechamento institucional completo."],
        ], [31 * mm, 70 * mm, 69 * mm]),
        Spacer(1, 7 * mm),
        p("Cores dos canais", "SubTitle"),
        bullet("Instagram: gradiente rosa, roxo, laranja e amarelo."),
        bullet("WhatsApp: verde oficial, mantido separado do Instagram."),
        p("O botao flutuante continua acessivel sem gerar largura excedente nas telas de 390 px.", "BodyTextCustom"),
        PageBreak(),
    ]

    equipment_rows = [["Produto", "CTA", "Garantia", "Vinculo com guia"]] + [
        [name, "Agenda + WhatsApp", "Minimo 90 dias", guide]
        for name, guide in [
            ("Geladeiras", "Nao gela, gelo ou vazamento"),
            ("Maquinas de lavar", "Nao centrifuga ou nao drena"),
            ("Lava e seca", "Nao seca ou nao conclui ciclo"),
            ("Fogoes", "Nao acende ou chama irregular"),
            ("Freezers", "Nao congela ou acumula gelo"),
            ("Lava-loucas", "Nao lava, aquece ou drena"),
            ("Fornos", "Nao aquece ou perde temperatura"),
            ("Micro-ondas", "Liga, mas nao aquece"),
        ]
    ]
    story += [
        p("3. Oito produtos e guias relacionados", "SectionTitle"),
        p("Cada pagina de produto agora encerra a jornada com contexto especifico, informacao de confianca e duas opcoes de conversao. A aba Guias ganhou um diretorio rastreavel para os oito aparelhos.", "BodyTextCustom"),
        data_table(equipment_rows, [37 * mm, 40 * mm, 35 * mm, 58 * mm]),
        Spacer(1, 7 * mm),
        callout(
            "Cobertura SEO",
            "Os links internos usam textos descritivos e apontam diretamente para as paginas de servico. O diretorio tambem recebeu dados estruturados ItemList com os oito destinos.",
            LIGHT_BLUE, BLUE,
        ),
        Spacer(1, 6 * mm),
        p("A garantia foi descrita como garantia minima de 90 dias nos servicos executados. Essa redacao evita prometer cobertura fora do escopo do reparo e reforca confianca em todas as categorias.", "BodyTextCustom"),
        PageBreak(),
    ]

    story += [
        p("4. SEO e mensuracao GA4", "SectionTitle"),
        p("SEO aplicado", "SubTitle"),
        bullet("Titulo e descricao da pagina Guias ampliados para linha branca e problemas comuns."),
        bullet("Conteudo estatico rastreavel para os oito aparelhos, com links internos descritivos."),
        bullet("ItemList em JSON-LD para representar o conjunto de servicos relacionados."),
        bullet("21 paginas indexaveis verificadas no sitemap e nos validadores locais."),
        Spacer(1, 4 * mm),
        p("Eventos GA4", "SubTitle"),
        data_table([
            ["Evento", "Uso", "Parametros principais"],
            ["generate_lead", "Conversao principal", "method, lead_source, page_type, equipment"],
            ["cta_click", "Cliques de captacao", "cta_location, cta_type, link_text, link_url"],
            ["begin_schedule", "Inicio de agendamento", "cta_location, page_type, equipment"],
            ["social_click", "Instagram e WhatsApp", "method, cta_location, link_url"],
            ["select_related_service", "Navegacao entre servicos", "equipment, page_type"],
        ], [35 * mm, 48 * mm, 87 * mm]),
        Spacer(1, 6 * mm),
        callout(
            "Privacidade e qualidade de dados",
            "Nome, telefone, endereco, bairro e descricao do problema nao sao enviados ao GA4. O Google Tag fica bloqueado em localhost para que testes manuais nao contaminem conversoes reais.",
            LIGHT_GREEN, GREEN,
        ),
        PageBreak(),
    ]

    story += [
        p("5. Agenda e avaliacoes Google", "SectionTitle"),
        p("Agenda", "SubTitle"),
        bullet("Formulario exige nome, telefone, bairro, endereco, equipamento, data, periodo, problema e consentimento."),
        bullet("Datas limitadas entre o dia atual e 60 dias, com domingo bloqueado."),
        bullet("Backend valida sessao, duplicidade, conflito, limite por horario e origem oficial."),
        bullet("Nenhum agendamento real foi enviado durante o teste para evitar alterar a agenda de producao."),
        Spacer(1, 5 * mm),
        p("Avaliacoes", "SubTitle"),
        callout(
            "Ficha publica correta confirmada em 30/08/2026",
            "Dorus Assistencia Tecnica - Alameda Yaya, 646, Guarulhos. Nota publica 4,9 com 45 avaliacoes. Place ID: ChIJZyk7iQ31zpQR0C-R3wgVywg.",
            LIGHT_GREEN, GREEN,
        ),
        Spacer(1, 5 * mm),
        p("O endpoint atualmente publicado respondeu com dados de outra ficha. O backup passou a validar o Place ID antes de aceitar a resposta. Enquanto o Apps Script nao for atualizado, o fallback correto 4,9 / 45 permanece visivel e nenhuma chave e exposta.", "BodyTextCustom"),
        callout(
            "Configuracao externa necessaria antes do deploy",
            "1. Em Propriedades do script, definir GOOGLE_PLACE_ID com o valor acima. 2. Manter GOOGLE_PLACES_API_KEY apenas no Apps Script. 3. Implantar uma nova versao do web app com o Code.gs revisado. 4. Confirmar no site que a contagem recebida e da mesma ficha.",
            LIGHT_ORANGE, ORANGE,
        ),
        PageBreak(),
    ]

    story += [
        p("6. Evidencias de teste", "SectionTitle"),
        data_table([
            ["Teste", "Cobertura", "Resultado"],
            ["Matriz visual", "22 rotas x desktop 1440x900 e mobile 390x844", "44 verificacoes aprovadas"],
            ["Responsividade", "Rolagem horizontal, titulos, CTAs e rodape", "Sem estouro"],
            ["Integridade", "Imagens, IDs duplicados, links e scripts", "Aprovado"],
            ["Site", "22 paginas, UX, acessibilidade, privacidade e HTTPS", "Aprovado"],
            ["SEO", "21 indexaveis, sitemap, Schema e imagens sociais", "Aprovado"],
            ["Agenda", "Frontend, backend, sessao, conflitos e duplicidade", "Aprovado"],
            ["GA4", "Eventos, consentimento, nomes e dados pessoais", "Aprovado"],
            ["Segredos", "Busca por padrao de chave Google", "Nenhuma chave versionada"],
            ["Sintaxe", "JavaScript e Python", "Aprovado"],
        ], [36 * mm, 92 * mm, 42 * mm]),
        Spacer(1, 7 * mm),
        p("Limites do teste", "SubTitle"),
        bullet("Nao houve deploy nem alteracao no repositorio principal."),
        bullet("Nao foi criado evento real na agenda."),
        bullet("A configuracao privada do Apps Script nao faz parte do backup e precisa ser ajustada externamente."),
        bullet("A coleta GA4 real deve ser validada no DebugView apos um deploy autorizado."),
        Spacer(1, 6 * mm),
        callout("Conclusao de QA", "Nao foram encontrados bloqueadores de layout ou navegacao na versao local. Existe uma pendencia externa controlada: corrigir o Place ID no Apps Script antes da publicacao.", LIGHT_BLUE, BLUE),
        PageBreak(),
    ]

    story += [
        p("7. Arquivos alterados e proxima aprovacao", "SectionTitle"),
        data_table([
            ["Grupo", "Arquivos principais"],
            ["UX e layout", "site.js, home-ux.css, usability.css, site.css, 404.html"],
            ["Guias e SEO", "curiosidades/index.html, index.html, google-rating.json"],
            ["Conversoes", "analytics.js, calendar-integration.js, conversion-enhancements.js, GA4-CONVERSOES.md"],
            ["Google Reviews", "google-reviews.js, integrations/google-calendar/Code.gs, README.md"],
            ["Qualidade", "scripts/check_analytics.py, scripts/check_backend.py, production-pipeline.yml"],
            ["Relatorio", "scripts/generate_qa_report.py, output/pdf/relatorio-validacao-site-dorus.pdf"],
        ], [40 * mm, 130 * mm]),
        Spacer(1, 8 * mm),
        p("Sequencia recomendada para publicacao futura", "SubTitle"),
        bullet("1. Revisar a branch de backup e aprovar visualmente."),
        bullet("2. Corrigir e reimplantar o Apps Script com o Place ID validado."),
        bullet("3. Marcar generate_lead como evento principal no GA4 e criar as dimensoes personalizadas documentadas."),
        bullet("4. Integrar a mudanca ao repositorio principal somente com autorizacao explicita."),
        bullet("5. Executar smoke test na URL publica e confirmar agenda, avaliacoes e DebugView."),
        Spacer(1, 7 * mm),
        callout(
            "Decisao solicitada",
            "Validar ou solicitar ajustes nesta branch. Nenhum deploy sera realizado sem autorizacao posterior.",
            LIGHT_GREEN, GREEN,
        ),
        Spacer(1, 8 * mm),
        p("Referencias oficiais", "SubTitle"),
        p("Google Analytics - eventos recomendados e parametros: developers.google.com/analytics/devguides/collection/ga4/reference/events", "Small"),
        p("Google Search - titulos, snippets, links rastreaveis e dados estruturados: developers.google.com/search/docs", "Small"),
    ]
    return story


def generate():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = ReportDoc(
        str(OUTPUT), pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=17 * mm,
        title="Relatorio de validacao do site D'orus",
        author="D'orus Assistencia Tecnica",
        subject="UX, SEO, GA4, agenda e avaliacoes",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")
    doc.addPageTemplates([PageTemplate(id="report", frames=[frame], onPage=page_background)])
    doc.build(build_story())
    print(OUTPUT)


if __name__ == "__main__":
    generate()
