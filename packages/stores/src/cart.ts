'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Product } from '@rh5/contracts';

export interface CartLine {
  product: Product;
  quantity: number;
  selected: boolean;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  clearSelected: () => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  toggle: (productId: number) => void;
  toggleAll: () => void;
}

export const normalizeQuantity = (quantity: number) =>
  Number.isFinite(quantity) ? Math.min(99, Math.max(1, Math.trunc(quantity))) : 1;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.product.id === product.id);
          if (!existing) {
            return {
              lines: [
                ...state.lines,
                { product, quantity: normalizeQuantity(quantity), selected: true },
              ],
            };
          }
          return {
            lines: state.lines.map((line) =>
              line.product.id === product.id
                ? {
                    ...line,
                    product,
                    quantity: normalizeQuantity(line.quantity + quantity),
                    selected: true,
                  }
                : line,
            ),
          };
        }),
      clearSelected: () =>
        set((state) => ({ lines: state.lines.filter((line) => !line.selected) })),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.product.id !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.product.id === productId
              ? { ...line, quantity: normalizeQuantity(quantity) }
              : line,
          ),
        })),
      toggle: (productId) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.product.id === productId ? { ...line, selected: !line.selected } : line,
          ),
        })),
      toggleAll: () => {
        const select = !get().lines.every((line) => line.selected);
        set((state) => ({ lines: state.lines.map((line) => ({ ...line, selected: select })) }));
      },
    }),
    { name: 'react-h5-cart', skipHydration: true },
  ),
);

export const cartTotals = (lines: CartLine[]) => {
  const selected = lines.filter((line) => line.selected);
  return {
    allSelected: lines.length > 0 && selected.length === lines.length,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    selectedCount: selected.reduce((sum, line) => sum + line.quantity, 0),
    selectedTotal: selected.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  };
};
