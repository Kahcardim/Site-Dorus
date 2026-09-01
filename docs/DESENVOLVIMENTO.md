# Desenvolvimento e manutenção

## Arquitetura

A aplicação é multipágina. Os links utilizam endereços reais e cada navegação recebe um documento HTML completo. Não há necessidade de um servidor Node.js em produção.

- `src/routes.jsx`: catálogo de rotas, metadados associados e componentes.
- `src/entry-server.jsx`: renderização de HTML e metadados durante o build.
- `scripts/build-react.mjs`: geração de páginas, sitemap e arquivos em `dist/`.
- `src/entry-client.jsx`: início do carregamento interativo após a primeira pintura de conteúdo.
- `src/hydrate.jsx`: hidratação dos componentes React.
- `src/seo.js`: breadcrumbs e dados estruturados.

Os componentes das páginas são resolvidos durante a geração estática. No navegador, são carregados por grupo de páginas com React.lazy e Suspense. O HTML publicado não depende da resolução desses componentes para apresentar seu conteúdo.

## Conteúdo e identidade

Edite o conteúdo em `src/data/` e os componentes em `src/`. Evite manter cópias divergentes de textos comerciais. Preserve a identificação da empresa, os canais de contato, as regiões atendidas e as condições da garantia.

As imagens e integrações publicadas ficam em `public/`. Não publique credenciais nesse diretório: seus arquivos são acessíveis pelo navegador.

## Dependências que exigem cuidado

A árvore atual ainda mantém arquivos de referência na raiz. Eles não devem ser confundidos com a saída publicada, que é `dist/`.

Antes de mover ou excluir arquivos, confira estas dependências:

- `src/styles/main.css` importa folhas de estilo da raiz; elas participam do build.
- `scripts/audit-performance.mjs` utiliza a versão de referência da raiz para comparação de desempenho.
- `tests/fixtures/` contém contratos usados na verificação de conteúdo, identidade e SEO.
- Workflows adicionais e scripts de manutenção podem referenciar caminhos antigos.

A organização dessas referências deve manter os testes reproduzíveis e a aparência da aplicação. Ausência de importação em um componente React, isoladamente, não prova que um arquivo seja dispensável.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento com Vite |
| `npm run build` | Geração estática |
| `npm run preview` | Conferência do build |
| `npm test` | Testes unitários |
| `npm run test:static` | Verificação do conteúdo gerado e SEO; exige build |
| `npm run check:static` | Testes unitários, build e verificações estáticas |
| `npm run test:regression` | Regressão no navegador; exige build e Chromium |
| `npm run check` | Conjunto de verificações estáticas e regressão |

Para preparar o navegador de testes:

```bash
npx playwright install --with-deps chromium
```

As capturas e relatórios locais são gerados em `test-results/`. Não substituem a revisão manual das jornadas e do conteúdo comercial.

## Avaliações do Google

O workflow `Sincronizar avaliações Google` consulta a Places API (New) a cada seis horas ou por acionamento manual. O arquivo publicado é `public/google-rating.json`, usado como valor inicial no HTML e consultado também pelo navegador.

Configure no GitHub Actions:

- `GOOGLE_PLACES_API_KEY`: chave restrita à API utilizada.
- `GOOGLE_PLACE_ID`: identificador da ficha da empresa previamente validada.

Não use credenciais de outras empresas. A atualização da nota e da quantidade não implica importar automaticamente todos os textos de depoimentos; os depoimentos exibidos são mantidos no catálogo de conteúdo.

## Agenda e métricas

O código do serviço de agenda está em `integrations/google-calendar/Code.gs`. A integração utilizada no navegador está em `public/integrations/calendar.js`; as métricas utilizam `public/integrations/analytics.js`.

Os testes de regressão interceptam os fluxos externos para não criar visitas nem enviar mensagens reais. Uma validação ponta a ponta com serviços externos deve utilizar um procedimento de teste explicitamente autorizado.

## Critérios antes da integração

1. Executar o conjunto de testes relevante e conferir as capturas.
2. Verificar home, contato, agendamento, páginas de serviço e guias no celular e desktop.
3. Preservar URLs, conteúdo rastreável, metadados, dados estruturados e links internos.
4. Conferir avaliações, garantia, carrosséis e identificação multimarcas.
5. Revisar o diff e manter apenas alterações relacionadas à tarefa.
6. Após uma publicação, confirmar a revisão entregue e a validação no domínio público.

Use o roteiro em [TESTE-MANUAL-REACT.md](TESTE-MANUAL-REACT.md) como complemento aos testes automatizados.
