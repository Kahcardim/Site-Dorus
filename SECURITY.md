# Segurança

## Escopo

Este repositório publica um site estático. A agenda no Google Apps Script e as credenciais de sincronização são ativos externos com implantação e permissões próprias. O código versionado não comprova a configuração atual desses serviços.

## Relatar uma vulnerabilidade

Não publique chaves, dados de clientes, endereços ou detalhes exploráveis em issues públicas. Use a opção **Report a vulnerability** na aba Security do GitHub, se estiver habilitada. Se não estiver disponível, abra apenas uma solicitação genérica de canal privado ao mantenedor, sem incluir o conteúdo sensível.

## Cuidados de manutenção

- Nunca colocar secrets em `public/`, código frontend, logs ou fixtures.
- Guardar credenciais nas configurações do serviço responsável e limitar suas permissões.
- Usar dados fictícios nos testes; criação de visitas reais requer autorização específica.
- Manter consentimento e remoção de dados pessoais nos eventos Analytics.
- Em exposição de credenciais, revogar/rotacionar no provedor antes de corrigir o código. Excluir um arquivo não revoga uma chave nem remove o histórico.

Não há SLA formal de resposta ou auditoria de segurança completa declarada neste projeto. Correções seguem PR, gates e o procedimento de [recovery](docs/RECOVERY.md).
