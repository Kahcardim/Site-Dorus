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

A home mantém `4,9` e `45 avaliações` como fallback visual. O workflow `Sincronizar avaliações Google` consulta a Places API (New) a cada 6 horas, atualiza `google-rating.json` somente quando houver mudança e aciona a pipeline de publicação. A chave da API nunca é enviada ao navegador nem gravada no repositório.

Para ativar a atualização automática:

1. No Google Cloud, ative **Places API (New)** no projeto e crie uma chave de API restrita a essa API.
2. No repositório principal do GitHub, configure os secrets de Actions:
   - `GOOGLE_PLACES_API_KEY`: chave restrita à Places API (New);
   - `GOOGLE_PLACE_ID`: `ChIJZyk7iQ31zpQR0C-R3wgVywg` (ficha pública Dorus Assistência Técnica, Alameda Yayá, 646, Guarulhos).
3. Execute manualmente o workflow uma vez e confirme que `google-rating.json` recebe a nota e a quantidade da ficha correta.
4. Abra a home publicada e confirme os mesmos valores no resumo e na seção de avaliações.

O script recusa um Place ID diferente da ficha validada. Se a configuração estiver ausente, a API falhar ou a resposta for inválida, o workflow falha sem substituir os dados publicados e o fallback permanece visível. O repositório de backup não precisa conter os secrets.

## Resultado

Uma presença digital rápida, acessível e orientada à conversão, preparada para descoberta orgânica local e evolução contínua do negócio.
