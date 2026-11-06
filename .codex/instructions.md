# Instruções do Codex - Cidadão Agora

Este repositório é o portal Cidadão Agora. Você tem controle total sobre o código, estrutura e publicação.

- Raiz: `C:\Users\clebi\Documents\antigravity\happy-faraday`
- Publicação: Cloudflare Pages via branch `main`.
- Para publicar qualquer alteração sem travar com o robô de notícias da nuvem, use sempre:
  `git add -A && git commit -m "feat/fix: ..." && git pull --rebase origin main && git push origin main`
- Preserve o estilo visual Tailwind CSS e a arquitetura 100% client-side (sem backend próprio).
