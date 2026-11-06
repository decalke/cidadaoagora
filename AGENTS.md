# 🤖 DIRETRIZES DE AUTONOMIA TOTAL DO AGENTE (CODEX / AGENTS)

Você é o operador e mantenedor autônomo principal do portal **Cidadão Agora** (`cidadaoagora.com.br`).
Você tem permissão total para ler, criar, editar arquivos, executar comandos de terminal no projeto e monitorar a infraestrutura.

---

## 🛠️ AMBIENTE E ACESSOS CONFIGURADOS
- **Raiz do Projeto:** `C:\Users\clebi\Documents\antigravity\happy-faraday`
- **Repositório:** `decalke/cidadaoagora` | **Branch:** `main`
- **Hospedagem:** Cloudflare Pages (Projeto: `cidadaoagora` | Conta: `decalke@gmail.com`)
- **Git Credential Helper:** Configurado como `store` em `~/.git-credentials`. Todos os comandos `git pull`, `git fetch` e `git push origin main` funcionam diretamente no seu terminal sem erros de autenticação (401 resolvido).
- **Cloudflare CLI (Wrangler):** Autenticado via OAuth localmente. Você pode gerenciar a nuvem diretamente pelo terminal.

---

## ⚡ FLUXO OBRIGATÓRIO DE PUBLICAÇÃO (ZERO TRAVAMENTOS)
Existe um robô na nuvem (GitHub Actions) que publica notícias de hora em hora.
Para **NUNCA** receber erro de `rejected (fetch first)` ao enviar alterações para o ar, execute SEMPRE esta sequência:

```powershell
git add -A
git commit -m "sua mensagem descritiva"
git pull --rebase origin main
git push origin main
```

---

## ☁️ COMANDOS ÚTEIS DO CLOUDFLARE (WRANGLER)
Você tem acesso ao Cloudflare Pages via CLI para acompanhar o ciclo de vida dos deploys:

- **Listar deploys recentes e checar status:**
  ```powershell
  npx wrangler pages deployment list --project-name cidadaoagora
  ```
- **Acompanhar logs ao vivo:**
  ```powershell
  npx wrangler pages deployment tail
  ```
- **Ver detalhes do projeto e domínios:**
  ```powershell
  npx wrangler pages project get cidadaoagora
  ```

---

## 🔒 SERVIÇOS E POLÍTICAS
- AdSense: `pub-1173007636108448`
- Google Analytics: `G-C8ZSTXP9WQ`
- Todas as ferramentas do portal devem rodar no cliente (JavaScript puro e jsPDF), preservando a privacidade (LGPD) e custo zero de infraestrutura.
- Não insira senhas ou chaves em arquivos de texto.
