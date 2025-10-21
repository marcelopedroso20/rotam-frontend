
ROTAM Frontend – Correções rápidas (UX)
=======================================

O que este pacote faz:
- Remove botões "Sair" duplicados e mantém apenas UM funcional.
- Adiciona botão "← Voltar" na página `mapa_forca.html` levando para `index.html`.
- Remove elementos duplicados "Carregando usuário..." nas páginas.

Como aplicar (2 minutos):
------------------------
1) Copie o arquivo `js/ux-fixes.js` deste pacote para a pasta `js/` do seu `rotam-frontend` no GitHub.
2) Em CADA uma das páginas abaixo, adicione a linha de script ANTES do fechamento do </body>:
   - `mapa_forca.html`
   - `cadastro.html` (ou a página de Cadastro de Efetivo equivalente)
   - `relatorios.html`

Exemplo de inclusão:
--------------------
...
  <script src="js/ux-fixes.js"></script>
</body>
</html>

Dica:
-----
- Não precisa remover nenhum JS existente. Este arquivo apenas "conserta" a UI e não quebra seu código.
- Se quiser que o botão "Voltar" apareça em outras páginas, basta manter o script: ele só cria o botão automaticamente na `mapa_forca.html`.
