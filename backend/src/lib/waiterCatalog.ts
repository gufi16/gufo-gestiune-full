import { z } from "zod";

const id = z.number().int().positive().safe();
const image = z.string().max(2048).refine(value => /^https?:\/\//.test(value) || value.startsWith('/api/uploads/')).nullable();
const entry = z.object({ id, name: z.string().min(1).max(500), active: z.boolean(), posSortOrder: z.number().int() });
export const WaiterCatalogSchema = z.object({
  departments: z.array(z.object({ id, name: z.string().min(1), active: z.boolean() })).max(10000),
  categories: z.array(entry.extend({ departmentId: id.nullable(), parentCategoryId: id.nullable(), imageUri: image })).max(10000),
  products: z.array(entry.extend({ code: z.string(), categoryId: id, departmentId: id, um: z.string(), priceBani: z.number().int().nonnegative().safe(), vatRate: z.number(), imageUri: image, isMenu: z.boolean(), isVisibleInPos: z.boolean() })).max(50000),
}).superRefine((catalog, ctx) => {
  for (const key of ['departments', 'categories', 'products'] as const) {
    if (new Set(catalog[key].map(item => item.id)).size !== catalog[key].length) ctx.addIssue({ code: 'custom', path: [key], message: 'Duplicate local IDs' });
  }
});

export function visibleWaiterCatalog(raw: unknown) {
  const data = WaiterCatalogSchema.parse(raw);
  // Arrays retain the order supplied by the POS database, including its collation.
  const categories = data.categories.filter(item => item.active);
  const categoryIds = new Set(categories.map(item => item.id));
  return {
    departments: data.departments.filter(item => item.active),
    categories,
    products: data.products.filter(item => item.active && item.isVisibleInPos && categoryIds.has(item.categoryId)),
  };
}
