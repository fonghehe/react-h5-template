import 'server-only';

import { asc, count, eq } from 'drizzle-orm';

import type { Locale, Product, ProductPage } from '@rh5/contracts';

import { getDatabase } from '../db/client';
import { productsTable, type ProductRow } from '../db/schema';
import { productsForLocale } from '../data';

function toProduct(row: ProductRow, locale: Locale): Product {
  const title = locale === 'en-US' ? row.titleEn : locale === 'ja-JP' ? row.titleJa : row.titleZh;
  return {
    id: row.id,
    title,
    imageUrl: row.imageUrl,
    price: row.price,
    memberPrice: row.memberPrice,
    shopName: row.shopName,
    shopBadge: row.shopBadge,
    delivery: row.delivery,
    description: row.description,
  };
}

export async function listProducts(
  locale: Locale,
  page: number,
  pageSize: number,
): Promise<ProductPage> {
  const database = getDatabase();
  const start = (page - 1) * pageSize;

  if (!database) {
    const products = productsForLocale(locale);
    return {
      items: products.slice(start, start + pageSize),
      page,
      pageSize,
      total: products.length,
      hasMore: start + pageSize < products.length,
    };
  }

  const [[totalResult], rows] = await Promise.all([
    database.select({ value: count() }).from(productsTable),
    database
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.sortOrder), asc(productsTable.id))
      .limit(pageSize)
      .offset(start),
  ]);
  const total = totalResult?.value ?? 0;
  return {
    items: rows.map((row) => toProduct(row, locale)),
    page,
    pageSize,
    total,
    hasMore: start + pageSize < total,
  };
}

export async function findProduct(productId: number, locale: Locale): Promise<Product | null> {
  const database = getDatabase();
  if (!database) {
    return productsForLocale(locale).find((product) => product.id === productId) ?? null;
  }

  const [row] = await database
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);
  return row ? toProduct(row, locale) : null;
}
