export const supportedLocales = ['zh-CN', 'en-US', 'ja-JP', 'zh-HK', 'zh-TW'] as const;

export type Locale = (typeof supportedLocales)[number];

export interface User {
  id: number;
  username: string;
  realName: string;
  avatar: string;
  roles: string[];
}

export interface LoginResult extends User {
  accessToken: string;
}

export interface Product {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  memberPrice: number;
  shopName: string;
  shopBadge: string;
  delivery: string;
  description: string;
}

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiEnvelope<T> {
  code: number;
  data: T;
  message: string;
  requestId: string;
}
