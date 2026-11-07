# Cidadão Agora — comece por aqui

Esta é a pasta permanente de trabalho do portal Cidadão Agora.

## Como continuar depois
Abra este projeto no Codex e peça: "Continue o Cidadão Agora. Leia LEIA-ME-PRIMEIRO.md e AGENTS.md antes de alterar o site."

Não é necessário começar do zero. O código, as imagens, os formulários, os robôs e o histórico estão aqui.

## Situação salva em 6 de novembro de 2026
- Portal: https://cidadaoagora.com.br/
- GitHub: https://github.com/decalke/cidadaoagora
- Branch de produção: main. Última publicação de código: 27388df.
- Hospedagem: Cloudflare Pages, projeto cidadaoagora; endereço de apoio infocidadao.pages.dev.
- A pasta original em Documents/antigravity/happy-faraday foi preservada. Para os próximos trabalhos deste projeto, use ESTA pasta, evitando editar duas cópias ao mesmo tempo.

## O que está pronto
- Nova página inicial, identidade colorida e navegação para computador/celular.
- Catálogo de 27 ferramentas: 24 anteriores preservadas e três novas — planejador financeiro, lista de compras e comparador de preços por unidade.
- Busca, filtros de categorias e favoritos locais.
- Documentos e cálculos no navegador; salários atualizados para tabelas de 2026, com limites da simulação informados.
- Conversor de imagens com download explícito e QR WhatsApp gerado localmente.
- Clima com busca de cidade, previsão INMET, treemap por população IBGE, avisos oficiais e painel NOAA. Não inventar dados nem apresentar ausência de alerta como ausência de risco.
- Notícias e política com sínteses Gemini e checagem factual automática. Não há garantia de revisão humana.
- Seis novas ilustrações editoriais e seleção por assunto, além das imagens da home e do clima. Imagens de IA identificadas como ilustração, sem simular prova do fato.
- Usuário NÃO tem autorização comercial para fotos EBC. Não restaurar essas fotos ou cópias integrais. Usar imagens próprias ou licença compatível verificada.
- Métricas e anúncios opcionais após consentimento. Dados de listas e favoritos ficam localmente.

## Onde alterar
- Home: index.html e assets/v4/v4-home.js.
- Identidade e navegação: assets/v4/v4.css e v4-shell.js.
- Ferramentas: servicos/, app.js, assets/v4/v4-tools.js e services.json.
- Clima: clima/ e scripts/atualizar_clima.py.
- Editorial: editor_ia.py, scripts/editorial_pipeline.py, editorial_templates.py e editorial_images.py.
- Rotinas automáticas: .github/workflows/editorial-v4.yml e clima-dados-reais.yml.
- Imagens: assets/v4/ e assets/v4/editorial/. Licenças: assets/v4/LICENCAS.txt.

## Publicação e cuidados
Ler AGENTS.md. Registrar alterações em commit, atualizar com git pull --rebase origin main e só então git push origin main. O push publica automaticamente. Os robôs também atualizam main: sempre sincronizar antes de editar/publicar. Não usar force push.
Credenciais continuam nas configurações e segredos existentes, não neste documento. A autenticação deve ser verificada ao retomar. Nenhuma chave ou arquivo pessoal de credenciais foi copiado para esta pasta.
A consulta de placas depende da função Cloudflare/APIBrasil e de configuração/saldo; é uma exceção existente às ferramentas locais.

## Histórico, relatórios e testes
- Histórico Git disponível em .git e no GitHub.
- Backup completo anterior a esta organização: .continuidade-local/cidadao-agora-projeto-completo.bundle.
- Inventário, relatórios, capturas e prompts: .continuidade-local/relatorios/.
- Scripts de verificação arquivados: .continuidade-local/scripts-de-verificacao/. Alguns usam os caminhos e dependências do ambiente anterior; adaptar antes de rodar.
- RECONSTRUCAO_V4.md descreve a arquitetura e limites dos testes.
- Foram verificados os 27 formulários/ferramentas para inicialização, fluxos selecionados, seis PDFs, clima real, conversão/download, QR local, Gemini real e imagens das 12 matérias publicadas.
- Não se afirma cobertura de todas as entradas, dispositivos ou disponibilidade de provedores. Consulta paga de placa não foi testada com dados pessoais reais.

## Vínculo no aplicativo
Adicionar esta pasta à seção Projetos do Codex com o nome Cidadão Agora. Mover a conversa existente para ele pela barra lateral preserva o contexto completo do chat. O guia acima permite iniciar uma nova conversa mesmo sem esse vínculo.
