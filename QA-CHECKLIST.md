# Checklist de regressão da D’orus

Este checklist deve ser executado antes de qualquer publicação no site principal e também no repositório de backup.

## Padronização entre páginas principais e secundárias

- As oito páginas de aparelhos devem seguir a mesma estrutura visual: cabeçalho centralizado, imagem responsiva, CTA superior, garantia mínima de 90 dias e CTA final profissional.
- O CTA superior deve exibir “Fale conosco”, abrir o WhatsApp com o aparelho no contexto e usar `noopener noreferrer`.
- A garantia deve aparecer logo abaixo do CTA superior, centralizada e sem transformar o texto em duas colunas estreitas.
- O CTA final deve oferecer “Ver horários” e “Enviar pelo WhatsApp” em todos os oito aparelhos.
- Títulos, textos introdutórios e cabeçalhos de seções equivalentes devem manter alinhamento, largura e espaçamento consistentes.
- Links do diretório de Guias devem abrir a página correta de cada um dos oito aparelhos.
- Os seis artigos secundários do Guia devem manter título centralizado, CTA compacto, link para o serviço relacionado, “Fale conosco” contextual e garantia mínima de 90 dias.
- O CTA e os cabeçalhos equivalentes dos artigos do Guia devem seguir o mesmo eixo visual das páginas principais em desktop e celular.
- Páginas relacionadas não podem apresentar quebra horizontal em desktop, tablet ou celular.
- No celular e no tablet, o cabeçalho com o botão “Menu” deve permanecer acessível durante a rolagem; o menu deve abrir, permitir rolagem interna quando necessário e fechar normalmente.

## Agenda

- Caixa e texto do consentimento devem permanecer na mesma linha visual e ter área de clique confortável.
- A seleção deve oferecer somente Manhã (8h às 13h), Tarde (13h às 18h) e Dia inteiro (8h às 18h).
- Manhã e tarde aceitam no máximo 5 clientes cada; Dia inteiro só aparece quando ainda existe vaga nos dois períodos e ocupa uma vaga em ambos.
- Todos os campos obrigatórios precisam impedir envio incompleto e levar o foco ao primeiro campo inválido.
- A consulta de horários deve ser testada apenas em modo de leitura; nenhum evento real deve ser criado durante o smoke test.
- A ponte do Google deve carregar fora da área visível, sem usar o atributo `hidden`, e mudar o seletor para o modo de horários quando estiver pronta.
- Com várias contas Google conectadas, a leitura pública deve ignorar cookies, carregar os períodos disponíveis e manter o envio pelo WhatsApp caso a ponte protegida não inicialize.
- Quando a agenda automática estiver indisponível, o fallback pelo WhatsApp deve permanecer utilizável e informar a limitação ao visitante.

## Acessibilidade nativa

- Não deve existir botão ou painel flutuante de acessibilidade sobre o conteúdo.
- O site deve acompanhar as preferências do dispositivo para redução de movimento, aumento de contraste, cores forçadas, redução de transparência e ponteiro por toque.
- As preferências devem ser consultadas apenas localmente com media queries, sem armazenamento, fingerprinting ou envio ao GA4.
- Foco por teclado, link “Pular para o conteúdo”, nomes acessíveis, zoom de texto e áreas de toque de no mínimo 44 px devem continuar funcionando.
- Em `forced-colors`, links, botões, campos, navegação móvel e CTAs devem permanecer visíveis e distinguíveis.

## Página de Serviços e carrossel de marcas

- Preservar exatamente os oito cards de equipamentos e validar todos os destinos.
- Validar as seções Como funciona, Marcas atendidas, Áreas atendidas, diferenciais, prova social, FAQ e CTA final em desktop, tablet e celular.
- Confirmar title, meta description, canonical, um único H1, hierarquia H2/H3 e schemas BreadcrumbList, Service e FAQPage.
- O carrossel deve expor uma lista semântica; a cópia usada somente para o loop visual deve permanecer oculta para leitores de tela.
- Setas do teclado, pausa, retomada, redução de movimento e mensagens em `aria-live` devem funcionar sem alterar o visual.
- Com consentimento negado e em ambiente local, nenhuma interação deve ser enviada ao GA4.
- Com consentimento aceito em produção, pausa, retomada, avanço, retorno e arraste devem usar `brand_carousel_interaction`, sem dados pessoais.
- Não criar páginas de marca nesta sprint.

## Regressão global

- Validar as 22 rotas em 1440×900, 768×1024 e 390×844.
- Verificar imagens, links internos, menu móvel, CTAs, rodapé, SEO, Schema, consentimento, GA4, acessibilidade e ausência de rolagem horizontal.
- Confirmar que produção e backup apontam para o mesmo commit aprovado.
