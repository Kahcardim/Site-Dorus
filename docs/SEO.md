# SEO técnico e preservação de conteúdo

A geração estática entrega títulos, texto, links e dados estruturados antes de executar JavaScript. As 21 rotas indexáveis possuem canonical, title e description próprios. A página 404 não integra o sitemap.

## Contratos de qualidade

Os arquivos em `tests/fixtures/pre-react-*.json` preservam a referência de conteúdo e integrações: 415 blocos editoriais, metadados, tipos de schema e hashes dos scripts de agenda e métricas.

A referência original é o commit `32ddda2730660f12d38e5b55736558b1814cb030` do backup, árvore `45dea93395e97dee870e35dfafcceaafc80f9796`. Esses contratos não são atualizados automaticamente para fazer um teste passar.

Há três substituições de mensagens de interface documentadas no contrato, sem exclusão editorial. A nota e a quantidade de avaliações são dinâmicas e não devem ser congeladas no valor histórico.

## Dados e navegação

- Preservar páginas de equipamento, guias, perguntas frequentes, marcas e regiões em texto rastreável.
- Relacionar Organization, WebSite, WebPage, Article, Service e BreadcrumbList com identificadores estáveis.
- Manter as cidades atendidas separadas em `areaServed`.
- Não inventar endereço, credenciamento, avaliações ou promessas comerciais.
- Preservar dados de compartilhamento e textos alternativos adequados.
- Evitar páginas duplicadas por região sem conteúdo realmente distinto.

## Validação

`npm run test:static` confere o build com os contratos. `scripts/validate-deployment.mjs` faz a conferência do domínio publicado, incluindo revisão, conteúdo, integrações e resposta 404 real.

A auditoria Lighthouse mede desempenho em laboratório. Indexação, posições, impressões e cliques devem ser acompanhados no Search Console; nenhum teste de build garante sua evolução.

Referências: [SEO com JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=pt-BR), [classificação local](https://support.google.com/business/answer/7091?hl=pt-BR) e [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization).
