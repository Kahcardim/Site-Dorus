# Decisões de arquitetura

## Contexto do produto

A D’orus depende principalmente de descoberta local e conversão para contato direto. O site precisa entregar conteúdo indexável, carregar rápido em dispositivos móveis, continuar legível sem JavaScript e manter jornadas de contato e agendamento simples.

## Geração estática em vez de SPA pura

A aplicação utiliza React e Vite para composição e manutenção, mas gera HTML estático para cada rota indexável durante o build.

### Motivos

- O conteúdo principal, links e metadados ficam disponíveis antes da execução de JavaScript.
- O GitHub Pages consegue servir o produto sem servidor de aplicação.
- A estratégia reduz dependência de runtime e simplifica rollback.
- SEO local e rastreabilidade de rotas não ficam condicionados à hidratação do React.

### Trade-offs

- O build precisa gerar e validar todas as rotas.
- Conteúdo dinâmico exige integração separada ou atualização periódica de dados estáticos.
- Uma alteração global pode exigir reconstrução de todas as páginas.

## Por que não SSR

SSR adicionaria servidor, observabilidade de runtime, custo operacional e mais pontos de falha para um produto cujo conteúdo principal muda com baixa frequência. Para este caso, SSG entrega os benefícios relevantes de HTML pré-renderizado sem introduzir infraestrutura permanente.

SSR passaria a ser justificável se o produto dependesse de personalização por requisição, autenticação, conteúdo altamente dinâmico ou dados que precisassem ser renderizados no servidor em tempo real.

## Por que Vite

Vite foi escolhido como ferramenta de desenvolvimento e build por oferecer ciclo local simples, integração direta com React e saída estática compatível com GitHub Pages. O projeto evita adicionar framework full-stack quando o problema não exige servidor.

## Hidratação progressiva e code-splitting

O HTML é produzido no build por `src/entry-server.jsx`. No navegador, `src/entry-client.jsx` e `src/hydrate.jsx` iniciam a camada interativa após a primeira entrega de conteúdo. Os grupos de páginas são carregados de forma separada com React.lazy e Suspense.

Essa separação permite tratar HTML indexável e comportamento interativo como contratos relacionados, mas validáveis de forma independente.

## Integrações externas

### Agenda

A agenda utiliza Google Apps Script. O frontend trabalha com uma bridge controlada e mantém fallback para WhatsApp quando o serviço não está disponível. As regras de negócio relevantes também são testadas fora do ambiente Google para evitar depender de chamadas reais durante regressão.

### Analytics

O Analytics respeita consentimento e não deve receber conteúdo de mensagens preenchidas pelo cliente. Testes locais impedem carregamento do GA4 e usam marcadores fictícios para detectar vazamento de dados.

### Avaliações do Google

Nota e quantidade de avaliações são sincronizadas por workflow e publicadas em JSON. A aplicação mantém valores iniciais no HTML para não depender exclusivamente de JavaScript ou de uma chamada externa no carregamento.

## Estratégia de qualidade

A pipeline trata qualidade como gate de release, não como relatório opcional. P0 e P1 bloqueiam integração e publicação. O conjunto cobre unidade, contratos de negócio, build estático, SEO, navegador, acessibilidade e validação pós-deploy.

Detalhes e matriz de risco: [TESTES.md](TESTES.md).

## Publicação e recuperação

O GitHub Actions preserva exatamente o build aprovado e evita publicar builds equivalentes. O processo de recuperação está documentado em [RECOVERY.md](RECOVERY.md).
