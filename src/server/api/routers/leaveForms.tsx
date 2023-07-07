import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const leaveFormsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date().nullable(),
        type: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.prisma.leaveForm.create({
        data: {
          startDate: input.startDate,
          endDate: input.endDate,
          type: input.type,
          reason: input.reason,
        },
      });

      return form;
    }),
  findWithinTargetDate: publicProcedure.query(async ({ ctx }) => {
    const leaves = await ctx.prisma.leaveForm.findMany({
      where: {
        startDate: {
          lte: "",
        },
      },
    });

    return leaves;
  }),
});
