import '../env.config';

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { productsTable, usersTable } from '../packages/server/src/db/schema';
import { productsForLocale, users } from '../packages/server/src/data';
import { hashPassword } from '../packages/server/src/password';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('缺少 DATABASE_URL，无法写入种子数据');
  const pool = new Pool({ connectionString });
  const database = drizzle(pool);

  const zhProducts = productsForLocale('zh-CN');
  const enProducts = productsForLocale('en-US');
  const jaProducts = productsForLocale('ja-JP');

  try {
    for (const [index, product] of zhProducts.entries()) {
      const values = {
        id: product.id,
        titleZh: product.title,
        titleEn: enProducts[index]?.title ?? product.title,
        titleJa: jaProducts[index]?.title ?? product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        memberPrice: product.memberPrice,
        shopName: product.shopName,
        shopBadge: product.shopBadge,
        delivery: product.delivery,
        description: product.description,
        sortOrder: index,
        updatedAt: new Date(),
      };
      await database.insert(productsTable).values(values).onConflictDoUpdate({
        target: productsTable.id,
        set: values,
      });
    }

    for (const user of users) {
      const passwordHash = await hashPassword(user.password);
      await database
        .insert(usersTable)
        .values({
          id: user.id,
          username: user.username,
          passwordHash,
          realName: user.realName,
          avatar: user.avatar,
          roles: user.roles,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: usersTable.username,
          set: {
            avatar: user.avatar,
            passwordHash,
            realName: user.realName,
            roles: user.roles,
            updatedAt: new Date(),
          },
        });
    }

    await database.execute(
      sql`select setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 1), true) from products`,
    );
    await database.execute(
      sql`select setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1), true) from users`,
    );
  } finally {
    await pool.end();
  }
}

seed()
  .then(() => {
    console.info('PostgreSQL 种子数据已写入。');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
