import { index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 64 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    realName: varchar('real_name', { length: 120 }).notNull(),
    avatar: text('avatar').notNull(),
    roles: text('roles').array().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('users_username_idx').on(table.username)],
);

export const productsTable = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    titleZh: text('title_zh').notNull(),
    titleEn: text('title_en').notNull(),
    titleJa: text('title_ja').notNull(),
    imageUrl: text('image_url').notNull(),
    price: integer('price').notNull(),
    memberPrice: integer('member_price').notNull(),
    shopName: varchar('shop_name', { length: 160 }).notNull(),
    shopBadge: varchar('shop_badge', { length: 40 }).notNull(),
    delivery: varchar('delivery', { length: 120 }).notNull(),
    description: text('description').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('products_sort_order_idx').on(table.sortOrder)],
);

export type ProductRow = typeof productsTable.$inferSelect;
export type UserRow = typeof usersTable.$inferSelect;
