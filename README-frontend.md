# ROTAM Frontend v2.2.0

Sistema web do Batalhão ROTAM — Integrado ao backend Node.js + PostgreSQL (Railway).

## 🔑 Funcionalidades
- Login com autenticação JWT
- Cadastro e consulta de ocorrências
- Cadastro de efetivo e mapa da força (integrado ao backend)
- Livro RT90 com geração de PDF e histórico automático
- PWA (instala como aplicativo e funciona offline)
- Cache inteligente via Service Worker (`sw.js`)

---

## ⚙️ Configuração
Edite o arquivo `js/config.js` e altere a URL da API para o seu backend hospedado no Railway:

```js
const API_URL = "https://seu-backend.onrender.com/api";
