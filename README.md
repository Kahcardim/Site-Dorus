# D’orus Assistência Técnica

Plataforma institucional e de aquisição local para uma assistência técnica de eletrodomésticos de linha branca com atendimento em domicílio na região de Guarulhos.

[Acessar o site](https://assistenciadorus.com.br/)

## Produto

O projeto transforma buscas locais e dúvidas sobre defeitos em jornadas claras de atendimento. A experiência reúne páginas comerciais por equipamento, conteúdo educativo, contato por WhatsApp e solicitação de visita.

## Destaques

- arquitetura responsiva para celular, tablet e desktop;
- SEO técnico com URLs canônicas, sitemap e dados estruturados Schema.org;
- páginas de serviço e guias conectadas por links internos;
- acessibilidade com navegação por teclado, contraste, ajuste de texto e redução de movimento;
- consentimento de cookies e métricas de conversão;
- imagens responsivas e entrega otimizada para Core Web Vitals;
- integração de agendamento com fallback seguro para WhatsApp;
- pipeline contínuo de qualidade, publicação e auditoria Lighthouse.

## Tecnologias

HTML semântico, CSS responsivo, JavaScript, Python, Google Apps Script, GitHub Actions e GitHub Pages.

## Qualidade

Cada publicação valida sintaxe, backend, identidade, acessibilidade, SEO e integridade das páginas antes do deploy. Após a publicação, o pipeline executa uma auditoria Lighthouse no domínio de produção.

## Estrutura

- `servicos/` — páginas comerciais por equipamento;
- `curiosidades/` — guias relacionados aos principais sintomas;
- `assets/` — identidade visual e imagens responsivas;
- `integrations/` — integração de agenda;
- `scripts/` — validações e preparação da publicação;
- `.github/workflows/` — integração e entrega contínuas.

## Avaliações do Google

A home mantém `4,5` e `8 avaliações` como fallback visual e tenta atualizar esses dois valores pelo mesmo Google Apps Script usado pela agenda. A chave da API nunca é enviada ao navegador.

Para ativar a atualização automática:

1. No Google Cloud, ative **Places API (New)** no projeto e crie uma chave de API restrita a essa API.
2. Obtenha o Place ID correto da D’orus.
3. No projeto do Apps Script, abra **Configurações do projeto > Propriedades do script** e crie:
   - `GOOGLE_PLACES_API_KEY`: a chave criada no Google Cloud;
   - `GOOGLE_PLACE_ID`: o Place ID da D’orus.
4. Atualize a implantação existente do Web App para uma nova versão, mantendo a execução como proprietário e o acesso público já utilizado pelo agendamento.
5. Abra a home e confirme que os dois pontos exibem a mesma nota e quantidade do perfil no Google.

O resultado fica em cache por 6 horas para reduzir custo e tráfego. Se a configuração estiver ausente, a API falhar ou a resposta for inválida, o JavaScript não modifica o HTML e o fallback permanece visível.

## Resultado

Uma presença digital rápida, acessível e orientada à conversão, preparada para descoberta orgânica local e evolução contínua do negócio.
