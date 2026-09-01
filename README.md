# D’orus Assistência Técnica

Site institucional de uma assistência técnica de eletrodomésticos de linha branca, com atendimento em domicílio em Guarulhos, Arujá, Itaquaquecetuba e São Paulo.

[Acessar o site](https://assistenciadorus.com.br/) · [Qualidade e publicação](https://github.com/Kahcardim/Site-Dorus/actions/workflows/production-pipeline.yml)

## O projeto

A experiência conecta quem procura ajuda para um eletrodoméstico aos canais de atendimento da empresa. Reúne serviços por equipamento, guias educativos, avaliações do Google e jornadas distintas para contato e solicitação de visita.

O site usa **React e Vite com geração estática de HTML**. Cada endereço entrega seu conteúdo, links e metadados antes da execução de JavaScript. Os componentes interativos são carregados após a primeira exibição do conteúdo, com código separado por grupo de páginas.

## Funcionalidades

- Páginas de serviços e guias com navegação interna rastreável.
- Contato direto por telefone e WhatsApp.
- Solicitação de visita com integração de agenda e alternativa por WhatsApp.
- Nota e quantidade de avaliações sincronizadas com o Google.
- Carrosséis com teclado, controles de pausa e respeito à redução de movimento.
- Preferências de cookies e integração de métricas.
- Layout responsivo, imagens adaptativas e garantia em destaque.

## Tecnologias

React · Vite · JavaScript · CSS · Playwright · axe-core · Lighthouse · GitHub Actions · GitHub Pages

As integrações utilizam Google Apps Script e scripts Python executados nos fluxos de manutenção.

## Executar localmente

Requisito: Node.js 22, versão utilizada na integração contínua.

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
| `src/styles/` | Entrada dos estilos da aplicação |
| `public/` | Arquivos públicos, imagens e integrações do navegador |
| `scripts/` | Geração estática, validações e manutenção |
| `tests/` | Testes unitários e contratos de conteúdo |
| `integrations/google-calendar/` | Código da integração com a agenda |
| `.github/workflows/` | Qualidade, publicação e sincronização de avaliações |

## Qualidade

```bash
npm run check:static
npx playwright install chromium
npm run test:regression
```

A validação cobre 21 rotas indexáveis, página 404, conteúdo disponível sem JavaScript, metadados, dados estruturados, links, formulários, carrosséis e geometria responsiva. A regressão inclui verificações automáticas de acessibilidade com axe-core.

Os testes automatizados complementam a revisão manual; não representam uma certificação de acessibilidade nem uma garantia de posicionamento no Google. Relatórios Lighthouse e capturas ficam disponíveis nas execuções do GitHub Actions.

## Publicação e integrações

O GitHub Pages recebe o conteúdo gerado em `dist/` após a aprovação da pipeline. A validação pós-publicação confere a revisão entregue, as páginas, os dados de conteúdo e o SEO técnico.

As credenciais do Google ficam nos secrets do GitHub Actions ou na configuração do serviço correspondente, nunca no código enviado ao navegador. Instruções de desenvolvimento e manutenção estão em [docs/DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md).

## Autor

Desenvolvido por [Kauan Cardim](https://github.com/Kahcardim) para a D’orus Assistência Técnica.
