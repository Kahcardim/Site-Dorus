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

## Funcionalidades

- Páginas de serviços e guias com navegação interna rastreável.
- Contato direto por telefone e WhatsApp.
- Solicitação de visita com integração de agenda e alternativa por WhatsApp.
- Agenda real validada para uma janela mínima mensal, com bloqueio de datas passadas e domingos.
- Nota e quantidade de avaliações sincronizadas com o Google.
- Carrosséis com teclado, controles de pausa e respeito à redução de movimento.
- Preferências de cookies e integração de métricas.
- Layout responsivo, imagens adaptativas e garantia em destaque.

## Tecnologias

React · Vite · JavaScript · CSS · Playwright · axe-core · Lighthouse · GitHub Actions · GitHub Pages

As integrações utilizam Google Apps Script e scripts Python executados nos fluxos de manutenção.

## Executar localmente

Requisitos: Node.js 22 e Python 3.12 para os testes de manutenção. As versões das dependências estão fixadas no projeto.

```bash
npm ci
npm run dev
```

Para conferir a versão estática:

```bash
npm run build
npm run preview
```

## Estrutura principal

| Diretório | Responsabilidade |
| --- | --- |
| `src/pages/` | Páginas e jornadas de atendimento |
| `src/components/` | Componentes compartilhados |
| `src/data/` | Conteúdo editorial, catálogo e metadados |
| `src/hooks/` | Avaliações, consentimento e preferências de acessibilidade |
| `src/styles/` | Estilos organizados por responsabilidade |
| `public/` | Arquivos públicos, imagens e integrações do navegador |
| `scripts/` | Geração estática, validações e manutenção |
| `tests/` | Testes unitários, manutenção e referências isoladas |
| `integrations/google-calendar/` | Código da integração com a agenda |
| `.github/workflows/` | Qualidade, publicação e sincronização de avaliações |

## Qualidade

```bash
npx playwright install chromium
npm run check
```

A validação cobre 21 rotas indexáveis, página 404, conteúdo disponível sem JavaScript, metadados, dados estruturados, links, formulários, carrosséis e geometria responsiva. A regressão inclui verificações automáticas de acessibilidade com axe-core e uma leitura contra o serviço real da agenda para confirmar a janela mensal necessária ao negócio.

Os testes automatizados complementam a revisão manual; não representam uma certificação de acessibilidade nem uma garantia de posicionamento no Google. Relatórios Lighthouse e capturas ficam disponíveis nas execuções do GitHub Actions.

## Publicação e integrações

O GitHub Pages recebe o conteúdo gerado em `dist/` após a aprovação da pipeline. Mudanças apenas de documentação e builds equivalentes não exigem uma nova publicação. A validação pós-publicação confere a revisão entregue, as páginas, os dados de conteúdo e o SEO técnico.

As credenciais do Google ficam nos secrets do GitHub Actions ou na configuração do serviço correspondente, nunca no código enviado ao navegador. Instruções de desenvolvimento e manutenção estão em [docs/DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md).

## Autor

Desenvolvido por [Kauan Cardim](https://github.com/Kahcardim) para a D’orus Assistência Técnica.

Documentação: [Desenvolvimento](docs/DESENVOLVIMENTO.md) · [Testes](docs/TESTES.md) · [SEO](docs/SEO.md) · [Analytics](docs/ANALYTICS.md) · [Arquitetura](docs/ARQUITETURA.md) · [Recovery](docs/RECOVERY.md)
