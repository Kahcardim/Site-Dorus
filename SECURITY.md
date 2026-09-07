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
