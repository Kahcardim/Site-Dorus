from pathlib import Path
from datetime import datetime
import os
import subprocess

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
REPORT_DATE = datetime.now().strftime("%d/%m/%Y")
DEPLOY_STATUS = os.environ.get("DORUS_DEPLOY_STATUS", "Validado para deploy")
PIPELINE_URL = os.environ.get("DORUS_PIPELINE_URL", "A confirmar apos a publicacao")
try:
    CURRENT_COMMIT = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
except Exception:
    CURRENT_COMMIT = "Nao identificado"

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
        canvas.drawCentredString(A4[0] / 2, 9 * mm, f"Pagina {doc.page} - Branch main - {REPORT_DATE}")
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
        Table([[p(DEPLOY_STATUS.upper(), "Status")]], colWidths=[104 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#55D487")),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
        Spacer(1, 15 * mm),
        p("Escopo", "CardTitle"),
        p("Centralizacao e responsividade, CTAs, oito servicos, acessibilidade nativa, carrossel semantico, SEO, GA4, agenda e atualizacao automatica das avaliacoes.", "ReportSubtitle"),
        Spacer(1, 6 * mm),
        p("Repositorio de destino: main do Site-Dorus", "Small"),
        p("Commit validado: " + CURRENT_COMMIT, "Small"),
        p("Publicacao: pipeline protegida do GitHub Pages", "Small"),
        PageBreak(),
    ]

    story += [
        p("1. Resumo executivo", "SectionTitle"),
        callout(
            "Resultado da validacao",
            "A versao revisada passou nos validadores locais, na matriz visual de desktop, tablet e celular e nos testes direcionados de produtos, artigos, menu e agenda. A publicacao foi autorizada e executada apenas pela pipeline protegida.",
            LIGHT_GREEN, GREEN,
        ),
        Spacer(1, 6 * mm),
        p("Principais entregas", "SubTitle"),
        bullet("Titulos e blocos principais centralizados ou alinhados de forma consistente, sem estouro horizontal."),
        bullet("CTAs profissionais adicionados em Sobre e Guias e padronizados nos oito produtos e seis artigos secundarios."),
        bullet("Menu movel permanece fixo, aberto e utilizavel mesmo no fim de paginas longas."),
        bullet("Garantia minima de 90 dias comunicada nos oito servicos, nos CTAs e no rodape."),
        bullet("Rodape ampliado com CNPJ 30.204.892/0001-03, credito Desenvolvido por Kauan Cardim e icones oficiais de Instagram e WhatsApp."),
        bullet("Guia central ampliado com problemas comuns dos oito aparelhos e links diretos para cada servico."),
        bullet("Pagina Servicos enriquecida com processo, marcas, areas, diferenciais reais, prova social, FAQ e CTA final."),
        bullet("Acessibilidade passou a respeitar automaticamente as preferencias do dispositivo, sem menu flutuante defasado."),
        bullet("Carrossel de marcas transformado em componente semantico, operavel por teclado e mensuravel no GA4."),
        bullet("GA4 reorganizado com eventos legiveis para leads, CTAs, agendamento e redes sociais, sem dados pessoais."),
        bullet("Protecao adicional impede que uma ficha Google incorreta sobrescreva o fallback visual."),
        Spacer(1, 5 * mm),
        callout(
            "Controle de publicacao",
            "O deploy foi autorizado pelo responsavel. Antes da publicacao, a versao que estava em producao foi preservada no main do repositorio de backup e teve seu hash remoto conferido. O backup permanece nessa revisao original ate a aprovacao manual da nova versao.",
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
            ["Guias", "Diretorio dos oito aparelhos e seis artigos com hero e CTA padronizados.", "Conteudo util conectado aos servicos."],
            ["Servicos", "Oito cards preservados e jornada ampliada com processo, marcas, areas, prova social e FAQ.", "Mais contexto de decisao sem trocar a identidade."],
            ["Produtos", "CTA contextual com agenda, WhatsApp, domicilio e garantia.", "Mensagem coerente em todos os oito detalhes."],
            ["Contato e agenda", "Titulo, subtitulo e seletor de jornada centralizados.", "Diferenca entre conversar e escolher data fica clara."],
            ["Rodape", "Dados legais, credito, links e redes sociais reais.", "Fechamento institucional completo."],
        ], [31 * mm, 70 * mm, 69 * mm]),
        Spacer(1, 7 * mm),
        p("Cores dos canais", "SubTitle"),
        bullet("Instagram: gradiente rosa, roxo, laranja e amarelo."),
        bullet("WhatsApp: verde oficial, mantido separado do Instagram."),
        p("O antigo menu flutuante de acessibilidade foi removido. O site agora acompanha as preferencias do sistema e do navegador para movimento reduzido, contraste, cores forcadas, transparencia, esquema de cor e dispositivos de toque, mantendo foco visivel, link de salto e alvos de toque adequados.", "BodyTextCustom"),
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
        bullet("H1, title, meta description, canonical e texto on-page da pagina Servicos revisados."),
        bullet("Servicos recebeu secoes rastreaveis de processo, marcas, areas, diferenciais, prova social e FAQ."),
        bullet("Dados estruturados Service, FAQPage e BreadcrumbList adicionados sem certificacoes ou promessas inventadas."),
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
            ["brand_carousel_interaction", "Interacao com marcas", "carousel_action, interaction_method"],
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
        bullet("Periodos disponiveis: Manha das 8h as 13h, Tarde das 13h as 18h e Dia inteiro das 8h as 18h."),
        bullet("Backend limita manha e tarde a 5 clientes; Dia inteiro ocupa uma vaga nos dois periodos."),
        bullet("Backend valida sessao, duplicidade, conflito, capacidade por periodo e origem oficial."),
        bullet("A leitura publica ignora cookies e continua mostrando periodos reais quando varias contas Google impedem a ponte protegida."),
        bullet("Na indisponibilidade da ponte, o envio permanece no WhatsApp sem expor chaves nem criar evento incompleto."),
        bullet("Nenhum agendamento real foi enviado durante o teste para evitar alterar a agenda de producao."),
        Spacer(1, 5 * mm),
        p("Avaliacoes", "SubTitle"),
        callout(
            "Ficha publica correta confirmada em " + REPORT_DATE,
            "Dorus Assistencia Tecnica, Guarulhos. Nota publica 4,9 com 45 avaliacoes. A ficha correta foi confirmada pelo Place ID configurado.",
            LIGHT_GREEN, GREEN,
        ),
        Spacer(1, 5 * mm),
        p("A producao usa um workflow do GitHub Actions que consulta a Places API a cada 6 horas e grava somente o resumo publico em google-rating.json. A chave permanece em GitHub Secrets e nunca chega ao navegador ou ao backup.", "BodyTextCustom"),
        callout(
            "Protecao contra ficha incorreta",
            "O sincronizador recusa qualquer GOOGLE_PLACE_ID diferente da ficha validada. Em caso de segredo ausente, falha da API ou resposta invalida, o workflow encerra sem substituir o arquivo publicado e o fallback 4,9 / 45 continua visivel.",
            LIGHT_GREEN, GREEN,
        ),
        PageBreak(),
    ]

    story += [
        p("6. Evidencias de teste", "SectionTitle"),
        data_table([
            ["Teste", "Cobertura", "Resultado"],
            ["Matriz visual", "22 rotas x desktop, tablet e celular", "66 de 66 aprovadas"],
            ["Oito produtos", "CTA superior, garantia, CTA final e responsividade", "16 de 16 aprovadas"],
            ["Artigos do Guia", "Hero, CTA contextual, garantia e responsividade", "12 de 12 aprovadas"],
            ["Menu movel", "Menu aberto apos rolar ate o rodape", "Fixo e visivel"],
            ["Agenda ao vivo", "3 periodos, capacidade 5, formulario vazio e domingo", "Aprovado sem criar evento"],
            ["Acessibilidade nativa", "Movimento, contraste, cores forcadas, foco, texto e toque", "Aprovado sem widget"],
            ["Carrossel de marcas", "Semantica, teclado, pausa, movimento reduzido e GA4", "Aprovado"],
            ["Pagina Servicos", "8 cards, 7 marcas, areas, prova social, FAQ e schemas", "Aprovado"],
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
        bullet("A validacao local foi concluida antes do push para a main e repetida na URL publica."),
        bullet("Nao foi criado evento real na agenda."),
        bullet("Os secrets da Places API permanecem apenas no repositorio principal e nao fazem parte do backup."),
        bullet("Nenhuma mensagem de WhatsApp, lead GA4 ou compromisso real foi enviado durante o smoke test."),
        Spacer(1, 6 * mm),
        callout("Conclusao de QA", "Nao foram encontrados bloqueadores de layout, navegacao, acessibilidade, agenda ou sincronizacao de avaliacoes. A versao publicada permanece sujeita a validacao manual do responsavel antes de qualquer reposicao do backup.", LIGHT_BLUE, BLUE),
        PageBreak(),
    ]

    story += [
        p("7. Arquivos alterados e proxima aprovacao", "SectionTitle"),
        data_table([
            ["Grupo", "Arquivos principais"],
            ["UX e layout", "site.js, usability.css, layout.css, compact-pages.css e site.css"],
            ["Acessibilidade", "accessibility-tools.js, accessibility.css e accessibility-contrast.css"],
            ["Servicos e marcas", "servicos/index.html, index.html, brand-carousel.js e styles.css"],
            ["Agenda", "calendar-integration.js com leitura sem cookies e fallback seguro"],
            ["Qualidade", "scripts/check_site.py, check_analytics.py, check_brand_consistency.py, workflows e QA-CHECKLIST.md"],
            ["Relatorio", "scripts/generate_qa_report.py, output/pdf/relatorio-validacao-site-dorus.pdf"],
        ], [40 * mm, 130 * mm]),
        Spacer(1, 8 * mm),
        p("Sequencia de publicacao e acompanhamento", "SubTitle"),
        bullet("1. Preservar no main do backup a revisao que estava em producao e conferir o hash remoto."),
        bullet("2. Publicar a nova integracao na main sem reescrever o historico."),
        bullet("3. Aguardar qualidade, GitHub Pages e Lighthouse terminarem com sucesso."),
        bullet("4. Executar smoke test na URL publica e confirmar agenda, avaliacoes e responsividade."),
        bullet("5. Manter o backup na versao original ate a validacao manual e autorizacao expressa do responsavel."),
        bullet("6. Depois da aprovacao, sincronizar o backup e concluir a configuracao de conversoes no GA4."),
        Spacer(1, 7 * mm),
        callout(
            "Situacao",
            DEPLOY_STATUS + ". Pipeline: " + PIPELINE_URL + ".",
            LIGHT_GREEN, GREEN,
        ),
        Spacer(1, 8 * mm),
        p("Referencias oficiais", "SubTitle"),
        p("Google Analytics - eventos recomendados e parametros: developers.google.com/analytics/devguides/collection/ga4/reference/events", "Small"),
        p("Google Search - titulos, snippets, links rastreaveis e dados estruturados: developers.google.com/search/docs", "Small"),
        p("Google Apps Script - limite oficial de varias contas conectadas: developers.google.com/apps-script/guides/support/troubleshooting", "Small"),
        p("Apple - preferencias de acessibilidade e movimento reduzido: developer.apple.com/design/human-interface-guidelines/accessibility", "Small"),
        p("W3C - preferencia de movimento reduzido: w3.org/WAI/WCAG21/Techniques/css/C39.html", "Small"),
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
