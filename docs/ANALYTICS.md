# Analytics e mensuração

## Princípios

A mensuração deve ajudar a entender aquisição e conversão sem enviar ao provedor de analytics conteúdo digitado pelo cliente.

- Analytics permanece negado até consentimento.
- Rejeição mantém publicidade e analytics desativados.
- Testes locais não carregam GA4.
- URLs registradas para CTAs não incluem query string nem fragmento com conteúdo da mensagem.

## Eventos relevantes

Priorizar eventos que indiquem avanço real no funil:

- clique em WhatsApp;
- clique em telefone;
- início de solicitação de visita;
- avanço do formulário de agendamento;
- navegação entre guia e página de serviço.

Não registrar nome, telefone, endereço, problema descrito ou texto completo preparado para WhatsApp.

## Agendamento

A disponibilidade da agenda é uma integração operacional e não uma métrica de marketing. O gate atual garante funcionamento para uma janela mínima de 30 dias, mas as consultas de disponibilidade em QA não devem ser enviadas ao Analytics nem confundidas com conversões reais.

## Validação

Os testes automatizados verificam consentimento, isolamento do preview local e remoção de conteúdo sensível das URLs enviadas ao Analytics. A validação manual deve conferir também o comportamento no navegador após aceitar e rejeitar cookies.
