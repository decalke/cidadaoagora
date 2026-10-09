# 🚀 Guia de Lançamento e Monetização - InfoCidadão

Parabéns! O seu portal de utilidades públicas **InfoCidadão** foi construído e já está funcional no seu computador.

---

## 📁 Arquivos Criados:
- **`index.html`**: Interface moderna com Tailwind CSS, ícones Lucide, abas de navegação e espaços estratégicos reservados para os blocos do Google AdSense.
- **`app.js`**:
  1. **Consulta CNPJ / MEI:** Integração direta com a **BrasilAPI** (base oficial da Receita Federal em tempo real).
  2. **Buscador de CNAE & Simples Nacional:** Tabela interativa com busca em tempo real e indicativo de permissão no MEI.
  3. **Calculadora CLT:** Estimativas de rescisão de contrato e salário líquido com tabelas de INSS e IRRF.
  4. **Consulta Veicular:** Validador de placa (Mercosul e antiga) + links oficiais para Senatran e Tabela FIPE.

---

## 💰 Como Monetizar com o Google AdSense (Passo a Passo):

### 1. Registrar o Domínio
- Acesse [Registro.br](https://registro.br).
- Registre o domínio escolhido (ex: `infocidadao.com.br`) por R$ 40,00/ano.

### 2. Hospedar Gratuitamente (Custo R$ 0)
Como este site é puramente estático e ultrarrápido (HTML + JS), você não precisa pagar servidores caros. Você pode hospedá-lo de graça na:
- **Vercel** (`vercel.com`) ou **Cloudflare Pages** (`pages.cloudflare.com`).
- Basta conectar sua conta e apontar o domínio do Registro.br.

### 3. Solicitar Aprovação no Google AdSense
- Crie uma conta no [Google AdSense](https://adsense.google.com).
- Adicione o seu domínio para verificação.
- Quando aprovado, substitua as áreas demarcadas com a classe `ad-placeholder` no arquivo `index.html` pelo código `<ins class="adsbygoogle">` fornecido pelo Google.

---

## 📈 Dicas para Gerar Tráfego Orgânico no Google (SEO):
1. **Páginas Específicas por CNAE:** Você pode criar variações como "CNAE para Programador", "CNAE para Cabeleireiro". O Google indexa muito rápido esse tipo de busca.
2. **Compartilhamento em Grupos de WhatsApp / Telegram de MEIs e Contadores:** Pequenos empreendedores adoram ferramentas rápidas para checar CNPJs de clientes e fornecedores.
