# Site D’orus

Site institucional da D’orus Assistência Técnica, desenvolvido para apresentar os serviços da empresa e facilitar o contato e o agendamento de visitas técnicas em Guarulhos e região.

## Recursos

- páginas responsivas para desktop, tablet e celular;
- catálogo de serviços com imagens específicas para desktop e mobile;
- atendimento e solicitação de visita pelo WhatsApp;
- lembrete opcional no Google Agenda;
- carrossel de marcas e avaliações;
- recursos de acessibilidade por teclado, contraste, tamanho de texto, redução de movimento e leitura em voz alta;
- comandos de voz em navegadores compatíveis;
- consentimento de cookies e página de privacidade;
- metadados para SEO e compartilhamento social;
- validações automáticas e publicação pelo GitHub Pages.

## Tecnologias

HTML, CSS e JavaScript sem framework. Os arquivos do site ficam no próprio repositório e a publicação é feita pela branch `main`.

## Executar localmente

Com Python instalado:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador.

## Publicação

O GitHub Actions valida a estrutura do site antes da publicação e executa auditorias de qualidade e desempenho. O deploy é realizado pelo GitHub Pages.
