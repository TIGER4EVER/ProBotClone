CREATE TABLE `activityFeed` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`type` enum('moderation','economy','leveling','command','join','leave') NOT NULL,
`title` varchar(255) NOT NULL,
`description` text,
`userId` varchar(64),
`username` varchar(255),
`metadata` json NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `activityFeed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autoModSettings` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`spamThreshold` int NOT NULL DEFAULT 5,
`spamTimeWindow` int NOT NULL DEFAULT 5,
`spamAction` enum('warn','mute','kick') NOT NULL DEFAULT 'warn',
`linkBlacklist` json NOT NULL,
`badWords` json NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `autoModSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `economy` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`userId` varchar(64) NOT NULL,
`username` varchar(255) NOT NULL,
`balance` decimal(18,2) NOT NULL DEFAULT '0',
`lastDailyReward` timestamp,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `economy_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `economyTransfers` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`fromUserId` varchar(64) NOT NULL,
`toUserId` varchar(64) NOT NULL,
`amount` decimal(18,2) NOT NULL,
`reason` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `economyTransfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leveling` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`userId` varchar(64) NOT NULL,
`username` varchar(255) NOT NULL,
`xp` bigint NOT NULL DEFAULT 0,
`level` int NOT NULL DEFAULT 1,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `leveling_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `levelingSettings` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`levelUpMessage` text NOT NULL,
`levelUpChannelId` varchar(64),
`xpMultiplier` decimal(5,2) NOT NULL DEFAULT '1',
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `levelingSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderationLogs` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`action` enum('ban','kick','mute','warn','clear') NOT NULL,
`targetUserId` varchar(64) NOT NULL,
`targetUsername` varchar(255) NOT NULL,
`moderatorId` varchar(64) NOT NULL,
`moderatorUsername` varchar(255) NOT NULL,
`reason` text,
`duration` int,
`messageCount` int,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `moderationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serverAdmins` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`userId` int NOT NULL,
`discordUserId` varchar(64) NOT NULL,
`role` enum('owner','admin','moderator') NOT NULL DEFAULT 'admin',
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `serverAdmins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serverSettings` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`moderationEnabled` boolean NOT NULL DEFAULT true,
`economyEnabled` boolean NOT NULL DEFAULT true,
`levelingEnabled` boolean NOT NULL DEFAULT true,
`autoModEnabled` boolean NOT NULL DEFAULT true,
`welcomeEnabled` boolean NOT NULL DEFAULT true,
`antiSpamEnabled` boolean NOT NULL DEFAULT true,
`antiLinkEnabled` boolean NOT NULL DEFAULT false,
`antiBadWordsEnabled` boolean NOT NULL DEFAULT false,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `serverSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serverStats` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`totalCommands` bigint NOT NULL DEFAULT 0,
`totalModerated` bigint NOT NULL DEFAULT 0,
`totalMembers` int NOT NULL DEFAULT 0,
`totalTransactions` bigint NOT NULL DEFAULT 0,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `serverStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
`id` int AUTO_INCREMENT NOT NULL,
`discordServerId` varchar(64) NOT NULL,
`name` varchar(255) NOT NULL,
`icon` text,
`ownerId` varchar(64) NOT NULL,
`prefix` varchar(10) NOT NULL DEFAULT '!',
`welcomeChannelId` varchar(64),
`logChannelId` varchar(64),
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `servers_id` PRIMARY KEY(`id`),
CONSTRAINT `servers_discordServerId_unique` UNIQUE(`discordServerId`)
);
--> statement-breakpoint
CREATE TABLE `shopItems` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`name` varchar(255) NOT NULL,
`description` text,
`price` decimal(18,2) NOT NULL,
`emoji` varchar(10),
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `shopItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `welcomeSettings` (
`id` int AUTO_INCREMENT NOT NULL,
`serverId` int NOT NULL,
`welcomeMessage` text NOT NULL,
`leaveMessage` text NOT NULL,
`backgroundImageUrl` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `welcomeSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `discordId` varchar(64);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_discordId_unique` UNIQUE(`discordId`);
--> statement-breakpoint
CREATE INDEX `activityFeed_serverId_idx` ON `activityFeed` (`serverId`);
--> statement-breakpoint
CREATE INDEX `activityFeed_createdAt_idx` ON `activityFeed` (`createdAt`);
--> statement-breakpoint
CREATE INDEX `autoModSettings_serverId_idx` ON `autoModSettings` (`serverId`);
--> statement-breakpoint
CREATE INDEX `economy_serverId_userId_idx` ON `economy` (`serverId`,`userId`);
--> statement-breakpoint
CREATE INDEX `economyTransfers_serverId_idx` ON `economyTransfers` (`serverId`);
--> statement-breakpoint
CREATE INDEX `economyTransfers_fromUserId_idx` ON `economyTransfers` (`fromUserId`);
--> statement-breakpoint
CREATE INDEX `economyTransfers_createdAt_idx` ON `economyTransfers` (`createdAt`);
--> statement-breakpoint
CREATE INDEX `leveling_serverId_userId_idx` ON `leveling` (`serverId`,`userId`);
--> statement-breakpoint
CREATE INDEX `leveling_serverId_level_idx` ON `leveling` (`serverId`,`level`);
--> statement-breakpoint
CREATE INDEX `levelingSettings_serverId_idx` ON `levelingSettings` (`serverId`);
--> statement-breakpoint
CREATE INDEX `moderationLogs_serverId_idx` ON `moderationLogs` (`serverId`);
--> statement-breakpoint
CREATE INDEX `moderationLogs_targetUserId_idx` ON `moderationLogs` (`targetUserId`);
--> statement-breakpoint
CREATE INDEX `moderationLogs_createdAt_idx` ON `moderationLogs` (`createdAt`);
--> statement-breakpoint
CREATE INDEX `serverAdmins_serverId_userId_idx` ON `serverAdmins` (`serverId`,`userId`);
--> statement-breakpoint
CREATE INDEX `serverSettings_serverId_idx` ON `serverSettings` (`serverId`);
--> statement-breakpoint
CREATE INDEX `serverStats_serverId_idx` ON `serverStats` (`serverId`);
--> statement-breakpoint
CREATE INDEX `discordServerId_idx` ON `servers` (`discordServerId`);
--> statement-breakpoint
CREATE INDEX `ownerId_idx` ON `servers` (`ownerId`);
--> statement-breakpoint
CREATE INDEX `shopItems_serverId_idx` ON `shopItems` (`serverId`);
--> statement-breakpoint
CREATE INDEX `welcomeSettings_serverId_idx` ON `welcomeSettings` (`serverId`);
