import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WaiterCatalogSchema, visibleWaiterCatalog } from './waiterCatalog';

const category = (id: number, name: string, active = true) => ({ id, name, active, posSortOrder: id, departmentId: 1, parentCategoryId: null, imageUri: null });
const product = (id: number, categoryId = 2, visible = true) => ({ id, categoryId, departmentId: 1, name: `Product ${id}`, active: true, posSortOrder: id, code: 'X', um: 'buc', priceBani: 1299, vatRate: 11, imageUri: 'https://api.gufo-pos.ro/api/uploads/pos-catalog/test.webp', isMenu: false, isVisibleInPos: visible });
const catalog = () => ({ departments: [{ id: 1, name: 'Bar', active: true }], categories: [category(2, 'Z'), category(1, 'A'), category(3, 'Hidden', false)], products: [product(9), product(2), product(3, 2, false), product(4, 3)] });

test('preserves POS ordering, integer prices, images and local IDs while filtering hidden entries', () => {
  const result = visibleWaiterCatalog(catalog());
  assert.deepEqual(result.categories.map(c => c.id), [2, 1]);
  assert.deepEqual(result.products.map(p => p.id), [9, 2]);
  assert.equal(result.products[0].priceBani, 1299);
  assert.match(result.products[0].imageUri!, /^https:/);
});
test('rejects duplicate IDs and device-only image URIs before replacing a snapshot', () => {
  const data = catalog();
  data.products.push(product(9));
  assert.equal(WaiterCatalogSchema.safeParse(data).success, false);
  const invalid = catalog(); invalid.products[0].imageUri = 'content://local/photo';
  assert.equal(WaiterCatalogSchema.safeParse(invalid).success, false);
});
test('an empty published catalog stays empty, without falling back to ERP', () => {
  assert.deepEqual(visibleWaiterCatalog({ departments: [], categories: [], products: [] }), { departments: [], categories: [], products: [] });
});
