import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  servers,
  serverSettings,
  moderationLogs,
  economy,
  economyTransfers,
  leveling,
  levelingSettings,
  welcomeSettings,
  autoModSettings,
  activityFeed,
  serverStats,
  shopItems,
  serverAdmins,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "discordId", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Server queries
export async function getServersByUserId(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(servers).where(eq(servers.ownerId, userId));
}

export async function getServerById(serverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(servers).where(eq(servers.id, serverId)).limit(1);
  return result[0];
}

export async function getServerByDiscordId(discordServerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(servers)
    .where(eq(servers.discordServerId, discordServerId))
    .limit(1);
  return result[0];
}

export async function createOrUpdateServer(data: {
  discordServerId: string;
  name: string;
  icon?: string;
  ownerId: string;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await getServerByDiscordId(data.discordServerId);
  if (existing) {
    await db
      .update(servers)
      .set({
        name: data.name,
        icon: data.icon,
        updatedAt: new Date(),
      })
      .where(eq(servers.id, existing.id));
    return existing.id;
  }

  const result = await db.insert(servers).values({
    discordServerId: data.discordServerId,
    name: data.name,
    icon: data.icon,
    ownerId: data.ownerId,
  });
  return result[0].insertId as number;
}

// Server settings queries
export async function getServerSettings(serverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serverSettings)
    .where(eq(serverSettings.serverId, serverId))
    .limit(1);
  return result[0];
}

export async function updateServerSettings(
  serverId: number,
  data: Partial<typeof serverSettings.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getServerSettings(serverId);
  if (existing) {
    await db
      .update(serverSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serverSettings.serverId, serverId));
  } else {
    await db.insert(serverSettings).values({
      serverId,
      ...data,
    });
  }
}

// Moderation queries
export async function getModerationLogs(serverId: number, limit_: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moderationLogs)
    .where(eq(moderationLogs.serverId, serverId))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(limit_);
}

export async function addModerationLog(data: typeof moderationLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(moderationLogs).values(data);
}

// Economy queries
export async function getEconomyData(serverId: number, userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(economy)
    .where(and(eq(economy.serverId, serverId), eq(economy.userId, userId)))
    .limit(1);
  return result[0];
}

export async function getEconomyLeaderboard(serverId: number, limit_: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(economy)
    .where(eq(economy.serverId, serverId))
    .orderBy(desc(economy.balance))
    .limit(limit_);
}

export async function updateEconomyBalance(
  serverId: number,
  userId: string,
  username: string,
  newBalance: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getEconomyData(serverId, userId);
  if (existing) {
    await db
      .update(economy)
      .set({ balance: newBalance as any, updatedAt: new Date() })
      .where(and(eq(economy.serverId, serverId), eq(economy.userId, userId)));
  } else {
    await db.insert(economy).values({
      serverId,
      userId,
      username,
      balance: newBalance as any,
    });
  }
}

export async function addEconomyTransfer(data: typeof economyTransfers.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(economyTransfers).values(data);
}

export async function getEconomyTransfers(serverId: number, limit_: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(economyTransfers)
    .where(eq(economyTransfers.serverId, serverId))
    .orderBy(desc(economyTransfers.createdAt))
    .limit(limit_);
}

// Leveling queries
export async function getLevelingData(serverId: number, userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(leveling)
    .where(and(eq(leveling.serverId, serverId), eq(leveling.userId, userId)))
    .limit(1);
  return result[0];
}

export async function getLevelingLeaderboard(serverId: number, limit_: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(leveling)
    .where(eq(leveling.serverId, serverId))
    .orderBy(desc(leveling.level), desc(leveling.xp))
    .limit(limit_);
}

export async function updateLevelingData(
  serverId: number,
  userId: string,
  username: string,
  xp: number,
  level: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getLevelingData(serverId, userId);
  if (existing) {
    await db
      .update(leveling)
      .set({ xp: xp as any, level, updatedAt: new Date() })
      .where(and(eq(leveling.serverId, serverId), eq(leveling.userId, userId)));
  } else {
    await db.insert(leveling).values({
      serverId,
      userId,
      username,
      xp: xp as any,
      level,
    });
  }
}

// Leveling settings queries
export async function getLevelingSettings(serverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(levelingSettings)
    .where(eq(levelingSettings.serverId, serverId))
    .limit(1);
  return result[0];
}

export async function updateLevelingSettings(
  serverId: number,
  data: Partial<typeof levelingSettings.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getLevelingSettings(serverId);
  if (existing) {
    await db
      .update(levelingSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(levelingSettings.serverId, serverId));
  } else {
    await db.insert(levelingSettings).values({
      serverId,
      levelUpMessage: "Congratulations {user}! You reached level {level}!",
      ...data,
    });
  }
}

// Welcome settings queries
export async function getWelcomeSettings(serverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(welcomeSettings)
    .where(eq(welcomeSettings.serverId, serverId))
    .limit(1);
  return result[0];
}

export async function updateWelcomeSettings(
  serverId: number,
  data: Partial<typeof welcomeSettings.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getWelcomeSettings(serverId);
  if (existing) {
    await db
      .update(welcomeSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(welcomeSettings.serverId, serverId));
  } else {
    await db.insert(welcomeSettings).values({
      serverId,
      welcomeMessage: "Welcome to {server}! {user}",
      leaveMessage: "{user} has left the server.",
      ...data,
    });
  }
}

// Auto-moderation settings queries
export async function getAutoModSettings(serverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(autoModSettings)
    .where(eq(autoModSettings.serverId, serverId))
    .limit(1);
  return result[0];
}

export async function updateAutoModSettings(
  serverId: number,
  data: Partial<typeof autoModSettings.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getAutoModSettings(serverId);
  if (existing) {
    await db
      .update(autoModSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(autoModSettings.serverId, serverId));
  } else {
    await db.insert(autoModSettings).values({
      serverId,
      linkBlacklist: [],
      badWords: [],
      ...data,
    });
  }
}

// Activity feed queries
export async function addActivityFeed(data: typeof activityFeed.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityFeed).values(data);
}

export async function getActivityFeed(serverId: number, limit_: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activityFeed)
    .where(eq(activityFeed.serverId, serverId))
    .orderBy(desc(activityFeed.createdAt))
    .limit(limit_);
}

// Server stats queries
export async function getServerStats(serverId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(serverStats)
    .where(eq(serverStats.serverId, serverId))
    .limit(1);
  return result[0];
}

export async function updateServerStats(
  serverId: number,
  data: Partial<typeof serverStats.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getServerStats(serverId);
  if (existing) {
    await db
      .update(serverStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serverStats.serverId, serverId));
  } else {
    await db.insert(serverStats).values({
      serverId,
      ...data,
    });
  }
}

// Shop items queries
export async function getShopItems(serverId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shopItems).where(eq(shopItems.serverId, serverId));
}

export async function addShopItem(data: typeof shopItems.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(shopItems).values(data);
}

export async function updateShopItem(itemId: number, data: Partial<typeof shopItems.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(shopItems).set({ ...data, updatedAt: new Date() }).where(eq(shopItems.id, itemId));
}

export async function deleteShopItem(itemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(shopItems).where(eq(shopItems.id, itemId));
}

// Server admins queries
export async function getServerAdmins(serverId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serverAdmins).where(eq(serverAdmins.serverId, serverId));
}

export async function isServerAdmin(serverId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(serverAdmins)
    .where(and(eq(serverAdmins.serverId, serverId), eq(serverAdmins.userId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function addServerAdmin(data: typeof serverAdmins.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(serverAdmins).values(data);
}
