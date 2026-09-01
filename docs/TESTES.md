# Testes e critérios de aceite

## Preparação

Use a branch em revisão, Node.js 22 e Python 3.12.

```bash
npm ci
npx playwright install --with-deps chromium
npm run check
npm run preview
```

Registre URL, largura/dispositivo, passos, resultado atual, resultado esperado e captura para cada defeito. Não integre alterações com falhas críticas ou altas.

## Home e apresentação

- [ ] Nota e quantidade de avaliações aparecem no topo e correspondem ao resumo da seção de depoimentos.
- [ ] Os depoimentos existentes são preservados; não confundir sua quantidade com o total do Google.
- [ ] Título, introdução e CTAs mantêm alinhamento consistente.
- [ ] A identificação “Assistência multimarcas” permanece legível junto à imagem.
- [ ] Banner e imagens de equipamentos não ficam deformados ou cortados indevidamente.
- [ ] Garantia mínima de 90 dias continua visível.
- [ ] Carrosséis funcionam com setas, teclado e gesto; pausa e redução de movimento são respeitadas.
- [ ] Rodapé mantém dados da empresa e autoria.

## Páginas e navegação

- [ ] Conferir as 21 páginas indexáveis e a página 404.
- [ ] Verificar oito serviços, seis guias e seus links relacionados.
- [ ] Contato prioriza os canais diretos; o formulário complementar é opcional.
- [ ] Agendamento apresenta data/período e os dados necessários à visita.
- [ ] Menu, WhatsApp flutuante e CTAs não cobrem controles nem conteúdo essencial.
- [ ] Testar 390 px, 768 px, 1440 px e 1920 px; incluir tela baixa de notebook.

## Agenda e formulários

- [ ] Campos obrigatórios impedem envio incompleto, com identificação do erro.
- [ ] Mensagem de WhatsApp conserva o aparelho e os dados informados.
- [ ] Consentimento é obrigatório onde previsto e possui área de clique confortável.
- [ ] Indisponibilidade da agenda mantém o contato por WhatsApp utilizável.
- [ ] Conferir com o backend os períodos Manhã (8h–13h), Tarde (13h–18h) e Dia inteiro (8h–18h).
- [ ] Conferir o limite de cinco clientes por período e a ocupação de uma vaga em ambos no dia inteiro.
- [ ] Conferir a janela de 60 dias, restrição de domingos e disponibilidade real.
- [ ] Consultar disponibilidade em modo de leitura. Criação de evento real exige autorização específica.

As regras operacionais acima exigem revisão manual e do serviço de agenda. Uma aprovação do frontend não comprova, sozinha, a disponibilidade ou o funcionamento do backend.

## Acessibilidade e privacidade

- [ ] “Pular para o conteúdo” recebe foco e alcança o conteúdo principal.
- [ ] Teclado permite usar menu, formulários, carrosséis e preferências de cookies.
- [ ] Foco visível, contraste e nomes acessíveis permanecem adequados.
- [ ] Zoom de texto em 200% e cores forçadas mantêm leitura e controles utilizáveis.
- [ ] Preferências de redução de movimento e contraste do dispositivo são respeitadas.
- [ ] Cookie banner pode ser fechado e reaberto; rejeitar analytics impede seu carregamento.
- [ ] Testes locais não enviam métricas nem dados pessoais para o Google.

A rotina manual “QA acessibilidade nativa” executa cenários adicionais com texto em 200% e cores forçadas sobre o build estático.

## SEO e publicação

- [ ] Conteúdo completo está disponível sem JavaScript.
- [ ] Cada página mantém title, description, canonical e dados estruturados.
- [ ] Sitemap e links internos apontam para URLs reais e existentes.
- [ ] Confirmar a revisão efetivamente publicada e o HTTP 404 de endereços inexistentes.
- [ ] Conferir capturas e relatórios da pipeline, sem tratar nota Lighthouse como garantia de ranking.

Os contratos de conteúdo e a base de referência são independentes da produção. O backup não deve ser atualizado ou publicado automaticamente para acompanhar cada release.
