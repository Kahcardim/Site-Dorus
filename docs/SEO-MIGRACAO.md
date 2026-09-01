# SEO e preservação de dados na migração React

## Referência

Snapshot anterior: `32ddda2730660f12d38e5b55736558b1814cb030`, branch `pre-react-2026-09-01` do backup.
Árvore confirmada: `45dea93395e97dee870e35dfafcceaafc80f9796`, idêntica à revisão pública `0aba6dbd5f4b44831b3c313cc12eee8b0c31a657`.
O contrato em `tests/fixtures/pre-react-contract.json` registra os metadados, textos dos guias/serviços/sobre/privacidade, avaliações e hashes das integrações dessa base.

Complemento integral: `tests/fixtures/pre-react-content.json` foi extraído diretamente do commit anterior com `git show`. Compara 415 blocos de H1/H2/H3, parágrafos e itens de lista das 21 páginas, normalizando apenas espaços, acentos e hífen tipográfico. As três exceções explícitas são duas instruções do carrossel antigo e uma mensagem dinâmica de formulário, não conteúdo editorial. Esse mesmo teste roda sobre o HTML publicado.

## Pesquisa de concorrentes — 01/09/2026

Amostra encontrada em buscas por conserto de geladeira, máquina de lavar e assistência de linha branca em Guarulhos e Alto Tietê. Não representa classificação fixa do Google nem comprova quem recebe mais visitas.

| Referência | Padrão observado | Aplicação na D’orus |
| --- | --- | --- |
| [Ale Técnico](https://aletecnico.com/conserto-de-geladeira/guarulhos/) | Página de serviço local com sintomas e etapas do atendimento | Preservar páginas existentes; explicar problema, cidade e solicitação |
| [Rocha Refrigeração](https://rocharefrigeracao.com.br/conserto-de-maquina-de-lavar/) | Serviço, garantia e atendimento no endereço do cliente | Recuperar conteúdo específico e condições reais da D’orus |
| [Sabtec](https://sabtec.com.br/sobre) | Serviços, cidades e marcas identificáveis | Manter esses dados em texto no HTML, sem criar páginas repetidas por cidade |

Não foram importadas promessas comerciais, avaliações, endereços, horários ou textos desses concorrentes.

## Critérios de aceite

- 21 URLs indexáveis preservadas, canonical próprio, título e descrição únicos; 404 fora do sitemap.
- Conteúdo pré-renderizado, disponível sem JavaScript; links reais e caminhos de navegação visíveis.
- Restauração dos seis guias, oito serviços, perguntas frequentes, textos institucionais e marcas, incluindo Bosch em texto.
- Organization, WebSite, WebPage, Article, Service e BreadcrumbList relacionados por identificadores estáveis.
- Quatro cidades separadas em `areaServed`, sem endereço físico inventado ou promessa de estrelas nos resultados.
- Metadados de compartilhamento, imagens e idiomas preservados.
- Axe WCAG A/AA em 21 rotas, mobile e desktop, além dos testes de formulários sem envio real.
- Lighthouse antes da publicação: home anterior e React no mesmo ambiente, três execuções mobile; serviços/guias por amostragem. Notas são de laboratório, não posições de busca.
- Pós-deploy: revisão exata no HTML, HTTP das páginas/arquivos, 404 real, conteúdo/metadados e hashes de GA4/agenda comparados com o contrato do backup.

## Diferenças intencionais e limites

O HTML/CSS muda pela componentização. A lista de marcas não tem rolagem automática; instruções antigas do carrossel não se aplicam. Há novos breadcrumbs, links e explicações de atendimento. As avaliações podem mudar pela sincronização: o relatório registra antes/depois, não exige congelar a contagem.

Testes automáticos não substituem leitura por pessoa, leitor de tela, validação comercial ou conferência de agendamento real. O Search Console deve ser usado após publicação para inspecionar URLs e acompanhar impressões, cliques e indexação; não houve acesso aos seus dados nesta etapa.

Referências técnicas: [SEO com JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=pt-BR), [classificação local](https://support.google.com/business/answer/7091?hl=pt-BR) e [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization).
