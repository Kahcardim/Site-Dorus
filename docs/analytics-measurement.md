# D’orus — medição do atendimento

Atualização: 17/10/2026. Propriedade GA4 448906449, fluxo 8437166600,
ID G-480Q4RXYNC. Os nomes técnicos existentes permanecem para continuidade histórica.

## O que cada evento significa

| Evento | Significado | Não comprova |
| --- | --- | --- |
| page_view | Página visualizada após consentimento | Cliente ou solicitação |
| cta_click | Clique em botão rastreado | Mensagem enviada |
| begin_schedule | Acesso ao agendamento | Solicitação registrada |
| generate_lead + lead_stage Contato iniciado | Clique em WhatsApp/telefone ou preparação válida pelo formulário de contato | Conversa iniciada ou venda |
| generate_lead + lead_stage Solicitação registrada | Backend aceitou a solicitação de agendamento | Visita confirmada, atendimento ou venda |

Não somar eventos como se fossem pessoas ou atendimentos únicos. Um visitante pode
clicar várias vezes e percorrer mais de uma etapa. Não atribuir vendas sem registro comercial.
A nova classificação vale para eventos após esta revisão; não reclassifica o histórico.

## Dimensões de controle em português

| Nome no GA4 | Parâmetro | Valores / finalidade |
| --- | --- | --- |
| Forma de contato | contact_method | WhatsApp, Telefone, Formulário de contato, Agenda do site |
| Etapa do atendimento | lead_stage | Contato iniciado ou Solicitação registrada |
| Local do botão | cta_location_label | Cabeçalho, Destaque principal, Rodapé, WhatsApp flutuante, Formulário etc. |
| Tipo de página | page_type_label | Início, Serviço, Fale conosco, Agendamento, Orientação etc. |
| Equipamento | equipment | Equipamento relacionado ao evento, quando disponível |
| Período solicitado | schedule_period | Período informado na solicitação aceita |

## Consentimento e privacidade

A tag só é carregada com consentimento total; previews locais não enviam eventos.
Os eventos personalizados não incluem nome, telefone do cliente, endereço ou relato.
Os links personalizados são reduzidos a origem e caminho, sem query string ou fragmento.
O fluxo GA4 deve manter ocultação de e-mails e do parâmetro de URL `text`, pois a
medição otimizada de cliques pode capturar a mensagem montada para WhatsApp.

## Conferência

Testes unitários verificam consentimento, ausência de duplicação da tag, classificação,
isolamento de payload e retirada de query strings. A regressão verifica que um contato
válido registra apenas um evento sem os dados preenchidos e que o inválido não registra.
Testes de rede devem interceptar collect para não inserir leads fictícios na produção.
Recebimento, eventos principais e dimensões devem ser conferidos na propriedade real.
