# Segurança do projeto D’orus

Este repositório não deve armazenar credenciais, chaves de API, tokens, arquivos `.env`, certificados, contas de serviço ou outros segredos.

## Regras

- Segredos de integrações devem permanecer em provedores de secrets ou propriedades protegidas do serviço correspondente.
- Arquivos locais de configuração sensível devem permanecer fora do Git e estão cobertos pelo `.gitignore`.
- Antes de qualquer publicação, mudanças devem passar pelos gates de qualidade e regressão existentes.
- Informações estratégicas internas, dados de clientes, relatórios privados de Analytics/Search Console e documentação operacional não devem ser publicados em repositórios de portfólio.
- O código atual é proprietário conforme o arquivo `LICENSE`. Versões anteriores obtidas sob licenças anteriores continuam sujeitas aos termos que vigoravam quando foram obtidas.

## Incidentes

Se uma credencial for adicionada ao histórico Git por engano, apenas apagar o arquivo em um commit posterior não é suficiente. A credencial deve ser revogada/rotacionada imediatamente e o histórico deve ser tratado separadamente.

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
