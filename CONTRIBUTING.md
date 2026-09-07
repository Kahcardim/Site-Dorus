# Contribuição e governança

Este repositório representa um produto em produção. Mudanças devem preservar rastreabilidade, regras de negócio e possibilidade de rollback.

## Fluxo padrão

1. Criar branch a partir da `main` atualizada.
2. Manter a alteração restrita ao objetivo do trabalho.
3. Abrir Pull Request para `main` com critérios de aceite e risco explícitos.
4. Aguardar os checks obrigatórios.
5. Não integrar com falha P0 ou P1.
6. Integrar por **squash merge** para que cada entrega relevante gere um commit de produto na `main`.
7. Deixar a pipeline de produção publicar exatamente o build aprovado.
8. Conferir a revisão publicada e os testes pós-deploy.

## Política da `main`

A política operacional é **sem push direto**. Alterações devem chegar por Pull Request validado.

A proteção administrativa do GitHub deve exigir os checks da `Pipeline de producao` e impedir integração enquanto um gate obrigatório estiver vermelho.

## Risco

- **P0 / High:** agenda, dados do cliente, consentimento, WhatsApp, regras comerciais, capacidade e duplicidade.
- **P1 / High:** rotas, conteúdo sem JavaScript, Menu Digital, carrosséis, acessibilidade A/AA e identidade oficial.
- **P2 / Medium:** capturas, geometria complementar e auditorias manuais ampliadas.
- **P3 / Low:** refinamentos sem impacto funcional.

Um único P0/P1 reprovado bloqueia a release.

## Evidência mínima de PR

- objetivo e benefício;
- escopo incluído e fora do escopo;
- critérios de aceite;
- riscos e dependências;
- testes executados;
- evidências relevantes;
- impacto em produção e plano de rollback quando aplicável.

## Commits e histórico

Branches de trabalho podem ter commits intermediários. A `main` deve receber a entrega consolidada por squash. Não reescrever a história publicada e não apagar evidências de incidentes apenas para deixar o histórico visualmente menor.

## Deploy

Não criar workflows paralelos para publicar o mesmo site. A `Pipeline de producao` é a fonte única de publicação e evita deploy quando o fingerprint do build é equivalente ao publicado.
