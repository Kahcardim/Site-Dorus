# D’orus Assistência Técnica

[![Pipeline de produção](https://github.com/Kahcardim/Site-Dorus/actions/workflows/production-pipeline.yml/badge.svg)](https://github.com/Kahcardim/Site-Dorus/actions/workflows/production-pipeline.yml)
[![Licença MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js 22](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](.nvmrc)

Site institucional em produção para uma assistência técnica de eletrodomésticos de linha branca, com atendimento em domicílio em Guarulhos, Arujá, Itaquaquecetuba e São Paulo.

**Produção:** [assistenciadorus.com.br](https://assistenciadorus.com.br/)  
**Pipeline:** [qualidade e publicação](https://github.com/Kahcardim/Site-Dorus/actions/workflows/production-pipeline.yml)

![Home da D’orus em desktop](docs/media/home-desktop.png)

## Problema de negócio

A D’orus precisa transformar procura local por defeitos em eletrodomésticos em contato qualificado, sem criar uma operação digital mais complexa do que o negócio exige. O fluxo principal é pesquisa local → página de serviço ou guia → confiança → WhatsApp ou solicitação de visita.

O produto precisa, ao mesmo tempo:

- entregar conteúdo indexável e útil antes do JavaScript;
- funcionar bem em celular e desktop;
- preservar canais de atendimento durante falhas de integrações externas;
- tratar agenda, dados de cliente, consentimento e regras comerciais como riscos de release;
- permitir publicação e rollback sem servidor de aplicação permanente.

## Solução técnica

A interface usa **React 19 + Vite**, mas não é uma SPA dependente de JavaScript para entregar conteúdo. O build gera HTML completo por rota, incluindo conteúdo, links, metadados e dados estruturados. A camada interativa é hidratada depois da primeira entrega e os grupos de páginas são carregados separadamente.

A produção é publicada no GitHub Pages por GitHub Actions. A agenda utiliza Google Apps Script, a nota do Google é sincronizada por workflow e o Analytics só é carregado após consentimento.

### Por que SSG em vez de SSR ou SPA pura

**SSG** foi escolhido porque o conteúdo comercial muda com baixa frequência, a descoberta orgânica é central para o negócio e o produto não precisa de servidor Node em runtime.

Isso entrega HTML indexável, reduz pontos de falha e simplifica recuperação. O custo assumido é reconstruir as rotas quando o conteúdo muda e manter integrações dinâmicas separadas do HTML estático.

**SSR** adicionaria infraestrutura e observabilidade de runtime sem benefício proporcional neste caso. **SPA pura** reduziria a robustez do conteúdo sem JavaScript e aumentaria a dependência da hidratação para navegação e SEO.

A decisão completa e seus trade-offs estão em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Arquitetura

| Camada | Responsabilidade |
| --- | --- |
| `src/pages/` | Páginas e jornadas de atendimento |
| `src/components/` | Componentes compartilhados |
| `src/data/` | Conteúdo editorial, catálogo e metadados |
| `src/hooks/` | Avaliações, consentimento e preferências de acessibilidade |
| `src/styles/` | Estilos organizados por responsabilidade |
| `public/` | Arquivos públicos, imagens e integrações do navegador |
| `scripts/` | Build, auditorias, regressão e manutenção |
| `tests/` | Testes unitários, contratos e referências históricas |
| `integrations/google-calendar/` | Código versionado da integração de agenda |
| `.github/workflows/` | Qualidade, publicação e sincronização |

## Qualidade orientada a risco

A matriz consolidada possui **67 casos modelados**, distribuídos em **19 P0, 40 P1 e 8 P2**. Não há aprovação por média: uma falha P0 ou P1 bloqueia a publicação.

A pipeline valida:

- 28 testes unitários e de contratos no candidato atual;
- 21 rotas indexáveis e página 404;
- conteúdo completo sem JavaScript;
- metadados, Schema, sitemap e links internos;
- agenda, formulários, limites de campos e regras comerciais;
- carrosséis e geometria responsiva;
- 20 cenários automáticos de acessibilidade com axe-core;
- consentimento e isolamento de dados do Analytics;
- regressão de navegador e capturas mobile/desktop;
- restauração de snapshot em runner separado;
- Lighthouse antes e depois de publicação;
- validação pós-deploy da revisão realmente entregue.

A matriz, critérios P0/P1/P2 e roteiro manual estão em [docs/TESTES.md](docs/TESTES.md).

## Evidência de desempenho

Baseline do candidato React validado na execução **#123** da pipeline, antes desta reorganização estrutural:

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 100 | 100 | 100 | 100 | 0 | 0 ms |
| Desktop | 100 | 100 | 100 | 100 | 0 | 0 ms |

Os números são dados de laboratório, não uma promessa de Core Web Vitals reais ou posicionamento orgânico. A release final é reavaliada antes e depois do deploy e os relatórios ficam nos artefatos do GitHub Actions.

## Integrações e privacidade

### Agenda

O formulário consulta disponibilidade por data e período. O backend limita capacidade, evita duplicidade e bloqueia datas inválidas. A interface mantém WhatsApp como fallback quando a integração automática não responde.

O serviço real também possui um gate somente leitura que valida passado, hoje, D+60, D+61 e domingo antes de permitir publicação.

### Analytics

O GA4 começa negado e só é carregado após consentimento. URLs enviadas em eventos removem query string e fragmento para impedir que o conteúdo de mensagens de WhatsApp com dados do cliente seja copiado para Analytics.

### Avaliações do Google

Nota e quantidade são sincronizadas periodicamente. Os depoimentos exibidos são conteúdo editorial separado do total de avaliações do perfil.

## Executar localmente

Requisitos: Node.js 22 e Python 3.12.

```bash
npm ci
npm run dev
```

Build estático:

```bash
npm run build
npm run preview
```

Regressão completa:

```bash
npx playwright install --with-deps chromium
npm run check
```

## Publicação, rollback e backup

A pipeline preserva o build que passou pelos gates e compara seu fingerprint com a versão publicada. Builds equivalentes não geram novo deploy.

O processo de rollback preserva SHA, evidências e histórico, e usa nova alteração rastreável em vez de force-push. O procedimento completo está em [docs/RECOVERY.md](docs/RECOVERY.md).

## Histórico de evolução

Entregas relevantes por ciclo estão em [CHANGELOG.md](CHANGELOG.md). O histórico técnico detalhado permanece nos commits, Pull Requests e execuções da pipeline.

## Documentação

[Arquitetura](docs/ARQUITETURA.md) · [Desenvolvimento](docs/DESENVOLVIMENTO.md) · [Testes](docs/TESTES.md) · [SEO](docs/SEO.md) · [Analytics](docs/ANALYTICS.md) · [Recovery](docs/RECOVERY.md)

## Autor e licença

Desenvolvido por [Kauan Cardim](https://github.com/Kahcardim) para a D’orus Assistência Técnica.

O código original deste repositório é distribuído sob a [licença MIT](LICENSE). Marcas, nomes comerciais, avaliações e ativos de terceiros permanecem propriedade de seus respectivos titulares.
