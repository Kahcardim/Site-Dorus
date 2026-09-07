# Evidências técnicas e reprodução

## Auditoria de referência

Valores conferidos nos logs do [job Lighthouse 101779157159](https://github.com/Kahcardim/Site-Dorus/actions/runs/34132946867/job/101779157159), execução de 07/09/2026, revisão `81e525422fbf2924a26d6a950171db7729c2e0d5`.

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 94 | 100 | 100 | 100 | 1,4 s | 0 | 290 ms |
| Desktop | 100 | 100 | 100 | 100 | 0,5 s | 0 | 0 ms |

Método: Lighthouse 12 em Chrome headless no runner Ubuntu; perfil mobile padrão e preset desktop; URL de produção com parâmetro da execução. Trata-se de uma execução por perfil, sem mediana estatística. Ambiente, rede e serviços externos podem alterar resultados. TBT não é INP; não há dados de campo ou ganhos comerciais demonstrados.

O mesmo log registra 21 páginas publicadas e 415 blocos de conteúdo conferidos contra a referência `32ddda2730660f12d38e5b55736558b1814cb030`. São contratos de integridade, não indicadores de tráfego ou indexação pelo Google.

## Onde verificar

| Afirmação | Fonte | Limite |
| --- | --- | --- |
| Build e regressão | [Execução de referência](https://github.com/Kahcardim/Site-Dorus/actions/runs/34132946867), job Build e regressão React | Resultado daquela revisão |
| 20 cenários axe | [Matriz](TESTES.md), `scripts/regression/accessibility.mjs`, relatório `accessibility.json` | Verificação automática por template; não certificação WCAG |
| 67 casos modelados | [Matriz e distinção entre modelagem e implementação](TESTES.md) | Não é contagem de testes executados nem cobertura percentual |
| Agenda externa | Job Agenda real somente leitura e revalidação pós-deploy | Não comprova criação de evento real |
| HTML antes do JS | `scripts/build-react.mjs`, `src/entry-server.jsx` e regressão de rotas | Interatividade requer JavaScript |
| Revisão publicada | Job pós-deploy e `scripts/validate-deployment.mjs` | Documentação posterior pode ter SHA diferente do produto publicado |

Os artefatos `lighthouse-34132946867` e `react-qa-34132946867` têm retenção configurada de 14 dias. Os links podem expirar; esta tabela preserva o resumo conferido, não substitui os JSONs originais. Não descreva esses números como uma auditoria nova.

## Reproduzir

1. Usar a revisão desejada, Node.js 22.12 ou superior e Python 3.12.
2. Executar `npm ci`, instalar Chromium com `npx playwright install --with-deps chromium` e rodar `npm run check`.
3. Consultar `test-results/` e registrar SHA, comandos, ambiente e falhas. No Windows, seguir [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).
4. Para comparar performance local, executar `node scripts/audit-performance.mjs` com Lighthouse 12 disponível, como na pipeline.
5. Auditoria de produção e leitura real de agenda são verificações separadas; não acionar um deploy apenas para renovar números do portfólio.

## Evidências de decisões

- [Arquitetura](ARQUITETURA.md): SSG, alternativas, consequências e critérios para adotar SSR.
- [Case study](CASE-STUDY.md): problema, correções e trade-offs.
- [PR #30](https://github.com/Kahcardim/Site-Dorus/pull/30): correção da mensagem pré-preenchida do WhatsApp.
- [PR #32](https://github.com/Kahcardim/Site-Dorus/pull/32): apresentação do portfólio e revisão documental.
- [Recovery](RECOVERY.md): reversão auditável sem reescrever a main.
