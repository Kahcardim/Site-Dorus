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
- `/sobre/` — história, experiência e posicionamento
- `/servicos/` — catálogo de serviços
- `/servicos/<equipamento>/` — páginas comerciais por equipamento
- `/curiosidades/` — central de guias
- `/curiosidades/<guia>/` — conteúdo informacional ligado aos serviços
- `/agendamento/` — solicitação de visita
- `/fale-conosco/` — contato
- `/privacidade/` — privacidade e cookies

Os nomes das pastas públicas acompanham URLs já indexáveis e não devem ser renomeados sem plano de redirecionamento.

## SEO

A fonte usa Schema.org compatível com o modelo atual do negócio:

- `Organization` e `WebSite` na Home
- `Service` nas páginas de serviço, com `provider: Organization`
- `Article` nos guias
- `BreadcrumbList` adicionado no processo de publicação

O pipeline rejeita endereço residencial, `ApplianceRepair`, avaliação autoatribuída no Schema e inconsistências entre sitemap e canonicals.

## Acessibilidade

O site possui skip link, foco visível, ajuste de texto, redução de movimento, leitura em voz alta, navegação por voz e alto contraste. A camada `accessibility-contrast.css` garante que menus desktop e mobile continuem visíveis quando o contraste é ativado.

## Privacidade e métricas

Google Analytics 4 é carregado de acordo com o consentimento de cookies. Eventos de conversão incluem WhatsApp, telefone e agendamento. Dados de clientes não devem ser versionados no repositório.

## Agendamento

O formulário prepara a solicitação e possui fallback para WhatsApp. A disponibilidade online depende de uma integração externa com Google Apps Script e deve degradar sem quebrar a jornada do usuário.

## Qualidade e publicação

Fluxo recomendado:

1. trabalhar em branch curta;
2. abrir Pull Request para `main`;
3. aguardar os checks de qualidade, SEO e consistência;
4. fazer **squash merge**;
5. aguardar GitHub Pages;
6. executar smoke pós-deploy.

O deploy executa enriquecimento de metadados, cache bust dos assets e publicação no GitHub Pages.

## Regras do repositório

- não versionar credenciais, dados pessoais de clientes ou endereço residencial;
- manter URLs públicas estáveis;
- alterações de Schema devem passar pelos validadores em `scripts/`;
- mudanças visuais precisam preservar responsividade e acessibilidade;
- conteúdo de serviço deve refletir somente atividades realmente oferecidas pela D’orus.
