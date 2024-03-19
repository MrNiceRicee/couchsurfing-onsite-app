import { ilike } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import seedDatabase from "~/server/db/seed";

export const usersRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const foundUsers = await ctx.db
        .select()
        .from(users)
        .where(ilike(users.name, `%${input.name}%`))
        .orderBy(users.name);

      return foundUsers ?? [];
    }),
  seed: publicProcedure.mutation(async () => {
    return seedDatabase();
  }),
});
