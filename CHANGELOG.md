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
