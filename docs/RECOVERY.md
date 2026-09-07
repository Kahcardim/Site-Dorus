# Rollback, recovery e backup

## Objetivo

Restaurar rapidamente uma versão conhecida do site sem mascarar a causa da falha e sem sobrescrever evidências necessárias para análise.

## Princípios

1. Não corrigir produção diretamente pela branch `main`.
2. Identificar primeiro a última revisão aprovada e a revisão defeituosa.
3. Preservar logs, relatórios, capturas e SHA da publicação com problema.
4. Reverter por commit/PR, mantendo histórico auditável.
5. Executar novamente os gates P0/P1 antes de considerar a recuperação concluída.

## Rollback do site

### 1. Confirmar o incidente

Registrar:

- URL e jornada afetada;
- SHA publicado;
- horário aproximado do início;
- dispositivo/navegador quando aplicável;
- impacto de negócio;
- evidências da pipeline e do domínio público.

### 2. Localizar uma revisão conhecida

Use o histórico da `main`, Pull Requests mesclados e execuções da `Pipeline de producao` para localizar o último SHA aprovado antes da regressão.

O snapshot criado antes deste ciclo é `backup/pre-portfolio-layout-2026-09-07`.

Não use apenas aparência visual como critério. A revisão escolhida precisa preservar contratos de conteúdo, dados, SEO e regras de negócio ainda válidos.

### 3. Criar reversão rastreável

Preferir um novo PR que reverta o commit ou conjunto de commits responsável. Não reescrever a história da `main` e não fazer force-push.

### 4. Validar antes da publicação

Executar pelo menos:

```bash
npm ci
npx playwright install --with-deps chromium
npm run check
```

Para incidentes de P0/P1, a reversão não deve ser integrada com qualquer falha restante nesses níveis.

### 5. Validar após publicação

Confirmar:

- revisão publicada;
- Home, contato e agendamento;
- WhatsApp e telefone;
- 21 rotas indexáveis e 404;
- dados estruturados e sitemap;
- garantia, avaliações e identidade;
- relatório pós-deploy e Lighthouse quando o fluxo tiver publicado novo build.

## Recuperação das integrações

### Agenda

O código versionado do Apps Script fica em `integrations/google-calendar/Code.gs`, mas a implantação real no Google Apps Script é um ativo externo ao GitHub Pages. Antes de considerar a agenda recuperada, validar em modo de leitura as regras de data, domingo, capacidade e períodos. Para a operação atual, a janela mínima exigida é de 30 dias corridos; datas além de D+30 não bloqueiam release.

Criação de evento real exige autorização específica e não faz parte da regressão automatizada padrão.

### Analytics

Confirmar que consentimento continua obrigatório e que URLs de CTA enviadas ao Analytics não incluem query string ou fragmento contendo dados do cliente.

### Avaliações

A sincronização das avaliações pode ser reexecutada pelo workflow próprio. Falha de sincronização não deve ser tratada como motivo para apagar dados válidos já publicados.

## Backup independente

O repositório Git e os artefatos temporários do GitHub Actions não são, sozinhos, uma estratégia completa de backup independente.

Para este ciclo, a restauração do snapshot `backup/pre-portfolio-layout-2026-09-07` é validada em um runner limpo do GitHub Actions, em diretório separado da árvore candidata. O controle comprova que a revisão conhecida pode ser recuperada e gerar novamente o site sem depender do clone de desenvolvimento.

Para uma estratégia de continuidade fora do mesmo provedor, ainda é recomendável manter:

- cópia verificável do repositório e histórico relevante em outro ponto de falha;
- exportação/registro da implantação do Google Apps Script;
- documentação dos identificadores e configurações necessários para restaurar integrações, sem armazenar secrets em texto aberto;
- evidência periódica de que a cópia externa pode ser restaurada.

### Critério de aceite da verificação deste ciclo

A verificação do snapshot do GitHub é concluída quando a pipeline do PR final fizer checkout do backup em diretório separado e executar instalação, build e testes estáticos com sucesso. A cópia externa a outro provedor continua sendo um controle adicional de continuidade, não uma condição para publicar este site.
