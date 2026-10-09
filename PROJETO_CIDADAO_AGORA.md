# 🇧🇷 Cidadão Agora - Portal Oficial de Serviços, Documentos e Notícias 24h

> **Domínio Oficial:** [cidadaoagora.com.br](https://cidadaoagora.com.br)  
> **Repositório GitHub:** [github.com/decalke/cidadaoagora](https://github.com/decalke/cidadaoagora)  
> **Hospedagem & CDN:** Cloudflare Pages (`infocidadao.pages.dev` / `cidadaoagora.com.br`)  
> **Automação 24h na Nuvem:** GitHub Actions (`.github/workflows/atualizar_noticias.yml`)

---

## 📌 Visão Geral do Projeto
O **Cidadão Agora** é um portal de alta performance e utilidade pública desenvolvido para o público brasileiro. O projeto conta com:
- **15 Ferramentas e Geradores em PDF:** Processamento 100% no cliente (sem envio de dados para servidores), garantindo privacidade e custo zero de infraestrutura.
- **Rastreador de Notícias 24 Horas:** Robô Python executado automaticamente a cada hora via GitHub Actions que busca dados da Agência Brasil / EBC e comunicados de Política e Leis, gerando páginas HTML otimizadas para SEO.
- **Conformidade para Google AdSense:** Páginas institucionais de Política de Privacidade (LGPD), Termos de Uso e Fale Conosco prontas para aprovação de monetização em dólar.

---

## 📂 Estrutura de Pastas e Arquivos

```text
happy-faraday/  (Workspace Oficial Antigravity)
├── .github/
│   └── workflows/
│       └── atualizar_noticias.yml      # Cron job 24h que executa o rastreador na nuvem
├── conteudo/
│   ├── agente_politica.py             # Rastreador de política, leis e tributos
│   ├── politica.html                  # Capa da editoria de Política
│   ├── politica.json / politica_dados.js # Base de dados das matérias políticas
│   ├── noticias.html                  # Capa de notícias gerais
│   ├── promocoes.html                 # Página de ofertas e programas de afiliados
│   ├── politica-privacidade.html      # Termos de conformidade LGPD e Google AdSense
│   ├── termos-de-uso.html             # Termos de uso das ferramentas gratuitas
│   └── contato.html                   # Página de atendimento e suporte
├── noticias/
│   ├── agente_noticias.py             # Rastreador EBC / Agência Brasil
│   ├── index.html                     # Plantão de notícias em tempo real
│   ├── noticias.json / noticias_dados.js # Base de dados das notícias
│   └── *.html                         # Dezenas de páginas individuais de notícias geradas
├── politica/
│   └── *.html                         # Artigos individuais sobre política e leis
├── servicos/
│   ├── consulta-mei-cnpj.html         # Consulta da situação cadastral MEI/CNPJ
│   ├── validador-cpf.html             # Validador oficial de CPF e região fiscal
│   ├── buscador-cnae.html             # Buscador de CNAE e anexos do Simples Nacional
│   ├── calculadora-rescisao-clt.html  # Simulador de rescisão trabalhista e salário líquido
│   ├── consulta-veicular-fipe.html    # Consulta de placas e cotação Tabela FIPE
│   ├── gerador-recibo-pagamento.html  # Recibo de prestação de serviços / autônomo (PDF)
│   ├── gerador-nota-promissoria.html  # Nota promissória comercial (Decreto 2.044) (PDF)
│   ├── gerador-declaracao-residencia.html # Declaração de residência (Lei 7.115/83) (PDF)
│   ├── gerador-contrato-simples.html  # Contrato de prestação de serviços simples (PDF)
│   ├── formatador-texto.html          # Formatador de texto e validador de CPF rápido
│   ├── conversor-formatos.html        # Conversor de PNG para JPG no navegador
│   ├── gerador-link-whatsapp.html     # Gerador de link curto e QR Code de WhatsApp
│   ├── gerador-declaracao-hipossuficiencia.html # Declaração de hipossuficiência / pobreza (PDF)
│   ├── gerador-orcamento-simples.html # Orçamento de serviços para MEI e autônomos (PDF)
│   ├── calculadora-ferias-decimo.html # Calculadora de férias com 1/3 e 13º salário
│   └── *.html                         # Páginas satélite de SEO para tráfego orgânico
├── index.html                         # Página inicial com 15 cards e espaços AdSense
├── publicar_alteracoes_online.bat     # Script de 1 clique para sincronizar com a nuvem
└── PROJETO_CIDADAO_AGORA.md           # Este dossiê completo de instruções
```

---

## 🛠️ Tecnologias Utilizadas
- **Frontend:** HTML5 semântico, Tailwind CSS (via CDN), Lucide Icons, Vanilla JavaScript.
- **PDF Generation:** `jsPDF` v2.5.1 (client-side).
- **Backend / Scraper:** Python 3.11 (`requests`, `urllib`, `xml.etree.ElementTree`).
- **Deploy & Hospedagem:** GitHub + Cloudflare Pages com SSL automático e CDN mundial.

---

## 🚀 Como Continuar no Futuro
1. Qualquer edição feita neste workspace pode ser enviada diretamente para a nuvem usando o script `publicar_alteracoes_online.bat` ou via terminal com:
   ```bash
   git add -A
   git commit -m "feat: sua alteracao"
   git push origin main
   ```
2. O robô continua trabalhando 24h na nuvem pelo GitHub Actions, sem depender do computador ligado.
