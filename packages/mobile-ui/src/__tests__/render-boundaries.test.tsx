import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product } from '@rh5/contracts';
import { useCartStore } from '@rh5/stores';

import { PageHeader } from '../components/page-header';
import { ProductCard } from '../components/product-card';
import AiPage from '../screens/ai';
import ProductsPage from '../screens/products';
import type { UiButtonProps, UiTextAreaProps } from '../ui';

const product: Product = {
  id: 1,
  title: 'Product',
  description: '',
  imageUrl: '',
  price: 10,
  memberPrice: 8,
  shopName: '',
  shopBadge: '',
  delivery: '',
};

const queryFailure = vi.hoisted(() => ({
  isError: false,
  isFetchNextPageError: false,
  isRefetchError: false,
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    data: { pages: [{ items: [product] }] },
    isPending: false,
    ...queryFailure,
    error: new Error('Page two failed'),
    hasNextPage: false,
  }),
}));
vi.mock('../components/page-header', () => ({ PageHeader: vi.fn<() => null>(() => null) }));
vi.mock('../components/product-card', () => ({
  ProductCard: vi.fn<(props: { product: Product }) => ReactNode>(({ product: item }) => (
    <article>{item.title}</article>
  )),
}));
vi.mock('../ui', () => ({
  useUi: () => ({
    Button: ({ children, onClick, disabled, 'aria-label': label }: UiButtonProps) => (
      <button onClick={onClick} disabled={disabled} aria-label={label}>
        {children}
      </button>
    ),
    TextArea: ({ onChange, value }: UiTextAreaProps) => (
      <button data-input={value} onClick={() => onChange?.('draft')}>
        Type draft
      </button>
    ),
    PullToRefresh: ({ children }: { children: ReactNode }) => children,
    InfiniteScroll: () => null,
    ErrorState: ({
      title,
      description,
      action,
    }: {
      title: string;
      description?: string;
      action?: ReactNode;
    }) => (
      <div>
        {title}
        {description}
        {action}
      </div>
    ),
    toast: vi.fn<(message: string) => void>(),
  }),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe('local render boundaries', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(queryFailure, {
      isError: false,
      isFetchNextPageError: false,
      isRefetchError: false,
    });
    useCartStore.setState({ lines: [] });
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('updates the cart badge without rendering product cards again', async () => {
    await act(async () => root.render(<ProductsPage />));
    const renders = vi.mocked(ProductCard).mock.calls.length;
    await act(async () => useCartStore.getState().add(product));

    expect(container.querySelector('.cart-pill')?.textContent).toBe('1');
    expect(vi.mocked(ProductCard).mock.calls).toHaveLength(renders);
  });

  it('keeps typing in the composer from rendering the chat page again', async () => {
    await act(async () => root.render(<AiPage />));
    const renders = vi.mocked(PageHeader).mock.calls.length;
    await act(async () => container.querySelector<HTMLButtonElement>('[data-input]')?.click());

    expect(container.querySelector('[data-input]')?.getAttribute('data-input')).toBe('draft');
    expect(vi.mocked(PageHeader).mock.calls).toHaveLength(renders);
  });

  it.each(['isFetchNextPageError', 'isRefetchError'] as const)(
    'keeps cached products visible after %s',
    async (kind) => {
      queryFailure.isError = true;
      queryFailure[kind] = true;
      await act(async () => root.render(<ProductsPage />));
      expect(container.querySelector('.product-list')?.textContent).toContain('Product');
      expect(container.textContent).toContain('Page two failed');
    },
  );
});
