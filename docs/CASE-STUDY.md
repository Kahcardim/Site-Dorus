# Case study técnico — Site D’orus

## Resumo

A D’orus precisava de um site institucional que convertesse busca local em contato real sem transformar um negócio de assistência técnica em uma operação de software complexa. O resultado é um produto em produção com React, geração estática, SEO local, integração de agenda, WhatsApp, avaliações reais e uma pipeline de QA baseada em risco.

Este documento resume o projeto sob a ótica de engenharia, qualidade e tomada de decisão.

## Contexto

O funil principal do negócio é simples:

**Google → conteúdo útil → confiança → WhatsApp/agendamento → atendimento técnico**

A simplicidade do funil não reduz o risco. Os pontos mais sensíveis são:

- disponibilidade da agenda;
- dados enviados pelo cliente;
- regras de visita e capacidade;
- confiança visual e avaliações;
- SEO local;
- funcionamento em celular;
- regressões em um site já publicado.

## Problema técnico

Uma SPA puramente client-side seria fácil de desenvolver, mas criaria dependência desnecessária de JavaScript para conteúdo e navegação. SSR resolveria parte disso, porém adicionaria servidor, runtime, observabilidade e custo operacional sem existir necessidade de personalização por requisição.

A arquitetura precisava equilibrar:

- indexabilidade;
- simplicidade operacional;
- manutenção por componentes;
- performance;
- baixo custo;
- rollback;
- integração com serviços externos.

## Decisão de arquitetura

A solução adotada usa **React 19 + Vite com geração estática de HTML por rota**.

O React organiza componentes, estado e comportamento interativo. Durante o build, as rotas públicas recebem HTML completo. A hidratação acontece depois da primeira entrega e o código é dividido por grupos de páginas.

### Consequências positivas

- conteúdo continua disponível sem JavaScript;
- GitHub Pages atende o produto sem servidor de aplicação;
- SEO não depende da hidratação;
- rollback é baseado em artefato estático e revisão Git;
- o frontend continua componentizado e testável.

### Trade-offs aceitos

- alterações de conteúdo exigem novo build;
- integrações dinâmicas precisam ser separadas do HTML estático;
- a pipeline deve testar todas as rotas geradas.

## Estratégia de qualidade

O projeto adota uma matriz baseada em risco, em vez de tratar todos os testes como equivalentes.

### P0 / High

Bloqueiam merge e produção:

- agenda;
- dados do cliente;
- consentimentos;
- WhatsApp;
- regras comerciais;
- capacidade;
- duplicidade.

### P1 / High

Também bloqueiam release:

- rotas;
- conteúdo sem JavaScript;
- carrosséis;
- identidade visual;
- acessibilidade A/AA;
- Menu Digital e jornadas principais.

### Evidência

A suíte consolidada possui **67 casos modelados**, com verificações distribuídas entre unidade, contratos, backend da agenda, build estático, SEO, Playwright, axe-core, geometria, integração e produção.

A pipeline cobre:

- 21 rotas indexáveis e 404;
- 415 blocos históricos de conteúdo;
- 20 cenários axe mobile/desktop;
- agenda real em modo de leitura;
- regressão visual e responsiva;
- Lighthouse antes e depois da publicação.

## Defeitos que mudaram o processo

O repositório registra correções que viraram contratos permanentes, em vez de correções pontuais sem prevenção de regressão.

### Vazamento potencial de mensagem para Analytics

Um CTA de WhatsApp poderia carregar dados do cliente na query string. O evento de Analytics passou a registrar somente origem e caminho, removendo query e fragmento antes do envio.

A correção ganhou teste dedicado para impedir reincidência.

### Hidratação e agenda

A agenda precisava inicializar somente depois de o React estabelecer limites de data e campos dependentes da hidratação. A regressão passou a simular resposta imediata da integração para detectar corrida de inicialização.

### Regressões visuais

Problemas em Home, carrosséis, grid de serviços, CTAs e texto ampliado foram transformados em verificações automatizadas de geometria, responsividade, conteúdo e captura visual.

O princípio aplicado foi: **regra aprovada vira baseline; reincidência é bug, não nova interpretação.**

## CI/CD

A pipeline de produção foi estruturada para evitar a falha clássica de testar um build e publicar outro.

Fluxo:

1. sintaxe, unidade, contratos e manutenção;
2. build estático;
3. SEO e integridade de conteúdo;
4. Playwright e axe-core;
5. agenda real somente leitura;
6. auditoria de performance;
7. upload do build aprovado;
8. fingerprint para detectar build equivalente;
9. publicação do mesmo artefato;
10. Lighthouse pós-deploy;
11. validação da revisão publicada e integrações.

Mudanças apenas de documentação não publicam novamente o site.

## Resultados

Auditoria de produção de referência em 07/09/2026:

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 94 | 100 | 100 | 100 | 1,4 s | 0 | 290 ms |
| Desktop | 100 | 100 | 100 | 100 | 0,5 s | 0 | 0 ms |

Execução verificável: https://github.com/Kahcardim/Site-Dorus/actions/runs/34132946867

Na mesma execução, o pós-deploy confirmou 21 páginas, 415 blocos históricos, metadados, Schema, sitemap, breadcrumbs, destinos internos e agenda real dentro da janela mensal exigida pelo negócio.

## Operação e recovery

O projeto mantém documentação de rollback e um snapshot de recuperação usado pela pipeline. O build aprovado é preservado como artefato e o processo evita force-push na `main`.

Deployments antigos e branches obsoletos foram limpos para reduzir ruído operacional, preservando apenas a `main`, o snapshot de recovery e um experimento de performance ainda não integrado.

## O que eu defenderia em uma entrevista

### Por que não usar Next.js ou outro framework full-stack?

Porque o problema não exigia servidor. A decisão foi reduzir infraestrutura sem abrir mão de React, SEO ou HTML pré-renderizado.

### Por que testar conteúdo histórico?

Porque o produto já estava em produção. Refatorar sem contrato de conteúdo poderia melhorar arquitetura e, ao mesmo tempo, apagar informação comercial, SEO ou confiança construída anteriormente.

### Por que validar a agenda real se existe teste local?

Porque o código versionado não prova que a implantação externa está atualizada. A leitura real reduz o gap entre repositório e serviço efetivamente disponível.

### Por que Lighthouse não é tratado como verdade absoluta?

Porque é laboratório. Ele ajuda a detectar regressões de performance, acessibilidade e boas práticas, mas Core Web Vitals reais dependem de dados de campo.

### Qual foi o principal ganho de maturidade do projeto?

Transformar correções recorrentes em contratos automatizados e fazer P0/P1 realmente bloquearem release.

## Próximas evoluções possíveis

Itens que fariam sentido em uma etapa posterior, sem necessidade de inflar a arquitetura agora:

- dados de campo reais para Core Web Vitals;
- seleção de regressão por impacto de arquivos alterados;
- branch protection/ruleset obrigatório quando a configuração administrativa estiver disponível;
- observabilidade mais estruturada da integração de agenda;
- comparação visual por baseline de imagem para mudanças de interface de alto impacto.

## Links

- Produção: https://assistenciadorus.com.br/
- Repositório: https://github.com/Kahcardim/Site-Dorus
- Arquitetura: [ARQUITETURA.md](ARQUITETURA.md)
- Testes: [TESTES.md](TESTES.md)
- Recovery: [RECOVERY.md](RECOVERY.md)
