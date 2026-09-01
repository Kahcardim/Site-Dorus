# Teste manual — migração React

Use este roteiro antes de aprovar o merge do PR de migração. Registre somente diferenças visuais, funções quebradas ou textos incorretos.

## Abrir a homologação local

```bash
git fetch origin
git switch refactor/react-migration
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Desktop

- [ ] Home abre sem cortes horizontais ou espaços vazios anormais.
- [ ] Logo, banner, cards de serviços, marcas e avaliações aparecem corretamente.
- [ ] Menu abre todas as páginas e destaca a página atual.
- [ ] WhatsApp flutuante permanece visível sem cobrir conteúdo.
- [ ] Página Serviços abre as oito categorias.
- [ ] Guias abrem e levam ao serviço relacionado.
- [ ] Formulário Fale Conosco prepara a mensagem correta no WhatsApp.
- [ ] Agendamento consulta os períodos e mantém o fallback para WhatsApp.
- [ ] Banner de cookies fecha e pode ser reaberto pelo rodapé.

## Mobile

- [ ] Repetir Home, Serviços, Agendamento e Fale Conosco em largura próxima de 390 px.
- [ ] Menu móvel abre, fecha e permite navegar.
- [ ] Textos, imagens, avaliações e botões não são cortados.
- [ ] Campos podem ser preenchidos sem zoom ou sobreposição.
- [ ] Navegação não produz rolagem horizontal.

## Acessibilidade

- [ ] Pressionar `Tab` mostra “Pular para o conteúdo” primeiro.
- [ ] É possível navegar por links, menu, formulários e botões apenas pelo teclado.
- [ ] Foco do teclado permanece visível.
- [ ] Zoom em 200% mantém texto e controles utilizáveis.
- [ ] Preferência “reduzir movimento” do dispositivo é respeitada.

## Como registrar um defeito

Inclua página, dispositivo/largura, passos, resultado atual, resultado esperado e uma captura. Não altere a `main` nem faça merge enquanto houver defeito crítico ou alto.
