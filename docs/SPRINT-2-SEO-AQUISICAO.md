# Sprint 2 — Aquisição Orgânica Local

## Objetivo
Transformar a presença digital da D’orus em aquisição orgânica qualificada para buscas comerciais, priorizando conserto de geladeira, conserto de máquina de lavar/lavadora e lava e seca em Guarulhos.

## Estratégia de Git
- `main`: produção estável.
- `feature/seo-sprint-2`: desenvolvimento da Sprint 2.
- `backup/pre-sprint2-2026-09-05`: ponto de restauração antes da Sprint 2.
- `perf/desktop-critical-css`: correção de performance existente a ser incorporada somente após validação.
- Mudanças da Sprint 2 não devem ir diretamente para `main` sem build, testes e revisão.

## Prioridades
### P0
- Reestruturar home e hub de serviços para enfatizar intenção comercial.
- Fortalecer `/servicos/geladeiras/` para “conserto de geladeira em Guarulhos”.
- Fortalecer `/servicos/maquinas-de-lavar/` para “conserto de máquina de lavar / lavadora em Guarulhos”.
- Revisar títulos, descrições, schema e áreas de atendimento.
- Remover promessas comerciais não confirmadas dos metadados.

### P1
- Reforçar `/servicos/lava-e-seca/`.
- Criar links internos entre guias de sintomas e páginas de serviço.
- Distribuir avaliações reais como prova social contextual.
- Trabalhar Centro de Guarulhos, Lago dos Patos, Bonsucesso e Pimentas de forma natural.
- São Paulo deve ser tratado como atendimento sob consulta/conforme disponibilidade.

### P2
- Revisar dados estruturados LocalBusiness/Service.
- Validar rastreamento de cliques para WhatsApp.
- Incorporar a correção de critical CSS após testes.

## Critérios de aceite
- Build sem erro.
- Testes unitários, estáticos, manutenção e regressão aprovados.
- Sem regressão visual relevante em desktop ou mobile.
- Titles, descriptions, canonical, sitemap e schema coerentes.
- Páginas prioritárias com H1 comercial claro, conteúdo útil, sintomas, marcas, atendimento, prova social, links internos e CTA.
- Nenhuma página deve inventar certificações, peças originais, prazo, preço ou condição de garantia não validada.
- `main` permanece intacta até a aprovação final.

## Métricas de acompanhamento
Comparar no Search Console antes/depois:
- impressões;
- cliques;
- CTR;
- posição média;
- consultas contendo “geladeira”, “máquina de lavar”, “lavadora”, “lava e seca” e “Guarulhos”.

Conversão:
- cliques em WhatsApp por landing page;
- contatos originados das páginas prioritárias.
