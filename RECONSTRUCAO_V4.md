# Cidadão Agora — reconstrução v4

Nova home e identidade visual, mantendo o domínio e as rotas de serviços. O catálogo reúne 24 ferramentas existentes e três novas (planejamento financeiro, compras e comparação por unidade).

## Operação
- Site estático com cálculos e documentos no navegador. A consulta de placa conserva a função Cloudflare/APIBrasil existente e depende da configuração e saldo do fornecedor; não tratar como ferramenta inteiramente offline.
- O consentimento é solicitado antes de carregar anúncios e métricas opcionais. Favoritos e listas são locais, sem sincronização de contas.
- Clima utiliza INMET, IBGE e NOAA. A busca e previsão dependem da disponibilidade externa. Treemap dimensionado por população censitária, não por área territorial. Ausência de alerta não significa ausência de risco.
- Notícias usam sínteses Gemini com fonte vinculada, validação estruturada, conferência de números e segunda checagem automática. Não há revisão humana garantida. Sem resultado válido, a matéria é adiada.
- Imagens do portal são ilustrações próprias geradas por IA e assim identificadas. Fotos de fontes sem autorização não são reutilizadas.
- URLs do acervo antigo foram preservadas como encaminhamento à fonte, sem a reprodução integral e sem indexação até nova edição.

## Automação
A rotina `editorial-v4.yml` é horária na branch padrão. O clima mantém `clima-dados-reais.yml`. Chaves ficam nos segredos GitHub/Cloudflare. A integração GitHub faz o deploy após push na main.

## Verificação realizada
27 ferramentas verificadas para inicialização e preservação de campos, além da home. Cenários de cálculo, três ferramentas novas, favoritos, busca, menu e consentimento. Seis geradores de PDF produziram arquivos válidos. Navegação real em desktop e celular, previsão de cidade, comparação de preços, geração local de QR e conversão com download JPG conferidos. Gemini e robô editorial executados de verdade na branch de avaliação.

Limites: não cobre toda combinação de entrada ou dispositivo; disponibilidade de provedores pode mudar. Consulta paga de placa não foi exercitada com dados pessoais reais. Checagem automática de notícias não elimina necessidade de correção editorial. Documentos e simulações não substituem orientação profissional.
