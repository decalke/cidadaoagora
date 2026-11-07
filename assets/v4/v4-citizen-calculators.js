/* Cálculos locais: nenhum valor é enviado ou salvo automaticamente. */
(function (global) {
  'use strict';
  function finite(value, min, max, label, integer) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw new Error(label + ' fora do intervalo permitido.');
    return value;
  }
  function energyEstimate(item, rate = null) {
    finite(item.watts, 0.01, 1000000, 'Potência');finite(item.hours, 0, 24, 'Horas por dia');
    finite(item.days, 1, 31, 'Dias no mês', true);finite(item.quantity, 1, 1000, 'Quantidade', true);
    if (rate !== null) finite(rate, 0, 1000, 'Tarifa');
    const kwh = item.watts * item.hours * item.days * item.quantity / 1000;
    return { kwh, cost: rate === null ? null : kwh * rate };
  }
  function moneyToCents(value) {
    if (typeof value !== 'string' || !/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) throw new Error('Informe um valor positivo com até duas casas decimais.');
    const [whole, part = ''] = value.trim().replace(',', '.').split('.');
    const cents = Number(whole) * 100 + Number(part.padEnd(2, '0'));
    if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 100000000) throw new Error('Use um valor entre R$ 0,01 e R$ 1.000.000,00.');
    return cents;
  }
  function splitExpenses(people, expenses) {
    if (!Array.isArray(people) || people.length < 2 || people.length > 20 || people.some(name => typeof name !== 'string' || !name.trim() || name.length > 60) || new Set(people).size !== people.length) throw new Error('Informe de 2 a 20 participantes diferentes.');
    if (!Array.isArray(expenses) || expenses.length > 100) throw new Error('Limite de 100 despesas por divisão.');
    const paid = people.map(() => 0);let total = 0;
    expenses.forEach(expense => {
      const index = people.indexOf(expense.payer);
      if (index < 0 || !Number.isSafeInteger(expense.cents) || expense.cents <= 0 || expense.cents > 100000000) throw new Error('Despesa ou pagador inválido.');
      total += expense.cents;paid[index] += expense.cents;
      if (!Number.isSafeInteger(total)) throw new Error('Total fora do limite permitido.');
    });
    const base = Math.floor(total / people.length), remainder = total % people.length;
    const balances = people.map((name, index) => ({ name, paid: paid[index], share: base + (index < remainder ? 1 : 0), balance: paid[index] - base - (index < remainder ? 1 : 0) }));
    const debtors = balances.filter(x => x.balance < 0).map(x => ({ name: x.name, value: -x.balance }));
    const creditors = balances.filter(x => x.balance > 0).map(x => ({ name: x.name, value: x.balance }));
    const transfers = [];let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const cents = Math.min(debtors[i].value, creditors[j].value);
      transfers.push({ from: debtors[i].name, to: creditors[j].name, cents });
      debtors[i].value -= cents;creditors[j].value -= cents;
      if (!debtors[i].value) i++;if (!creditors[j].value) j++;
    }
    return { total, base, remainder, balances, transfers };
  }
  const api = { energyEstimate, moneyToCents, splitExpenses };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!global.document) return;
  const document = global.document, $ = id => document.getElementById(id), money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const number = value => value.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  const el = (tag, text, cls) => { const n = document.createElement(tag);if (text !== undefined) n.textContent = text;if (cls) n.className = cls;return n; };
  function announce(text) { $('citizen-status').textContent = text; }
  async function copy(text) { try { await navigator.clipboard.writeText(text);announce('Resumo copiado.'); } catch { announce('Não foi possível copiar. Selecione o texto do resultado para copiar manualmente.'); } }
  if (document.querySelector('[data-citizen-tool="energy"]')) {
    let items = [];
    function rate() { const input = $('energy-rate');if (input.value.trim() === '') return null;if (!input.checkValidity()) throw new Error('Informe uma tarifa de 0 a 1.000 R$/kWh, com até cinco casas decimais.');const n = input.valueAsNumber;finite(n, 0, 1000, 'Tarifa');return n; }
    function render() {
      let tariff;try { tariff = rate(); } catch (error) { $('energy-total-cost').textContent = '—';$('energy-tariff-note').textContent = error.message;tariff = null; }
      const list = $('energy-list');list.replaceChildren();let total = 0;
      items.forEach((item, index) => {
        const result = energyEstimate(item, tariff);total += result.kwh;
        const row = el('div', undefined, 'citizen-row'), content = el('div');content.append(el('strong', item.name), el('small', `${number(item.watts)} W × ${number(item.hours)} h/dia × ${item.days} dias × ${item.quantity} unidade(s)`), el('p', `${number(result.kwh)} kWh/mês${result.cost === null ? '' : ' · ' + money(result.cost)}`));
        const button = el('button', 'Remover', 'citizen-remove');button.type = 'button';button.setAttribute('aria-label', 'Remover ' + item.name);button.addEventListener('click', () => { items.splice(index, 1);render();announce('Aparelho removido.'); });row.append(content, button);list.append(row);
      });
      if (!items.length) list.append(el('p', 'Adicione os aparelhos para montar sua estimativa.', 'citizen-muted'));
      $('energy-total-kwh').textContent = number(total) + ' kWh/mês';
      if ($('energy-rate').checkValidity()) { $('energy-total-cost').textContent = tariff === null ? 'Informe a tarifa' : money(total * tariff);$('energy-tariff-note').textContent = tariff === null ? 'Use a tarifa por kWh da sua conta para estimar o custo.' : 'Custo estimado dos aparelhos informados. Não é o total da fatura.'; }
    }
    $('energy-form').addEventListener('submit', event => {
      event.preventDefault();if (!$('energy-form').reportValidity()) return;
      try {
        if (items.length >= 100) throw new Error('Limite de 100 aparelhos. Remova um item para continuar.');
        const name = $('energy-name').value.trim();if (!name) throw new Error('Informe o nome do aparelho.');
        const item = { name: name.slice(0, 80), watts: $('energy-watts').valueAsNumber, hours: $('energy-hours').valueAsNumber, days: $('energy-days').valueAsNumber, quantity: $('energy-quantity').valueAsNumber };
        energyEstimate(item);items.push(item);render();$('energy-name').value = '';$('energy-name').focus();announce('Aparelho adicionado.');
      } catch (error) { announce(error.message); }
    });
    $('energy-rate').addEventListener('input', render);
    $('energy-clear').addEventListener('click', () => { items = [];$('energy-rate').value = '';render();announce('Lista e tarifa apagadas.'); });
    $('energy-copy').addEventListener('click', () => copy('Estimativa de consumo\n' + items.map(item => item.name + ': ' + number(energyEstimate(item).kwh) + ' kWh/mês').join('\n') + '\nTotal: ' + $('energy-total-kwh').textContent + '\nCusto: ' + $('energy-total-cost').textContent + '\nEstimativa de aparelhos; não inclui todas as parcelas da fatura.'));
    render();
  }
  if (document.querySelector('[data-citizen-tool="split"]')) {
    let people = [], expenses = [];
    function render() {
      const list = $('split-people'), payer = $('split-payer');
      const selected = people.includes(payer.value) ? payer.value : people[0];list.replaceChildren();payer.replaceChildren();
      people.forEach(name => {
        const row = el('div', undefined, 'citizen-person');row.append(el('span', name));
        const remove = el('button', '×');remove.type = 'button';remove.setAttribute('aria-label', 'Remover participante ' + name);remove.disabled = expenses.length > 0;remove.title = expenses.length ? 'Apague as despesas antes de alterar o grupo.' : 'Remover participante';remove.addEventListener('click', () => { people = people.filter(x => x !== name);render();announce('Participante removido.'); });row.append(remove);list.append(row);
        const option = el('option', name);option.value = name;payer.append(option);
      });
      if (selected) payer.value = selected;
      $('split-person-name').disabled = expenses.length > 0;$('split-person-add').disabled = expenses.length > 0;
      $('split-expense-add').disabled = people.length < 2;
      const expenseList = $('split-expenses');expenseList.replaceChildren();
      expenses.forEach((expense, index) => {
        const row = el('div', undefined, 'citizen-row'), content = el('div');content.append(el('strong', expense.description), el('small', 'Pago por ' + expense.payer), el('p', money(expense.cents / 100)));
        const remove = el('button', 'Remover', 'citizen-remove');remove.type = 'button';remove.setAttribute('aria-label', 'Remover despesa ' + expense.description);remove.addEventListener('click', () => { expenses.splice(index, 1);render();announce('Despesa removida.'); });row.append(content, remove);expenseList.append(row);
      });
      if (!expenses.length) expenseList.append(el('p', 'Nenhuma despesa adicionada.', 'citizen-muted'));
      const balances = $('split-balances'), transfers = $('split-transfers');balances.replaceChildren();transfers.replaceChildren();
      if (people.length < 2) { $('split-total').textContent = money(0);$('split-share-note').textContent = 'Adicione ao menos duas pessoas e depois registre quem pagou cada despesa.';return; }
      const result = splitExpenses(people, expenses);$('split-total').textContent = money(result.total / 100);
      $('split-share-note').textContent = result.remainder ? `Divisão em centavos: ${result.remainder} participante(s), na ordem de cadastro, têm R$ 0,01 a mais em sua parte para fechar o total.` : 'O total é dividido igualmente entre os participantes.';
      result.balances.forEach(person => { const p = el('p');p.append(el('strong', person.name), el('span', ` · pagou ${money(person.paid / 100)} · sua parte ${money(person.share / 100)} · ${person.balance > 0 ? 'recebe ' + money(person.balance / 100) : person.balance < 0 ? 'paga ' + money(-person.balance / 100) : 'saldo acertado'}`));balances.append(p); });
      result.transfers.forEach(transfer => transfers.append(el('p', `${transfer.from} → ${transfer.to}: ${money(transfer.cents / 100)}`, 'citizen-transfer')));
      if (!result.transfers.length) transfers.append(el('p', expenses.length ? 'Nenhum acerto necessário.' : 'Adicione uma despesa para calcular os acertos.'));
    }
    $('split-person-form').addEventListener('submit', event => { event.preventDefault();if (!$('split-person-form').reportValidity()) return;const name = $('split-person-name').value.trim();if (expenses.length) { announce('Apague as despesas antes de alterar o grupo.');return; }if (!name || people.some(x => x.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) { announce('Use nomes diferentes para identificar cada participante.');return; }if (people.length >= 20) { announce('Limite de 20 participantes.');return; }people.push(name.slice(0, 60));$('split-person-name').value = '';render();announce('Participante adicionado.');$('split-person-name').focus(); });
    $('split-expense-form').addEventListener('submit', event => { event.preventDefault();if (!$('split-expense-form').reportValidity()) return;try { if (people.length < 2) throw new Error('Adicione ao menos duas pessoas.');if (expenses.length >= 100) throw new Error('Limite de 100 despesas.');const description = $('split-description').value.trim();if (!description) throw new Error('Informe uma descrição.');const expense = { description: description.slice(0, 100), payer: $('split-payer').value, cents: moneyToCents($('split-amount').value) };splitExpenses(people, [...expenses, expense]);expenses.push(expense);$('split-description').value = '';$('split-amount').value = '';render();announce('Despesa adicionada. O grupo fica fixo enquanto houver despesas.');$('split-description').focus(); } catch (error) { announce(error.message); } });
    $('split-clear').addEventListener('click', () => { people = [];expenses = [];render();announce('Grupo e despesas apagados.'); });
    $('split-copy').addEventListener('click', () => { if (people.length < 2) { announce('Adicione ao menos duas pessoas antes de copiar.');return; }const result = splitExpenses(people, expenses);copy('Divisão de despesas\nTotal: ' + money(result.total / 100) + '\n' + result.balances.map(p => `${p.name}: pagou ${money(p.paid / 100)}; sua parte ${money(p.share / 100)}`).join('\n') + '\nAcertos sugeridos:\n' + (result.transfers.map(t => `${t.from} → ${t.to}: ${money(t.cents / 100)}`).join('\n') || 'Nenhum acerto necessário.') + '\nCentavos restantes distribuídos pela ordem de cadastro.'); });
    render();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
