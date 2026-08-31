# Medição de conversões no GA4

## Objetivo

O site usa a propriedade `G-480Q4RXYNC` e passa a concentrar a medição em uma única camada, respeitando o consentimento de analytics. Nenhum nome, telefone, endereço ou descrição livre do defeito é enviado ao Google Analytics.

As prévias em `localhost` e `127.0.0.1` não carregam a tag do Google. Isso evita que os testes de QA contaminem os relatórios e as conversões reais.

## Eventos implementados

| Evento | Quando ocorre | Uso no relatório |
| --- | --- | --- |
| `generate_lead` | Clique em WhatsApp ou telefone; envio válido pelo formulário; registro concluído na agenda | Conversão principal |
| `cta_click` | Clique em CTA de WhatsApp, telefone, Instagram ou Agendamento | Comparar textos e posições dos botões |
| `begin_schedule` | Clique que leva para a página de Agendamento | Início do funil de agendamento |
| `social_click` | Clique no Instagram | Engajamento social, não conversão |
| `select_related_service` | Clique em outro equipamento nas páginas de serviço | Navegação interna entre serviços |

## Parâmetros úteis

- `method`: `whatsapp`, `phone`, `schedule_whatsapp` ou `schedule_google`.
- `lead_source`: origem padronizada do lead.
- `cta_location`: cabeçalho, hero, conteúdo, fechamento da página, rodapé ou botão flutuante.
- `page_type`: home, institucional, listagem/detalhe de serviço, listagem/detalhe de guia, agendamento ou contato.
- `equipment`: equipamento associado à página ou ao formulário.
- `cta_type`, `link_text` e `link_url`: diagnóstico dos botões.
- `schedule_period` e `schedule_status`: análise do agendamento, sem dados pessoais.

## Configuração externa necessária no GA4

1. Em **Administrador > Exibição de dados > Eventos principais**, marque `generate_lead` como evento principal.
2. Para evitar contagem inflada por repetição, use a opção de contagem **uma vez por sessão** se ela estiver disponível na propriedade.
3. Em **Administrador > Definições personalizadas**, crie dimensões de escopo de evento para `method`, `lead_source`, `cta_location`, `page_type`, `equipment` e `cta_type`.
4. Em **Explorações**, crie um funil com `begin_schedule` seguido de `generate_lead`, segmentado por `method` e `page_type`.
5. Depois do deploy autorizado, valide os eventos nos relatórios **Tempo real** e **DebugView** após aceitar os cookies de analytics.

## Referências oficiais

- Evento recomendado `generate_lead`: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- Parâmetros e dimensões personalizadas: https://developers.google.com/analytics/devguides/collection/ga4/event-parameters
- Eventos principais no GA4: https://support.google.com/analytics/answer/9267568
