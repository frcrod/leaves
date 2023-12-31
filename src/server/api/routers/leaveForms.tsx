import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import BusinessTime from "dayjs-business-time";
import { type LeaveForm, type PrismaClient } from "@prisma/client";

const currentDate = new Date();
currentDate.setDate(0);
dayjs.extend(BusinessTime);
dayjs.extend(isBetween);

const fetchLeavesWithinDateRange = async (
  startDate: Date,
  endDate: Date,
  prisma: PrismaClient
): Promise<LeaveForm[]> => {
  const leaves = await prisma?.leaveForm?.findMany({});
  const filteredLeaves = leaves?.filter((leave: LeaveForm) => {
    const start = dayjs(leave.startDate);
    const end = dayjs(leave.endDate);

    return (
      start.isBetween(startDate, endDate, "month", "[]") ||
      end.isBetween(startDate, endDate, "month", "[]")
    );
  });

  return filteredLeaves;
};

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
      const startDateRange = dayjs(input.startDate);

      if (startDateRange.isBefore(currentDate, "D"))
        return { error: { date: "Invalid Start Date, must be after" } };

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

  getAllLeaveForms: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.leaveForm.findMany({});
  }),

  findWithinTargetDate: publicProcedure
    .input(
      z.object({
        startDate: z.date().default(new Date(currentDate.getFullYear(), 0)),
        endDate: z
          .date()
          .default(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)
          ),
      })
    )
    .query(async ({ ctx, input }) => {
      const filteredLeaveForms = await fetchLeavesWithinDateRange(
        input.startDate,
        input.endDate,
        ctx.prisma
      );

      return filteredLeaveForms;
    }),

  generateProRated: publicProcedure
    .input(
      z.object({
        startDate: z.date().default(new Date(currentDate.getFullYear(), 0, 1)),
        endDate: z
          .date()
          .default(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)
          ),
      })
    )
    .query(async ({ ctx, input }) => {
      const filteredLeaveForms = await fetchLeavesWithinDateRange(
        input.startDate,
        input.endDate,
        ctx.prisma
      );

      const startDateRange = dayjs(input.startDate);
      const endDateRange = dayjs(input.endDate);

      const accumulated = filteredLeaveForms?.reduce((acc, curr) => {
        const isWholeDay = curr.type == "whole";
        const start = dayjs(curr.startDate);
        const end = dayjs(curr.endDate);

        const cost = isWholeDay ? 1 : 0.5;
        if (curr.endDate === null) {
          acc += cost;
        } else if (
          start.isBetween(startDateRange, endDateRange, "month", "[]") &&
          !end.isBetween(startDateRange, endDateRange, "month", "[]")
        ) {
          acc +=
            Math.min(
              Math.abs(start.businessDaysDiff(startDateRange)),
              Math.abs(start.businessDaysDiff(endDateRange))
            ) * cost;
        } else if (
          !start.isBetween(startDateRange, endDateRange, "month", "[]") &&
          end.isBetween(startDateRange, endDateRange, "month", "[]")
        ) {
          acc +=
            Math.min(
              Math.abs(end.businessDaysDiff(startDateRange)),
              Math.abs(end.businessDaysDiff(endDateRange))
            ) * cost;
        } else {
          const businessDiff = Math.abs(start.businessDaysDiff(end));
          acc += isWholeDay ? businessDiff : businessDiff / 2;
        }

        return acc;
      }, 0);

      const rangeMonthDiff =
        Math.abs(startDateRange.diff(endDateRange, "M")) + 1;
      const proRatedInDateRange = rangeMonthDiff * 2;

      return {
        accumulated,
        proRatedInDateRange,
        startMonth: startDateRange.format("MMMM"),
        endMonth: endDateRange.format("MMMM"),
      };
    }),
});
