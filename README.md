# D’orus Assistência Técnica

[![Pipeline de produção](https://github.com/Kahcardim/Site-Dorus/actions/workflows/production-pipeline.yml/badge.svg)](https://github.com/Kahcardim/Site-Dorus/actions/workflows/production-pipeline.yml)
[![Licença MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js 22](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](.nvmrc)
[![Lighthouse Mobile](https://img.shields.io/badge/Lighthouse%20Mobile-94%2F100-success)](https://github.com/Kahcardim/Site-Dorus/actions/runs/34132946867)
[![A11y](https://img.shields.io/badge/Acessibilidade-100%2F100-success)](https://github.com/Kahcardim/Site-Dorus/actions/runs/34132946867)

**Produto real em produção, usado como case de engenharia de software, QA e entrega contínua.**

A D’orus é uma assistência técnica de linha branca em Guarulhos e região. O projeto transforma procura local por defeitos em eletrodomésticos em uma jornada rastreável de conteúdo, confiança, WhatsApp e solicitação de visita, sem depender de servidor de aplicação em runtime.

**Produção:** [assistenciadorus.com.br](https://assistenciadorus.com.br/)  
**Case técnico:** [docs/CASE-STUDY.md](docs/CASE-STUDY.md)  
**Qualidade:** [docs/TESTES.md](docs/TESTES.md)  
**Arquitetura:** [docs/ARQUITETURA.md](docs/ARQUITETURA.md)

![Identidade visual do site D’orus](public/assets/banner-principal-dorus.webp)

## Em 30 segundos

| Dimensão | Evidência |
| --- | --- |
| Produto | Site real em produção com funil Google → conteúdo → WhatsApp/agendamento |
| Frontend | React 19 + Vite com geração estática de HTML por rota |
| Escopo | 21 rotas indexáveis + página 404 |
| QA | Matriz baseada em risco, P0/P1 bloqueiam merge e produção |
| Regressão | Playwright, axe-core, testes unitários, contratos e validação pós-deploy |
| Conteúdo | 415 blocos históricos protegidos contra perda acidental |
| Acessibilidade | 20 cenários axe em templates mobile e desktop, além de rotina nativa ampliada |
| Lighthouse | Mobile 94/100 Performance e 100/100 nas demais categorias; Desktop 100/100 em todas |
| Operação | GitHub Actions → GitHub Pages, build aprovado reutilizado e deploy idêntico evitado |
| Integrações | Google Apps Script, Google Business Profile, Analytics condicionado a consentimento |

> Métricas Lighthouse verificadas na produção em 07/09/2026. Lighthouse é dado de laboratório, não garantia de Core Web Vitals reais nem de ranking.

## O que este projeto demonstra

Este repositório foi tratado como produto em operação, não como landing page isolada. As decisões que mais interessam em uma avaliação técnica são:

- **arquitetura proporcional ao problema:** React para composição, SSG para SEO e resiliência, sem servidor Node permanente;
- **QA orientado a risco:** agenda, dados do cliente, WhatsApp, consentimento e regras comerciais são tratados como bloqueadores;
- **prevenção de regressão:** contratos de conteúdo, geometria responsiva, acessibilidade e jornadas críticas são verificados automaticamente;
- **CI/CD defensável:** o artefato testado é o mesmo publicado, builds equivalentes não geram deploy desnecessário e produção é revalidada depois da publicação;
- **privacidade por contrato:** conteúdo preenchido em mensagens de WhatsApp não pode vazar para eventos de Analytics;
- **decisões registradas:** arquitetura, recovery, matriz de testes e mudanças relevantes possuem documentação própria.

## Resultados verificáveis

Última auditoria pós-deploy de referência: [GitHub Actions #154](https://github.com/Kahcardim/Site-Dorus/actions/runs/34132946867).

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 94 | 100 | 100 | 100 | 1,4 s | 0 | 290 ms |
| Desktop | 100 | 100 | 100 | 100 | 0,5 s | 0 | 0 ms |

Na mesma execução, a validação pós-publicação confirmou:

- 21 páginas publicadas e seus dados principais;
- 415 blocos de títulos, parágrafos e listas protegidos contra regressão;
- sitemap, canonical, dados estruturados, breadcrumbs e destinos internos;
- agenda real disponível em modo de leitura para a janela mensal exigida pelo negócio;
- build publicado correspondente exatamente à revisão aprovada.

## Problema de negócio

A D’orus precisa transformar busca local em contato qualificado sem adicionar infraestrutura desnecessária ao negócio. O fluxo principal é:

**pesquisa local → página de serviço ou guia → prova de confiança → WhatsApp ou solicitação de visita**

Isso cria quatro requisitos técnicos centrais:

1. conteúdo precisa existir antes do JavaScript para descoberta e resiliência;
2. celular é jornada prioritária, mas desktop não pode degradar;
3. falha de agenda externa não pode eliminar o canal de atendimento;
4. mudanças de alto risco não podem chegar à produção apenas porque o build compilou.

## Arquitetura

```text
Busca / acesso direto
        │
        ▼
GitHub Pages
        │
        ├── HTML estático por rota
        ├── CSS + imagens responsivas
        └── hidratação React progressiva
                    │
                    ├── WhatsApp
                    ├── Google Apps Script / agenda
                    ├── Google Business Profile / avaliações
                    └── Analytics após consentimento

GitHub Actions
        │
        ├── unitários e contratos
        ├── build estático + SEO
        ├── Playwright + axe-core
        ├── agenda real somente leitura
        ├── comparação de performance
        ├── publicação do build aprovado
        └── Lighthouse + validação pós-deploy
```

### Por que SSG em vez de SSR ou SPA pura

O conteúdo comercial muda com baixa frequência, SEO local é importante e não existe requisito de personalização por requisição. SSG permite entregar HTML completo, reduzir pontos de falha e publicar no GitHub Pages.

SSR adicionaria infraestrutura e observabilidade de runtime sem benefício proporcional. SPA pura aumentaria a dependência da hidratação para conteúdo, navegação e descoberta orgânica.

Trade-offs e critérios para rever essa decisão estão documentados em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Estratégia de QA

O projeto não usa "pipeline verde" como sinônimo de qualidade. A matriz diferencia risco de negócio:

| Prioridade | Exemplos | Regra |
| --- | --- | --- |
| P0 / High | agenda, dados do cliente, consentimento, WhatsApp, capacidade, duplicidade | qualquer falha bloqueia release |
| P1 / High | rotas, conteúdo sem JS, carrosséis, identidade, acessibilidade A/AA | qualquer falha bloqueia release |
| P2 / Medium | geometria complementar, evidência visual e auditorias ampliadas | exige análise registrada |
| P3 / Low | refinamentos sem impacto funcional | pode seguir para backlog |

A suíte consolidada trabalha com **67 casos modelados**, distribuídos entre contratos, backend da agenda, rotas, formulários, carrosséis, acessibilidade, geometria, conteúdo e produção. O detalhamento está em [docs/TESTES.md](docs/TESTES.md).

## CI/CD

A pipeline de produção executa, em sequência:

1. gate rápido de sintaxe, contratos, build e manutenção;
2. regressão Playwright e acessibilidade;
3. validação somente leitura da agenda real;
4. comparação de desempenho;
5. preservação exata do build aprovado;
6. fingerprint para evitar deploy de build idêntico;
7. publicação no GitHub Pages;
8. Lighthouse mobile/desktop;
9. validação de conteúdo, integrações e revisão publicada.

Esse desenho reduz o risco de testar um artefato e publicar outro.

## Funcionalidades do produto

- Oito jornadas de assistência para equipamentos de linha branca.
- Guias orientados a intenção de busca e links internos para serviços.
- Contato via WhatsApp com copy pré-preenchida.
- Solicitação de visita com agenda e fallback para WhatsApp.
- Janela mensal de agendamento com restrições de passado, domingo, capacidade e períodos.
- Avaliações reais do Google em carrossel com autoplay, pausa e respeito a redução de movimento.
- Consentimento de cookies e Analytics condicionado à preferência do usuário.
- Responsividade com validação automatizada em mobile e desktop.
- SEO técnico com canonical, sitemap, JSON-LD e breadcrumbs.

## Stack

**Frontend:** React 19, Vite, JavaScript, CSS  
**QA:** Playwright, axe-core, Node Test Runner, Python unittest, Lighthouse  
**CI/CD:** GitHub Actions, GitHub Pages  
**Integrações:** Google Apps Script, Google Business Profile, GA4  
**Runtime de desenvolvimento:** Node.js 22, Python 3.12

## Estrutura do repositório

| Diretório | Responsabilidade |
| --- | --- |
| `src/pages/` | páginas e jornadas de atendimento |
| `src/components/` | componentes compartilhados |
| `src/data/` | conteúdo editorial, catálogo e metadados |
| `src/hooks/` | avaliações, consentimento e acessibilidade |
| `src/styles/` | estilos por responsabilidade |
| `public/` | arquivos públicos e integrações do navegador |
| `scripts/` | SSG, regressão, auditorias e manutenção |
| `tests/` | unidade, manutenção e referências isoladas |
| `integrations/google-calendar/` | integração versionada da agenda |
| `.github/workflows/` | qualidade, deploy e manutenção do repositório |

## Executar localmente

Pré-requisitos: Node.js **22.12 ou superior**, npm e Python 3.12 para manutenção.
Consulte [o guia de desenvolvimento](docs/DESENVOLVIMENTO.md) para Windows e integrações.

```bash
npm ci
npm run dev
```

Build estático:

```bash
npm run build
npm run preview
```

Suíte principal:

```bash
npx playwright install --with-deps chromium
npm run check
```

## Limites das evidências

Os 67 casos são cenários modelados, não percentual de cobertura nem contagem de testes executados. As verificações axe e Lighthouse não certificam conformidade WCAG completa. Não há neste case evidência de aumento de receita, conversão, tráfego ou Core Web Vitals de campo.

A política de revisão por PR é operacional: em 07/09/2026 a `main` ainda estava sem proteção administrativa. Veja [governança](CONTRIBUTING.md) e [evidências reproduzíveis](docs/EVIDENCIAS.md).

## Documentação técnica

- [Evidências e limites das métricas](docs/EVIDENCIAS.md)
- [Contribuição](CONTRIBUTING.md)
- [Segurança](SECURITY.md)
- [Case study](docs/CASE-STUDY.md)
- [Decisões de arquitetura](docs/ARQUITETURA.md)
- [Matriz de testes e critérios de aceite](docs/TESTES.md)
- [Desenvolvimento](docs/DESENVOLVIMENTO.md)
- [SEO](docs/SEO.md)
- [Analytics e privacidade](docs/ANALYTICS.md)
- [Rollback, recovery e backup](docs/RECOVERY.md)
- [Changelog](CHANGELOG.md)

## Responsabilidade no projeto

Projeto desenvolvido e mantido por [Kauan Cardim](https://github.com/Kahcardim), cobrindo decisões de produto, frontend, QA, automação, SEO técnico, CI/CD e operação do site em produção.

A intenção deste repositório como portfólio é mostrar **processo de engenharia e capacidade de manter um produto real**, não apenas o resultado visual da interface.
