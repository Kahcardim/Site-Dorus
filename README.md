# D’orus Assistência Técnica

Site institucional e plataforma de geração de contatos locais da **D’orus Assistência Técnica**, empresa de área de serviço especializada em manutenção de eletrodomésticos de linha branca.

## Objetivo

Transformar pesquisas locais e dúvidas sobre defeitos em contatos qualificados por WhatsApp ou solicitação de visita, mantendo uma experiência rápida, acessível e consistente com o Perfil da Empresa no Google.

## Área de atendimento

- Guarulhos
- Arujá
- Itaquaquecetuba
- São Paulo, conforme disponibilidade

O endereço residencial usado como base operacional **não é publicado no site, metadados ou dados estruturados**.

## Estrutura pública

- `/` — página inicial e conversão
- `/sobre/` — história e posicionamento
- `/servicos/` — catálogo de serviços
- `/servicos/<equipamento>/` — páginas comerciais por equipamento
- `/curiosidades/` — central editorial de guias
- `/curiosidades/<guia>/` — conteúdo ligado aos serviços
- `/agendamento/` — solicitação de visita
- `/fale-conosco/` — contato
- `/privacidade/` — privacidade e cookies

Os diretórios públicos permanecem em português porque fazem parte das URLs canônicas já publicadas. Renomeá-los sem redirecionamentos seria uma regressão de SEO.

## Estrutura técnica

- `assets/brands/` — logos locais das marcas atendidas
- `assets/servicos/` — imagens responsivas dos equipamentos
- `integrations/google-calendar/` — backend de referência da agenda em Google Apps Script
- `scripts/` — validações, enriquecimento de metadados e preparação de deploy
- `.github/workflows/` — CI, QA visual, acessibilidade e GitHub Pages

A nomenclatura técnica foi padronizada sem alterar URLs públicas indexáveis.

## SEO

A fonte usa Schema.org compatível com o modelo atual do negócio:

- `Organization` e `WebSite` na Home
- `Service` nas páginas de serviço, com `provider: Organization`
- `Article` nos guias
- `BreadcrumbList` adicionado na publicação

O pipeline rejeita endereço residencial, `ApplianceRepair`, avaliação autoatribuída no Schema, serviços comerciais não aprovados e inconsistências entre sitemap e canonicals.

## Conteúdo e links internos

Os guias respondem a dúvidas reais como “geladeira não gela”, “máquina não centrifuga” e “micro-ondas não aquece”. Cada guia direciona para a página comercial adequada e para os canais de contato, criando o fluxo **pesquisa → orientação → serviço → conversão**.

## Acessibilidade

O site possui skip link, foco visível, ajuste de texto, redução de movimento, leitura em voz alta, navegação por voz e alto contraste. `accessibility-contrast.css` protege explicitamente menus desktop e mobile para que o contraste não esconda a navegação.

## Privacidade e métricas

Google Analytics 4 é carregado conforme consentimento. Eventos de conversão incluem WhatsApp, telefone e agendamento. Dados de clientes e endereço residencial não devem ser versionados.

## Agendamento

O formulário prepara a solicitação e possui fallback para WhatsApp. A disponibilidade online depende de integração externa com Google Apps Script e deve degradar sem quebrar a jornada.

## Qualidade e publicação

Fluxo recomendado:

1. branch curta;
2. Pull Request para `main`;
3. checks de qualidade, SEO e consistência;
4. **squash merge**;
5. GitHub Pages;
6. smoke pós-deploy.

## Regras do repositório

- não versionar credenciais, dados pessoais de clientes ou endereço residencial;
- manter URLs públicas estáveis;
- mudanças de Schema devem passar pelos validadores em `scripts/`;
- mudanças visuais precisam preservar responsividade e acessibilidade;
- conteúdo deve refletir somente serviços realmente oferecidos pela D’orus.
