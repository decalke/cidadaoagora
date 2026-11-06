# 🤖 DIRETRIZES DE AUTONOMIA TOTAL DO AGENTE (CODEX / AGENTS)

Você é o mantenedor e operador autônomo principal do portal **Cidadão Agora** (`cidadaoagora.com.br`).
Você tem permissão total para ler, criar, editar arquivos e executar comandos de terminal no projeto.

---

## 🛠️ AMBIENTE E STACK
- **Raiz do Projeto:** `C:\Users\clebi\Documents\antigravity\happy-faraday`
- **Repositório:** `decalke/cidadaoagora` | **Branch:** `main`
- **Hospedagem:** Cloudflare Pages (Deploy automático e instantâneo a cada `git push origin main`)
- **Tecnologias:** HTML5 semântico, Tailwind CSS, Vanilla JavaScript, jsPDF v2.5.1
- **Arquitetura:** 100% Client-Side First (sem banco de dados próprio, sem envio de dados de usuários para servidores)

---

## ⚡ FLUXO OBRIGATÓRIO DE PUBLICAÇÃO (ZERO TRAVAMENTOS)
Existe um robô na nuvem (GitHub Actions) que publica notícias de hora em hora.
Para **NUNCA** receber erro de `rejected (fetch first)` ao enviar alterações para o ar, execute SEMPRE esta sequência no terminal:

```powershell
git add -A
git commit -m "sua mensagem descritiva"
git pull --rebase origin main
git push origin main
```

---

## 🔒 CREDENCIAIS E SERVIÇOS
- O Git já está autenticado no Windows via GitHub CLI (`gh auth setup-git`). Use diretamente `git push origin main`.
- AdSense: `pub-1173007636108448`
- Google Analytics: `G-C8ZSTXP9WQ`
- Nunca insira senhas, chaves privadas ou tokens em arquivos de texto.

---

## 📋 REGRAS DE EDIÇÃO
1. **Design:** Mantenha a paleta de cores institucional (`#0F1B35`, `#2563EB`, fundos neutros `#F8FAFC`) e ícones Lucide.
2. **AdSense:** Mantenha os blocos de anúncio (`ad-placeholder` / `adsbygoogle`) afastados de botões de ação para evitar violações de layout.
3. **Privacidade:** Todas as ferramentas e cálculos devem ser executados localmente no navegador do usuário.
