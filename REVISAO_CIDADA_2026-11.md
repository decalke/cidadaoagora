# Revisão do portal — 7 de novembro de 2026

## Entrega

O catálogo passa de 30 para 33 entradas, incluindo os três painéis de clima existentes e três novas ferramentas gratuitas:

- **Consumo de energia:** lista de aparelhos, cálculo de kWh e custo com tarifa informada pelo visitante. Sem tabela de preços presumida. O resultado não inclui todas as parcelas da fatura. Metodologia vinculada ao Ministério de Minas e Energia.
- **Divisão de despesas:** grupo de 2 a 20 pessoas, registro de pagamentos e acertos sugeridos em centavos. Não realiza transferências; o grupo fica fixo enquanto houver despesas.
- **Agenda cidadã:** compromissos e vencimentos com salvamento opcional no navegador e exportação de pendentes em calendário ICS de dia inteiro. Não envia notificações; importar o arquivo e configurar lembretes são ações do visitante.

Nenhuma das novas ferramentas faz consultas remotas com os dados informados. Energia e divisão ficam apenas na memória da página. A agenda só grava após a escolha de salvar, sem sincronização entre aparelhos. Os serviços opcionais de métricas e anúncios existentes continuam sujeitos ao consentimento. Os anúncios do Mercado Livre removidos anteriormente não foram restaurados.

## Problemas corrigidos

- O comparador mantinha preços anteriores quando uma entrada deixava de ser válida: agora limpa o resultado e pede os valores completos.
- Mini orçamento, planejamento e compras não tratavam adequadamente negativos, números não finitos e limites numéricos: validações e avisos foram acrescentados.
- Lista de compras aceitava preço vazio como zero: agora exige preenchimento, mantendo zero explícito permitido.
- Falhas do armazenamento local podiam interromper a limpeza do orçamento ou passar despercebidas em compras e favoritos: agora são tratadas e comunicadas.
- Botões de favoritos perdiam o foco ao reconstruir a lista: o foco agora é restaurado.
- Falha ao carregar o catálogo só sugeria recarregar a página: agora há validação da resposta e botão de tentar novamente.
- Foram corrigidos rótulos de 70 campos estáticos em 14 páginas de serviços, com associações `for`/`id` ou nomes acessíveis. Novas linhas de itens do orçamento também recebem nomes acessíveis.
- Acrescentado atalho de teclado para pular a navegação nas páginas sem esse recurso.
- O gerador de sitemap ignorava guias e clima e podia apagar as URLs manuais na execução editorial: agora inclui as páginas indexáveis e respeita `noindex` nesses diretórios.

## Navegação e apresentação

As novidades têm uma seção própria na página inicial e estão disponíveis na busca e favoritos. Uma categoria de organização reúne agenda e lista de compras. Os cards do catálogo ganharam texto maior e contraste melhor.

## Verificações

- Auditoria estática das 40 páginas principais, incluindo todas as rotas de catálogo, assets locais, idioma, título principal, IDs duplicados e nomes acessíveis de campos.
- Regressões de orçamento, compras, comparador, favoritos e recuperação do catálogo.
- Cálculo de energia, tarifa opcional e conservação dos saldos nas divisões de 2 a 20 participantes.
- Datas civis, anos bissextos, exportação ICS, escapamento, salvamento opcional e falha de armazenamento.
- Geração de sitemap em cenário isolado para preservar painéis e excluir rascunhos.
- Rotinas e painéis de clima preservados. Uma execução recente do workflow de clima consta como concluída no GitHub; isso não garante a pontualidade nem o sucesso individual de todos os provedores.

Essa revisão não valida todo o acervo editorial nem todos os cenários legais, trabalhistas e financeiros das ferramentas antigas. Valores informados, disponibilidade de APIs externas e configurações do navegador continuam sujeitos a variações.

## Próximas ideias

1. **Carteira de garantias e manutenção:** cadastro local de datas de compra, comprovantes e manutenção, com exportação do histórico. Evitar guardar documentos sensíveis por padrão.
2. **Roteiro de mudança de endereço:** checklist pessoal de cadastros a atualizar, separado por moradia, trabalho e serviços, sem transmitir dados a terceiros.
3. **Central de serviços oficiais por necessidade:** organizar links verificados para documentos, trabalho, educação e atendimento público; não pedir login gov.br no portal.
4. **Plano doméstico para emergências:** checklist imprimível de contatos e itens, ligado às orientações oficiais da Defesa Civil local; sem sugerir rotas seguras calculadas pelo site.

As quatro ideias acima são propostas para uma próxima etapa e não estão implementadas nesta entrega.
