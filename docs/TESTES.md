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

## Gate de produção por risco

| Prioridade  | Escopo                                                                                               | Regra de publicação                        |
| ----------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| P0 / High   | Agendamento, dados do cliente, consentimentos, WhatsApp, regras comerciais, capacidade e duplicidade | Qualquer falha bloqueia merge e produção   |
| P1 / High   | Rotas, conteúdo sem JavaScript, Menu Digital, carrosséis, acessibilidade A/AA e identidade oficial   | Qualquer falha bloqueia merge e produção   |
| P2 / Medium | Capturas, geometria complementar e auditorias manuais ampliadas                                      | Exige análise e aceite registrado          |
| P3 / Low    | Refinamentos sem impacto funcional                                                                   | Pode seguir para backlog com justificativa |

Não há aprovação por média: um único caso P0/P1 reprovado mantém o deploy bloqueado.

## Matriz automatizada consolidada

| Camada                         | Cobertura obrigatória                                                                                                      | Execução                                  | Evidência                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| Unidade e contratos            | Estado do carrossel, condições da visita, períodos, limites dos campos, paleta do Menu Digital e invariantes de rotas      | Todo PR e push de código                  | Saída do Node Test Runner                  |
| Backend da agenda              | Obrigatórios, telefone, limites, saneamento, hoje, passado, domingo, capacidade, integral, lock e duplicidade              | Todo PR e push de código                  | Saída do Node Test Runner                  |
| Build estático                 | 21 rotas, 404, H1, conteúdo estático, arquivos, WhatsApp e formulários                                                     | Todo PR e push de código                  | Logs de build e `test:static`              |
| SEO e conteúdo                 | Metadados únicos, Schema, sitemap, links internos e 415 blocos da referência histórica                                     | Todo PR e push de código                  | Logs de `test:seo`                         |
| Navegador funcional            | 21 rotas com e sem JavaScript, Menu Digital, cookies, contato, agenda, carrosséis e ausência de overflow                   | Todo PR e push de código                  | `regression-summary.json` e capturas       |
| Acessibilidade automática      | axe WCAG A/AA em 10 templates funcionais, mobile e desktop                                                                 | Todo PR e push de código                  | `accessibility.json` — 20 cenários         |
| Acessibilidade nativa ampliada | 21 rotas, mobile/desktop, texto 200%, cores forçadas e movimento reduzido                                                  | Sob demanda antes de mudança visual ampla | Workflow `QA acessibilidade nativa`        |
| Produção                       | Revisão publicada, 21 páginas, integrações, 404 real, agenda disponível no mês e Lighthouse mobile/desktop                | Após publicação                           | `post-deploy.json` e relatórios Lighthouse |

### Decisões de deduplicação

- As 21 rotas continuam verificadas integralmente nas camadas estática e de navegador.
- O axe roda por template representativo, pois repetir páginas que compartilham o mesmo componente não aumenta a detecção proporcionalmente ao custo.
- A verificação nativa exaustiva permanece disponível sob demanda e não duplica mais todo pull request.
- Hashes imutáveis das integrações foram removidos do gate: impediam correções legítimas. Regras funcionais explícitas agora validam agenda e analytics.
- A referência histórica continua isolada e imutável para detectar perda de conteúdo, sem congelar código operacional.

## Home e apresentação

- [ ] Nota e quantidade de avaliações aparecem no topo e correspondem ao resumo da seção de depoimentos.
- [ ] Os depoimentos existentes são preservados; não confundir sua quantidade com o total do Google.
- [ ] Título, introdução e CTAs mantêm alinhamento consistente.
- [ ] A identificação “Assistência multimarcas” permanece legível junto à imagem.
- [ ] Banner e imagens de equipamentos não ficam deformados ou cortados indevidamente.
- [ ] Garantia mínima de 90 dias continua visível.
- [ ] Carrosséis funcionam com setas, teclado e gesto; pausa e redução de movimento são respeitadas.
- [ ] Setas ficam desativadas quando todos os itens já estão visíveis (QA-001).
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
- [ ] Nome (100), bairro (120), endereço (250), marca/modelo (120) e problema (1.500) respeitam os mesmos limites do backend.
- [ ] Mensagem de WhatsApp conserva o aparelho e os dados informados.
- [ ] Consentimento é obrigatório onde previsto e possui área de clique confortável.
- [ ] Indisponibilidade da agenda mantém o contato por WhatsApp utilizável.
- [ ] Conferir com o backend os períodos Manhã (8h–13h), Tarde (13h–18h) e Dia inteiro (8h–18h).
- [ ] Conferir o limite de cinco clientes por período e a ocupação de uma vaga em ambos no dia inteiro.
- [ ] Garantir janela mínima de 30 dias corridos para agendamento, restrição de domingos e disponibilidade real.
- [ ] Conferir passado, hoje, D+30 e domingo; hoje e D+30 são válidos quando não forem domingo e houver disponibilidade.
- [ ] Datas além de D+30 não fazem parte do critério de release atual.
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

## Suíte modular — continuidade da matriz mestra

`scripts/test-regression.mjs` orquestra módulos em `scripts/regression/`:

| Módulo | Responsabilidade |
| --- | --- |
| routes | 21 rotas sem JavaScript e com hidratação; erros de runtime |
| menu | WhatsApp, origem do lead, título e overflow do Menu Digital |
| home | Carregamento de chunks, avaliações, cookies e menu móvel |
| carousels | QA-001, marcas, setas, teclado, pausa e movimento reduzido |
| forms | Contato e fallback da agenda; campos, janela mensal e consentimentos |
| agenda-integrated | AGF-008 / QA-R01: protocolo real do iframe com serviço simulado e mensagem registrada |
| accessibility | 20 cenários axe e geometria por template |
| visual | Imagens, capturas e home em 390, 1440 e 1920 px |

O relatório `regression-summary.json` registra duração e falhas por grupo.
A migração conserva os sete corpos de cenários antigos, sem remover assertions.
Enquanto a base do PR ainda contiver o monólito, a CI executa também essa base
sobre o mesmo build e preserva `baseline-summary.json` e `modular-summary.json`.
Após a migração, a execução duplicada é automaticamente dispensada.

A integração de agenda no navegador é simulada: confirma frontend, protocolo,
mensagem e link alternativo. Não comprova a versão do Apps Script implantada nem
cria evento em produção. Os testes do backend executam o Code.gs versionado.

Não confundir os 67 casos modelados com 57 testes automatizados implementados.
A seleção de regressão por arquivos alterados ainda não está ativada: mudanças
de código continuam executando o gate completo até haver mapa de impacto validado.

AGF-001 verifica no navegador cada obrigatório vazio, isoladamente, com os dois
consentimentos marcados. A agenda integrada deve inicializar somente depois da
hidratação e dos limites de data do React. A resposta imediata da bridge é mantida
no teste para detectar a regressão de inicialização (React #418).

O gate rápido executa sintaxe de todos os módulos, contratos, build e manutenção
antes de instalar o navegador. Mudanças de código ainda passam pela regressão completa.
