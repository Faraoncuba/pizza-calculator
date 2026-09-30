import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRecipe, defaultRecipe, type RecipeInput } from '../src/lib/calculator';

const calculate = (changes: Partial<RecipeInput> = {}) => calculateRecipe({ ...defaultRecipe, ...changes });
const valid = (changes: Partial<RecipeInput> = {}) => {
  const result = calculate(changes);
  assert.deepEqual(result.errors, {});
  assert.ok(result.amounts);
  return result.amounts;
};
const closeTo = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('preserves the existing default pizza recipe and yeast conversion', () => {
  const amounts = valid();
  assert.equal(amounts.masaTotal, 750);
  closeTo(amounts.harina, 750 / 1.7);
  closeTo(amounts.agua / amounts.harina, 0.65);
  closeTo(amounts.levaduraFresca, amounts.harina * 0.006);
  closeTo(amounts.levaduraSeca, amounts.levaduraFresca / 3);
  assert.equal(amounts.harinaFinal, amounts.harina);
  assert.equal(amounts.aguaFinal, amounts.agua);
});

test('scales all quantities when pizza count doubles', () => {
  const original = valid();
  const doubled = valid({ pizzas: '6' });
  for (const field of ['masaTotal', 'harina', 'agua', 'levaduraFresca'] as const) {
    closeTo(doubled[field], original[field] * 2);
  }
});

test('calculates from flour without using hidden pizza inputs', () => {
  const amounts = valid({ modo: 'harina', harinaBase: '500', pizzas: '', pesoBola: '-5' });
  assert.equal(amounts.harina, 500);
  assert.equal(amounts.agua, 325);
  closeTo(amounts.masaTotal, 850);
  assert.equal(amounts.salGr, 10);
  assert.equal(amounts.aceiteGr, 10);
  assert.equal(amounts.azucarGr, 5);
  assert.equal(amounts.levaduraFresca, 3);
});

test('editing hydration changes water while preserving the chosen flour quantity', () => {
  const amounts = valid({ modo: 'harina', harinaBase: '1000', hidratacion: '72.5' });
  assert.equal(amounts.harina, 1000);
  assert.equal(amounts.agua, 725);
});

test('flour and pizza modes agree for equivalent recipes', () => {
  const flourRecipe = valid({ modo: 'harina', harinaBase: '500', usarPrefermento: true });
  const pizzaRecipe = valid({ pizzas: '2', pesoBola: String(flourRecipe.masaTotal / 2), usarPrefermento: true });
  for (const field of Object.keys(flourRecipe) as (keyof typeof flourRecipe)[]) closeTo(pizzaRecipe[field], flourRecipe[field]);
});

for (const pizzas of ['', '0', '-1', '2.5', 'NaN', 'Infinity']) {
  test(`rejects invalid pizza count ${JSON.stringify(pizzas)}`, () => {
    const result = calculate({ pizzas });
    assert.equal(result.amounts, null);
    assert.ok(result.errors.pizzas);
  });
}

for (const field of ['pesoBola', 'harinaBase'] as const) {
  test(`requires positive finite ${field}`, () => {
    for (const value of ['', '0', '-10', 'Infinity']) {
      const result = calculate({ modo: field === 'harinaBase' ? 'harina' : 'pizzas', [field]: value });
      assert.equal(result.amounts, null);
      assert.ok(result.errors[field]);
    }
  });
}

test('ignores the inactive flour input in pizza mode', () => {
  assert.equal(valid({ harinaBase: '' }).masaTotal, 750);
});

test('rejects empty, non-finite and out-of-range percentages', () => {
  for (const field of ['hidratacion', 'sal', 'aceite', 'azucar', 'levadura'] as const) {
    for (const value of ['', '-1', '101', 'Infinity']) {
      const result = calculate({ [field]: value });
      assert.equal(result.amounts, null);
      assert.ok(result.errors[field]);
    }
  }
});

test('allows zero for optional ingredients', () => {
  const amounts = valid({ sal: '0', aceite: '0', azucar: '0', levadura: '0' });
  for (const field of ['salGr', 'aceiteGr', 'azucarGr', 'levaduraFresca', 'levaduraSeca'] as const) assert.equal(amounts[field], 0);
});

test('poolish divides flour and water between the two phases', () => {
  const amounts = valid({ modo: 'harina', usarPrefermento: true });
  assert.equal(amounts.harinaPrefermento, 250);
  assert.equal(amounts.aguaPrefermento, 250);
  assert.equal(amounts.harinaFinal, 250);
  assert.equal(amounts.aguaFinal, 75);
});

test('accepts the exact poolish water limit without negative remainders', () => {
  for (const hydration of ['50', '65', '72.5', '80']) {
    const amounts = valid({ usarPrefermento: true, hidratacion: hydration, prefermentoPorcentaje: hydration });
    closeTo(amounts.aguaFinal, 0);
    assert.ok(amounts.aguaFinal >= 0);
  }
});

test('rejects poolish that exceeds available water with a useful limit', () => {
  const result = calculate({ usarPrefermento: true, prefermentoPorcentaje: '66' });
  assert.equal(result.amounts, null);
  assert.match(result.errors.prefermentoPorcentaje!, /65%/);
});

test('biga allows all flour at 50% hydration', () => {
  const amounts = valid({ modo: 'harina', usarPrefermento: true, tipoPrefermento: 'biga', hidratacion: '50', prefermentoPorcentaje: '100' });
  assert.equal(amounts.harinaPrefermento, 500);
  assert.equal(amounts.aguaPrefermento, 250);
  assert.equal(amounts.harinaFinal, 0);
  assert.equal(amounts.aguaFinal, 0);
});

test('nominal preferment quantities cannot exceed total flour or water', () => {
  const base: Partial<RecipeInput> = { modo: 'harina', usarPrefermento: true, prefermentoModo: 'nominal' };
  assert.match(calculate({ ...base, prefermentoHarina: '501' }).errors.prefermentoHarina!, /harina total/);
  assert.match(calculate({ ...base, prefermentoHarina: '326' }).errors.prefermentoHarina!, /agua disponible/);
  assert.equal(valid({ ...base, prefermentoHarina: '325' }).aguaFinal, 0);
  assert.equal(valid({ ...base, tipoPrefermento: 'biga', prefermentoHarina: '500' }).harinaFinal, 0);
});

test('invalid preferment inputs only block calculation when active', () => {
  assert.equal(valid({ prefermentoPorcentaje: '' }).masaTotal, 750);
  assert.equal(calculate({ usarPrefermento: true, prefermentoPorcentaje: '' }).amounts, null);
  assert.equal(calculate({ usarPrefermento: true, prefermentoModo: 'nominal', prefermentoHarina: '-1' }).amounts, null);
});

test('changing preferment input methods ignores the inactive value', () => {
  assert.equal(valid({ usarPrefermento: true, prefermentoHarina: '-1' }).harinaPrefermento > 0, true);
  assert.equal(valid({ usarPrefermento: true, prefermentoModo: 'nominal', prefermentoHarina: '100', prefermentoPorcentaje: '' }).harinaPrefermento, 100);
});

test('the suggested rounded poolish limit produces a valid recipe', () => {
  for (const prefermentoModo of ['porcentaje', 'nominal'] as const) {
    const base: Partial<RecipeInput> = { usarPrefermento: true, hidratacion: '65.125', prefermentoModo };
    const field = prefermentoModo === 'porcentaje' ? 'prefermentoPorcentaje' : 'prefermentoHarina';
    const result = calculate({ ...base, [field]: prefermentoModo === 'porcentaje' ? '80' : '300' });
    assert.equal(result.amounts, null);
    const suggested = result.errors[field]!.match(/a ([\d.]+)(?:%| g) o menos/)![1];
    assert.ok(valid({ ...base, [field]: suggested }).aguaFinal >= 0);
  }
});

test('rejects overflow and avoids non-finite ingredient amounts', () => {
  assert.equal(calculate({ pizzas: '3', pesoBola: '1e308' }).amounts, null);
  assert.equal(calculate({ modo: 'harina', harinaBase: '1.7e308' }).amounts, null);
  const amounts = valid({ modo: 'harina', harinaBase: '1e308', usarPrefermento: true });
  assert.ok(Object.values(amounts).every(Number.isFinite));
});
