import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const economyRouter = router({
  getBalance: protectedProcedure
    .input(z.object({ serverId: z.number(), userId: z.string() }))
    .query(async ({ input }) => {
      const data = await db.getEconomyData(input.serverId, input.userId);
      return data || { serverId: input.serverId, userId: input.userId, balance: 0, username: "Unknown" };
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

      // Update stats
      const stats = await db.getServerStats(input.serverId);
      if (stats) {
        await db.updateServerStats(input.serverId, {
          totalTransactions: (stats.totalTransactions || 0) + 1,
        });
      }

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

  claimDailyReward: protectedProcedure
    .input(z.object({ serverId: z.number(), userId: z.string(), username: z.string(), amount: z.number().default(100) }))
    .mutation(async ({ input }) => {
      const economyData = await db.getEconomyData(input.serverId, input.userId);
      const now = new Date();

      if (economyData?.lastDailyReward) {
        const lastReward = new Date(economyData.lastDailyReward);
        const timeDiff = now.getTime() - lastReward.getTime();
        const dayInMs = 24 * 60 * 60 * 1000;

        if (timeDiff < dayInMs) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Daily reward already claimed. Try again tomorrow!",
          });
        }
      }

      const currentBalance = economyData ? Number(economyData.balance) : 0;
      const newBalance = currentBalance + input.amount;

      await db.updateEconomyBalance(input.serverId, input.userId, input.username, newBalance);

      // Add activity
      await db.addActivityFeed({
        serverId: input.serverId,
        type: "economy",
        title: `Daily Reward - ${input.username}`,
        description: `Claimed ${input.amount} currency`,
        userId: input.userId,
        username: input.username,
        metadata: { type: "daily_reward", amount: input.amount },
      });

      return { success: true, newBalance };
    }),
});
