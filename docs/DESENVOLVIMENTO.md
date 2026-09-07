# Desenvolvimento e manutenção

## Ambiente

Requisitos principais:

- Node.js 22;
- npm com `npm ci` para instalação reproduzível;
- Python 3.12 para rotinas de manutenção;
- Chromium via Playwright para regressão de navegador.

```bash
npm ci
npm run dev
```

## Build e validação local

```bash
npm run build
npm run check
```

A aplicação é gerada como HTML estático por rota e hidratada no navegador. Não trate o projeto como SPA pura: alterações em rotas, metadados, conteúdo ou componentes compartilhados precisam ser verificadas também no HTML gerado.

## Fluxo de mudança

1. Criar branch a partir da `main` estável.
2. Registrar o risco da alteração e os critérios de aceite.
3. Implementar sem sobrescrever requisitos aprovados anteriormente.
4. Executar os testes adequados ao risco.
5. Abrir Pull Request com evidências.
6. Integrar por squash somente depois dos gates obrigatórios.
7. Validar a revisão realmente publicada no domínio público.

Mudanças P0/P1 não devem ser integradas com falha conhecida no contrato afetado.

## Agenda

O frontend integra com o Google Apps Script versionado em `integrations/google-calendar/Code.gs` e mantém fallback por WhatsApp.

O critério operacional atual exige disponibilidade para uma janela mínima de 30 dias corridos. O gate real consulta o serviço implantado somente em modo de leitura e valida passado, hoje, D+30 e domingo. Datas além de D+30 não fazem parte do bloqueio atual de release.

Criação de evento real não faz parte da regressão padrão porque modifica dados externos.

## Conteúdo, SEO e analytics

- Conteúdo aprovado é comparado com a referência histórica e com substituições explicitamente registradas.
- Metadados, canonical, sitemap e dados estruturados fazem parte do build.
- Analytics exige consentimento e não pode receber conteúdo digitado pelo cliente em mensagens.
- Atualizações da nota do Google devem preservar um valor estático utilizável no HTML.

## Evidências

A pipeline preserva capturas, relatórios de regressão, acessibilidade e Lighthouse por tempo limitado. Para decisões de release, use a execução ligada ao SHA candidato, não uma captura antiga de outra revisão.

Rollback e restauração estão documentados em [RECOVERY.md](RECOVERY.md).
