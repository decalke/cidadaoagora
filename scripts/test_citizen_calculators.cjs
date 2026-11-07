const assert = require('node:assert/strict');
const { energyEstimate, moneyToCents, splitExpenses } = require('../assets/v4/v4-citizen-calculators.js');
assert.deepEqual(energyEstimate({ watts: 100, hours: 5, days: 30, quantity: 2 }, 0.75), { kwh: 30, cost: 22.5 });
assert.equal(energyEstimate({ watts: 1000, hours: 0, days: 30, quantity: 1 }).cost, null);
assert.equal(energyEstimate({ watts: 1000, hours: 0, days: 30, quantity: 1 }, 0).cost, 0);
for (const item of [{ watts: 0, hours: 1, days: 30, quantity: 1 }, { watts: 1, hours: 25, days: 30, quantity: 1 }, { watts: 1, hours: 1, days: 32, quantity: 1 }, { watts: 1, hours: 1, days: 30, quantity: 1.5 }]) assert.throws(() => energyEstimate(item));
assert.equal(moneyToCents('10,01'), 1001);assert.equal(moneyToCents('10.1'), 1010);assert.equal(moneyToCents('0002'), 200);
for (const s of ['', '-1', '1.999', '1e3', 'Infinity', '0', '1000001', '1,2,3']) assert.throws(() => moneyToCents(s));
const result = splitExpenses(['Ana', 'Beto', 'Cris'], [{ payer: 'Ana', cents: 100 }]);
assert.deepEqual(result.balances.map(x => x.share), [34, 33, 33]);
assert.equal(result.total, 100);assert.equal(result.balances.reduce((sum, x) => sum + x.balance, 0), 0);
const adjusted = Object.fromEntries(result.balances.map(x => [x.name, x.balance]));
result.transfers.forEach(x => { adjusted[x.from] += x.cents;adjusted[x.to] -= x.cents; });assert(Object.values(adjusted).every(x => x === 0));
assert.deepEqual(splitExpenses(['Ana', 'Beto'], [{ payer: 'Ana', cents: 200 }, { payer: 'Beto', cents: 200 }]).transfers, []);
assert.equal(splitExpenses(['Ana', 'Beto'], []).total, 0);
assert.throws(() => splitExpenses(['Ana', 'Ana'], []));assert.throws(() => splitExpenses(['Ana', 'Beto'], [{ payer: 'Cris', cents: 100 }]));assert.throws(() => splitExpenses(['Ana', 'Beto'], [{ payer: 'Ana', cents: 1.5 }]));
for (let n = 2; n <= 20; n++) {
 const people = Array.from({ length: n }, (_, i) => 'Pessoa ' + i);
 const expenses = people.map((payer, i) => ({ payer, cents: 1 + i * 987 }));
 const division = splitExpenses(people, expenses), shares = division.balances.map(x => x.share);
 assert.equal(shares.reduce((s, x) => s + x, 0), division.total);assert(Math.max(...shares) - Math.min(...shares) <= 1);
 const balances = Object.fromEntries(division.balances.map(x => [x.name, x.balance]));division.transfers.forEach(x => { assert(x.cents > 0 && Number.isInteger(x.cents));balances[x.from] += x.cents;balances[x.to] -= x.cents; });assert(Object.values(balances).every(x => x === 0));
}
console.log('PASS: energia, tarifa opcional, valores inválidos, centavos, divisão e conservação dos saldos para 2–20 participantes');
