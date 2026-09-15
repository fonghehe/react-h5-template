import { beforeEach, describe, expect, it } from 'vitest';

import type { Product } from '@rh5/contracts';

import { cartTotals, normalizeQuantity, useCartStore } from '../cart';

const product: Product = {
  id: 1,
  title: 'Test product',
  imageUrl: 'https://example.com/product.png',
  price: 12.5,
  memberPrice: 10,
  shopName: 'Test shop',
  shopBadge: '自营',
  delivery: '当日达',
  description: 'Test description',
};

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ lines: [] }));

  it('merges quantities and calculates selected totals', () => {
    useCartStore.getState().add(product, 2);
    useCartStore.getState().add(product, 3);
    const totals = cartTotals(useCartStore.getState().lines);
    expect(totals.itemCount).toBe(5);
    expect(totals.selectedTotal).toBe(62.5);
  });

  it('clamps unsafe quantities', () => {
    expect(normalizeQuantity(Number.NaN)).toBe(1);
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(120)).toBe(99);
  });
});
