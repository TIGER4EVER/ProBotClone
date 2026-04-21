import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Server management procedures
  servers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.discordId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Discord ID not found",
        });
      }
      return db.getServersByUserId(ctx.user.discordId);
    }),

    get: protectedProcedure.input(z.object({ serverId: z.number() })).query(async ({ input }) => {
      const server = await db.getServerById(input.serverId);
      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }
      return server;
    }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          prefix: z.string().max(10).optional(),
          welcomeChannelId: z.string().optional(),
          logChannelId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this server",
          });
        }

        // Update server basic settings
        if (input.prefix || input.welcomeChannelId || input.logChannelId) {
          // In a real implementation, would update the servers table
          // For now, this is a placeholder
        }

        return { success: true };
      }),

    getSettings: protectedProcedure
      .input(z.object({ serverId: z.number() }))
      .query(async ({ input }) => {
        return db.getServerSettings(input.serverId);
      }),

    updateFeatures: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          moderationEnabled: z.boolean().optional(),
          economyEnabled: z.boolean().optional(),
          levelingEnabled: z.boolean().optional(),
          autoModEnabled: z.boolean().optional(),
          welcomeEnabled: z.boolean().optional(),
          antiSpamEnabled: z.boolean().optional(),
          antiLinkEnabled: z.boolean().optional(),
          antiBadWordsEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this server",
          });
        }

        const { serverId, ...settings } = input;
        await db.updateServerSettings(serverId, settings);
        return { success: true };
      }),
  }),

  // Moderation procedures
  moderation: router({
    getLogs: protectedProcedure
      .input(z.object({ serverId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getModerationLogs(input.serverId, input.limit);
      }),

    addAction: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          action: z.enum(["ban", "kick", "mute", "warn", "clear"]),
          targetUserId: z.string(),
          targetUsername: z.string(),
          reason: z.string().optional(),
          duration: z.number().optional(),
          messageCount: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to perform moderation on this server",
          });
        }

        await db.addModerationLog({
          serverId: input.serverId,
          action: input.action,
          targetUserId: input.targetUserId,
          targetUsername: input.targetUsername,
          moderatorId: ctx.user.discordId || "",
          moderatorUsername: ctx.user.name || "Unknown",
          reason: input.reason,
          duration: input.duration,
          messageCount: input.messageCount,
        });

        // Update stats
        const stats = await db.getServerStats(input.serverId);
        if (stats) {
          await db.updateServerStats(input.serverId, {
            totalModerated: (stats.totalModerated || 0) + 1,
          });
        }

        // Add to activity feed
        await db.addActivityFeed({
          serverId: input.serverId,
          type: "moderation",
          title: `${input.action.toUpperCase()} - ${input.targetUsername}`,
          description: input.reason,
          userId: ctx.user.discordId,
          username: ctx.user.name,
          metadata: { action: input.action, targetUserId: input.targetUserId },
        });

        return { success: true };
      }),
  }),

  // Economy procedures
  economy: router({
    getBalance: protectedProcedure
      .input(z.object({ serverId: z.number(), userId: z.string() }))
      .query(async ({ input }) => {
        const data = await db.getEconomyData(input.serverId, input.userId);
        return data || { serverId: input.serverId, userId: input.userId, balance: 0 };
      }),

    getLeaderboard: protectedProcedure
      .input(z.object({ serverId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getEconomyLeaderboard(input.serverId, input.limit);
      }),

    transfer: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          fromUserId: z.string(),
          toUserId: z.string(),
          amount: z.number().positive(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const fromData = await db.getEconomyData(input.serverId, input.fromUserId);
        if (!fromData || Number(fromData.balance) < input.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient balance",
          });
        }

        await db.updateEconomyBalance(
          input.serverId,
          input.fromUserId,
          fromData.username,
          Number(fromData.balance) - input.amount
        );

        const toData = await db.getEconomyData(input.serverId, input.toUserId);
        const toBalance = toData ? Number(toData.balance) : 0;
        await db.updateEconomyBalance(
          input.serverId,
          input.toUserId,
          toData?.username || "Unknown",
          toBalance + input.amount
        );

        await db.addEconomyTransfer({
          serverId: input.serverId,
          fromUserId: input.fromUserId,
          toUserId: input.toUserId,
          amount: input.amount as any,
          reason: input.reason,
        });

        return { success: true };
      }),

    getTransfers: protectedProcedure
      .input(z.object({ serverId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getEconomyTransfers(input.serverId, input.limit);
      }),

    getShopItems: protectedProcedure
      .input(z.object({ serverId: z.number() }))
      .query(async ({ input }) => {
        return db.getShopItems(input.serverId);
      }),

    addShopItem: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.number().positive(),
          emoji: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to manage this server",
          });
        }

        await db.addShopItem({
          serverId: input.serverId,
          name: input.name,
          description: input.description,
          price: input.price as any,
          emoji: input.emoji,
        });

        return { success: true };
      }),
  }),

  // Leveling procedures
  leveling: router({
    getLeaderboard: protectedProcedure
      .input(z.object({ serverId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getLevelingLeaderboard(input.serverId, input.limit);
      }),

    getUserData: protectedProcedure
      .input(z.object({ serverId: z.number(), userId: z.string() }))
      .query(async ({ input }) => {
        const data = await db.getLevelingData(input.serverId, input.userId);
        return data || { serverId: input.serverId, userId: input.userId, xp: 0, level: 1 };
      }),

    getSettings: protectedProcedure
      .input(z.object({ serverId: z.number() }))
      .query(async ({ input }) => {
        return db.getLevelingSettings(input.serverId);
      }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          levelUpMessage: z.string().optional(),
          levelUpChannelId: z.string().optional(),
          xpMultiplier: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this server",
          });
        }

        const { serverId, ...settings } = input;
        await db.updateLevelingSettings(serverId, {
          ...settings,
          xpMultiplier: settings.xpMultiplier as any,
        });
        return { success: true };
      }),
  }),

  // Welcome/Leave message procedures
  welcome: router({
    getSettings: protectedProcedure
      .input(z.object({ serverId: z.number() }))
      .query(async ({ input }) => {
        return db.getWelcomeSettings(input.serverId);
      }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          welcomeMessage: z.string().optional(),
          leaveMessage: z.string().optional(),
          backgroundImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this server",
          });
        }

        const { serverId, ...settings } = input;
        await db.updateWelcomeSettings(serverId, settings);
        return { success: true };
      }),
  }),

  // Auto-moderation procedures
  automod: router({
    getSettings: protectedProcedure
      .input(z.object({ serverId: z.number() }))
      .query(async ({ input }) => {
        return db.getAutoModSettings(input.serverId);
      }),

    updateSettings: protectedProcedure
      .input(
        z.object({
          serverId: z.number(),
          spamThreshold: z.number().optional(),
          spamTimeWindow: z.number().optional(),
          spamAction: z.enum(["warn", "mute", "kick"]).optional(),
          linkBlacklist: z.array(z.string()).optional(),
          badWords: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServerById(input.serverId);
        if (!server || server.ownerId !== ctx.user.discordId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this server",
          });
        }

        const { serverId, linkBlacklist, badWords, ...settings } = input;
        await db.updateAutoModSettings(serverId, {
          ...settings,
          linkBlacklist: linkBlacklist as any,
          badWords: badWords as any,
        });
        return { success: true };
      }),
  }),

  // Activity feed and statistics
  activity: router({
    getFeed: protectedProcedure
      .input(z.object({ serverId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getActivityFeed(input.serverId, input.limit);
      }),

    getStats: protectedProcedure
      .input(z.object({ serverId: z.number() }))
      .query(async ({ input }) => {
        return db.getServerStats(input.serverId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
