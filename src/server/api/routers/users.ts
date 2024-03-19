import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import seedDatabase from "~/server/db/seed";

export const usersRouter = createTRPCRouter({
  seed: publicProcedure.mutation(async () => {
    return seedDatabase();
  }),
});
