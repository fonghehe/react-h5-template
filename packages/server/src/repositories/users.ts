import 'server-only';

import { eq } from 'drizzle-orm';

import type { User } from '@rh5/contracts';

import { getDatabase } from '../db/client';
import { usersTable, type UserRow } from '../db/schema';
import { publicUser, users } from '../data';
import { verifyPassword } from '../password';

function toPublicUser(user: UserRow): User {
  return {
    id: user.id,
    username: user.username,
    realName: user.realName,
    avatar: user.avatar,
    roles: user.roles,
  };
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const database = getDatabase();
  if (!database) {
    const user = users.find((item) => item.username === username && item.password === password);
    return user ? publicUser(user) : null;
  }

  const [user] = await database
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  return toPublicUser(user);
}

export async function findUser(userId: number): Promise<User | null> {
  const database = getDatabase();
  if (!database) {
    const user = users.find((item) => item.id === userId);
    return user ? publicUser(user) : null;
  }

  const [user] = await database.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user ? toPublicUser(user) : null;
}
