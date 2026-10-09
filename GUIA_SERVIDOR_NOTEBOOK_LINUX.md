# GUIA DEFINITIVO: TRANSFORMAR SEU NOTEBOOK VELHO EM SERVIDOR CASEIRO 24H
Projeto: InfoCidadão (Servidor Web + Robô Notícias + Cloudflare Tunnel)

---

## 1. SISTEMA OPERACIONAL RECOMENDADO
Para notebooks antigos (pouca RAM e processador mais fraco), a melhor escolha absoluta é:
👉 **Ubuntu Server 24.04 LTS (ou 22.04 LTS)** ou **Debian 12 Bookworm Netinst (Sem interface gráfica)**.

- **Por que sem interface gráfica?** Sem área de trabalho, o sistema consome apenas ~150 MB de memória RAM, deixando 100% da máquina livre e sem esquentar.
- Baixe a ISO oficial (Ubuntu Server) e use o programa **Rufus** ou **BalenaEtcher** no seu PC principal para criar o pendrive bootável.

---

## 2. PREPARAR O NOTEBOOK PARA RODAR COM A TAMPA FECHADA (IMPORTANTE!)
Por padrão, notebooks entram em modo de suspensão quando você fecha a tela. No Linux, resolva isso com:

```bash
sudo nano /etc/systemd/logind.conf
```
Procure e altere (ou adicione) as linhas:
```text
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
```
Salve (Ctrl+O, Enter, Ctrl+X) e aplique:
```bash
sudo systemctl restart systemd-logind
```
Pronto! Você pode fechar a tampa do notebook e deixá-lo no cantinho ligado na tomada consumindo o mínimo de energia.

---

## 3. INSTALAR O DOCKER NO NOTEBOOK
No terminal do seu notebook, execute estes 3 comandos:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```
*(Faça logout e login novamente para aplicar a permissão).*

---

## 4. COPIAR OS ARQUIVOS DO SEU PROJETO PARA O NOTEBOOK
Você pode colocar a pasta `InfoCidadao` em um pendrive ou copiar pela rede via SCP:
```bash
# Exemplo se copiar via pendrive para a pasta home:
cd ~/InfoCidadao
```

---

## 5. INICIAR O SITE + ROBÔ DE NOTÍCIAS (1 COMANDO)
Dentro da pasta `InfoCidadao` no notebook, basta rodar:

```bash
docker compose up -d --build
```
O que acontece automaticamente:
- O Nginx é configurado e sobe na porta 8080 servindo todo o site.
- O robô Python em segundo plano é ativado e fica minerando notícias da EBC e Política a cada 30 minutos.
- Se a luz cair e o notebook reiniciar, o Docker liga tudo sozinho automaticamente (`restart: unless-stopped`).

---

## 6. COLOCAR O SITE ONLINE COM CLOUDFLARE TUNNEL (GRÁTIS & SEGURO)

### Passo A: Instalar o 'cloudflared' no notebook
```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared
```

### Passo B: Teste Rápido Imediato (Sem domínio, link temporário)
```bash
cloudflared tunnel --url http://localhost:8080
```
Ele vai gerar na tela um link gratuito como:
👉 `https://seu-nome-aleatorio.trycloudflare.com`
Você já pode abrir no celular de qualquer lugar do mundo!

### Passo C: Conectar ao seu Domínio Próprio Definitivo (Mais tarde)
1. Crie uma conta gratuita em dash.cloudflare.com
2. Vá em **Zero Trust** -> **Networks** -> **Tunnels** -> **Create a Tunnel**
3. O painel te dá um comando de 1 linha para colar no notebook.
4. Você aponta seu domínio (ex: `infocidadao.com.br`) para `http://localhost:8080`.
5. O Cloudflare Tunnel se instala como serviço e nunca mais desliga!
