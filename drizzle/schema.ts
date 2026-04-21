import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
  decimal,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  discordId: varchar("discordId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Discord servers managed by the bot
 */
export const servers = mysqlTable(
  "servers",
  {
    id: int("id").autoincrement().primaryKey(),
    discordServerId: varchar("discordServerId", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    icon: text("icon"),
    ownerId: varchar("ownerId", { length: 64 }).notNull(),
    prefix: varchar("prefix", { length: 10 }).default("!").notNull(),
    welcomeChannelId: varchar("welcomeChannelId", { length: 64 }),
    logChannelId: varchar("logChannelId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    discordServerIdIdx: index("discordServerId_idx").on(table.discordServerId),
    ownerIdIdx: index("ownerId_idx").on(table.ownerId),
  })
);

export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;

/**
 * Server feature settings
 */
export const serverSettings = mysqlTable(
  "serverSettings",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    moderationEnabled: boolean("moderationEnabled").default(true).notNull(),
    economyEnabled: boolean("economyEnabled").default(true).notNull(),
    levelingEnabled: boolean("levelingEnabled").default(true).notNull(),
    autoModEnabled: boolean("autoModEnabled").default(true).notNull(),
    welcomeEnabled: boolean("welcomeEnabled").default(true).notNull(),
    antiSpamEnabled: boolean("antiSpamEnabled").default(true).notNull(),
    antiLinkEnabled: boolean("antiLinkEnabled").default(false).notNull(),
    antiBadWordsEnabled: boolean("antiBadWordsEnabled").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("serverSettings_serverId_idx").on(table.serverId),
  })
);

export type ServerSettings = typeof serverSettings.$inferSelect;
export type InsertServerSettings = typeof serverSettings.$inferInsert;

/**
 * Moderation logs
 */
export const moderationLogs = mysqlTable(
  "moderationLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    action: mysqlEnum("action", ["ban", "kick", "mute", "warn", "clear"]).notNull(),
    targetUserId: varchar("targetUserId", { length: 64 }).notNull(),
    targetUsername: varchar("targetUsername", { length: 255 }).notNull(),
    moderatorId: varchar("moderatorId", { length: 64 }).notNull(),
    moderatorUsername: varchar("moderatorUsername", { length: 255 }).notNull(),
    reason: text("reason"),
    duration: int("duration"), // in seconds, null for permanent
    messageCount: int("messageCount"), // for clear action
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("moderationLogs_serverId_idx").on(table.serverId),
    targetUserIdIdx: index("moderationLogs_targetUserId_idx").on(table.targetUserId),
    createdAtIdx: index("moderationLogs_createdAt_idx").on(table.createdAt),
  })
);

export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = typeof moderationLogs.$inferInsert;

/**
 * User economy data
 */
export const economy = mysqlTable(
  "economy",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    userId: varchar("userId", { length: 64 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    balance: decimal("balance", { precision: 18, scale: 2 }).default("0").notNull(),
    lastDailyReward: timestamp("lastDailyReward"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdUserIdIdx: index("economy_serverId_userId_idx").on(table.serverId, table.userId),
  })
);

export type Economy = typeof economy.$inferSelect;
export type InsertEconomy = typeof economy.$inferInsert;

/**
 * Economy transfers/transactions
 */
export const economyTransfers = mysqlTable(
  "economyTransfers",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    fromUserId: varchar("fromUserId", { length: 64 }).notNull(),
    toUserId: varchar("toUserId", { length: 64 }).notNull(),
    amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("economyTransfers_serverId_idx").on(table.serverId),
    fromUserIdIdx: index("economyTransfers_fromUserId_idx").on(table.fromUserId),
    createdAtIdx: index("economyTransfers_createdAt_idx").on(table.createdAt),
  })
);

export type EconomyTransfer = typeof economyTransfers.$inferSelect;
export type InsertEconomyTransfer = typeof economyTransfers.$inferInsert;

/**
 * Shop items
 */
export const shopItems = mysqlTable(
  "shopItems",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 18, scale: 2 }).notNull(),
    emoji: varchar("emoji", { length: 10 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("shopItems_serverId_idx").on(table.serverId),
  })
);

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = typeof shopItems.$inferInsert;

/**
 * User leveling data
 */
export const leveling = mysqlTable(
  "leveling",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    userId: varchar("userId", { length: 64 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    xp: bigint("xp", { mode: "number" }).default(0).notNull(),
    level: int("level").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdUserIdIdx: index("leveling_serverId_userId_idx").on(table.serverId, table.userId),
    serverIdLevelIdx: index("leveling_serverId_level_idx").on(table.serverId, table.level),
  })
);

export type Leveling = typeof leveling.$inferSelect;
export type InsertLeveling = typeof leveling.$inferInsert;

/**
 * Leveling settings per server
 */
export const levelingSettings = mysqlTable(
  "levelingSettings",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    levelUpMessage: text("levelUpMessage").notNull(),
    levelUpChannelId: varchar("levelUpChannelId", { length: 64 }),
    xpMultiplier: decimal("xpMultiplier", { precision: 5, scale: 2 }).default("1").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("levelingSettings_serverId_idx").on(table.serverId),
  })
);

export type LevelingSettings = typeof levelingSettings.$inferSelect;
export type InsertLevelingSettings = typeof levelingSettings.$inferInsert;

/**
 * Welcome message settings
 */
export const welcomeSettings = mysqlTable(
  "welcomeSettings",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    welcomeMessage: text("welcomeMessage").notNull(),
    leaveMessage: text("leaveMessage").notNull(),
    backgroundImageUrl: text("backgroundImageUrl"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("welcomeSettings_serverId_idx").on(table.serverId),
  })
);

export type WelcomeSettings = typeof welcomeSettings.$inferSelect;
export type InsertWelcomeSettings = typeof welcomeSettings.$inferInsert;

/**
 * Auto-moderation settings
 */
export const autoModSettings = mysqlTable(
  "autoModSettings",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    spamThreshold: int("spamThreshold").default(5).notNull(), // messages in timeWindow
    spamTimeWindow: int("spamTimeWindow").default(5).notNull(), // seconds
    spamAction: mysqlEnum("spamAction", ["warn", "mute", "kick"]).default("warn").notNull(),
    linkBlacklist: json("linkBlacklist").$type<string[]>().notNull(),
    badWords: json("badWords").$type<string[]>().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("autoModSettings_serverId_idx").on(table.serverId),
  })
);

export type AutoModSettings = typeof autoModSettings.$inferSelect;
export type InsertAutoModSettings = typeof autoModSettings.$inferInsert;

/**
 * Activity feed for real-time updates
 */
export const activityFeed = mysqlTable(
  "activityFeed",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    type: mysqlEnum("type", ["moderation", "economy", "leveling", "command", "join", "leave"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    userId: varchar("userId", { length: 64 }),
    username: varchar("username", { length: 255 }),
    metadata: json("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("activityFeed_serverId_idx").on(table.serverId),
    createdAtIdx: index("activityFeed_createdAt_idx").on(table.createdAt),
  })
);

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;

/**
 * Server statistics
 */
export const serverStats = mysqlTable(
  "serverStats",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    totalCommands: bigint("totalCommands", { mode: "number" }).default(0).notNull(),
    totalModerated: bigint("totalModerated", { mode: "number" }).default(0).notNull(),
    totalMembers: int("totalMembers").default(0).notNull(),
    totalTransactions: bigint("totalTransactions", { mode: "number" }).default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serverIdIdx: index("serverStats_serverId_idx").on(table.serverId),
  })
);

export type ServerStats = typeof serverStats.$inferSelect;
export type InsertServerStats = typeof serverStats.$inferInsert;

/**
 * Server admins mapping (users who can manage a server)
 */
export const serverAdmins = mysqlTable(
  "serverAdmins",
  {
    id: int("id").autoincrement().primaryKey(),
    serverId: int("serverId").notNull(),
    userId: int("userId").notNull(),
    discordUserId: varchar("discordUserId", { length: 64 }).notNull(),
    role: mysqlEnum("role", ["owner", "admin", "moderator"]).default("admin").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    serverIdUserIdIdx: index("serverAdmins_serverId_userId_idx").on(table.serverId, table.userId),
  })
);

export type ServerAdmin = typeof serverAdmins.$inferSelect;
export type InsertServerAdmin = typeof serverAdmins.$inferInsert;
