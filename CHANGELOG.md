## 2026-10-24 — Sem expediente aos sábados

- Atendimento de segunda a sexta-feira, das 8h às 18h, na home, serviços, contato e FAQ.
- Datas de sábado e domingo bloqueadas no cliente e no código do backend da agenda.
- Testes de rejeição de fim de semana e recuperação em dia útil.

## 2026-10-19 — SEO e clareza comercial

- Home com foco em conserto de eletrodomésticos em Guarulhos e condições da visita.
- Oito serviços com triagem específica; perguntas frequentes e fotos opcionais.
- Retirada e devolução somente de micro-ondas; demais aparelhos em domicílio.
- Atendimento de segunda a sábado, das 8h às 18h, confirmado pelo responsável.
- Micro-ondas entre os três primeiros serviços da home, após geladeiras e lavadoras.
- Imagens identificadas como ilustrativas; URLs e links entre serviços e guias preservados.
- Substituições explícitas nos contratos, mantendo a referência histórica intacta.

## 2026-10-17 — Navegação, formulários e atualização Google

- Home com acesso secundário a Fale conosco; trilhas visuais somente nas páginas detalhadas.
- Contato e agendamento usam um link contextual em vez de outro seletor de navegação.
- Aviso de cookies compacto no fluxo mobile, sem sobrepor conteúdo.
- Rejeição de campos contendo somente espaços e validação de telefone com DDD, inclusive antes da integração de agenda.
- Atualização periódica compartilhada da nota/quantidade exibidas, sem expor credenciais Google.
- Contratos de avaliações alinhados à seleção de seis já registrada em 14/09; nenhuma avaliação ou contagem foi inventada.
- Pipeline volta a tentar uma revisão não publicada após uma sincronização sem alterações.
- Testes de regressão cobrindo os casos corrigidos. Homologação manual pendente.

# Changelog

Este arquivo resume ciclos relevantes do produto. O histórico completo permanece nos commits e pull requests.

## 2026-09 — Hardening de portfólio e governança

- README reorganizado para leitura rápida de recrutadores, com problema, arquitetura, QA, CI/CD e resultados verificáveis.
- Métricas reais de Lighthouse expostas com referência à execução pós-deploy: Mobile 94/100 em Performance e 100/100 nas demais categorias; Desktop 100/100 em todas.
- Case study técnico criado para documentar decisões, trade-offs, incidentes que viraram contratos e pontos defensáveis em entrevista.
- Template de Pull Request ampliado com risco P0/P1/P2/P3, privacidade, rollback, evidências automáticas e validação manual.
- Branches obsoletos e deployments antigos do GitHub Pages limpos, preservando `main`, snapshot de recovery e experimento de performance não integrado.

## 2026-09 — Qualidade, SEO e integração

- Consolidação da aplicação em React + Vite com geração estática de HTML por rota.
- Pipeline única de produção com build, regressão, acessibilidade, comparação de desempenho e validação pós-publicação.
- Matriz de testes priorizada por risco para agendamento, dados do cliente, consentimento, WhatsApp, rotas, conteúdo e identidade visual.
- Integração de agenda com Google Apps Script e regras de capacidade, períodos, janela mensal mínima e proteção contra duplicidade.
- Sincronização automatizada da nota e da quantidade de avaliações do Google.
- Reforço de SEO local, metadados, dados estruturados, sitemap e links internos.
- Correções de privacidade para impedir que conteúdo de mensagens de WhatsApp seja enviado ao Analytics.
- Reorganização da Home para reduzir redundância de jornada, antecipar prova social e reforçar confiança no CTA final.

## 2026-08 — Reestruturação visual e operacional

- Recuperação da Home após regressões visuais, incluindo Hero, carrossel de marcas, avaliações e CTAs.
- Reorganização das páginas de serviço, guias, contato e agendamento.
- Evolução de responsividade, acessibilidade e navegação por teclado.
- Estruturação de publicação contínua via GitHub Actions e GitHub Pages.

## Convenção

Mudanças futuras devem registrar aqui apenas entregas relevantes para produto, arquitetura, qualidade ou operação. Ajustes triviais continuam documentados somente no histórico Git.


## 2026-10-17 — Controle GA4 do atendimento

- Preservados os eventos existentes e acrescentadas etapas distintas para contato iniciado e solicitação de agenda registrada.
- Acrescentados rótulos em português para forma de contato, local do botão e tipo de página.
- Formulário de contato passa a registrar intenção válida sem transmitir os campos preenchidos.
- Payloads de eventos isolados para não alterar os parâmetros de outros eventos.
- Testes unitários e regressão do formulário ampliados; configuração de dimensões e proteção de URLs feita na propriedade GA4.
- Homologação manual e acompanhamento de resultados orgânicos permanecem pendentes.
