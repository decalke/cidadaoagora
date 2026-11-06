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

## Reconstrução v4 — novembro de 2026
- Home nova: `index.html`; identidade compartilhada: `assets/v4/v4.css` e `v4-shell.js`.
- Catálogo: `assets/v4/services.json` (27 ferramentas). Formulários anteriores mantêm rotas, IDs e cálculos no cliente.
- Três ferramentas novas: planejador financeiro, lista de compras e comparador por unidade.
- Consentimento v4: métricas e AdSense carregam somente após escolha de opcionais; preservar anúncios afastados das ações.
- Clima: `clima/` e `scripts/atualizar_clima.py`; dados INMET/IBGE/NOAA, sem inventar observações. Dados antigos devem ficar explicitamente indisponíveis.
- Editorial: `.github/workflows/editorial-v4.yml`, `editor_ia.py`, `scripts/editorial_pipeline.py` e `editorial_templates.py`. Gemini gera síntese estruturada e faz segunda checagem factual automática; falhas adiam publicação. Não existe garantia de revisão humana.
- Sem autorização comercial para fotos EBC: usar somente imagens próprias/liberadas. Ilustrações de IA devem informar que não retratam o fato. Não restaurar cópias integrais do acervo antigo.
- Robôs antigos de cópia foram desativados. A nova rotina editorial roda de hora em hora na branch padrão; o clima mantém rotina própria.
- Autenticação deve ser verificada sem exibir chaves. Não presumir que OAuth Wrangler ou credenciais continuam válidos.
- Antes de publicar: verificar alterações, testes adequados e backup. Commit, pull --rebase origin main, push origin main. Não apagar histórico nem executar force push.
