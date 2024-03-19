import { eq, ilike, sql } from "drizzle-orm";
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
  one: publicProcedure
    .input(
      z.object({
        id: z.coerce.number(),
        currentUserId: z.coerce.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [foundUser] = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          biography: users.biography,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      if (!foundUser) {
        return null;
      }

      const foundUserFriends = (await ctx.db.execute(
        sql`
          SELECT
            "user"."name" AS "name",
            "user"."biography" AS "biography",
            "user"."created_at" AS "createdAt",
            "user"."updated_at" AS "updatedAt",
            "user"."id" AS "id"
            
          FROM "couchsurfing-onsite-app_friends" "friends"
            LEFT JOIN "couchsurfing-onsite-app_users" "user"
               ON "friends"."friend_id" = "user"."id"
          WHERE "friends"."user_id" = ${input.id}
        `,
      )) as Array<{
        name: string;
        biography: string;
        created_at: Date;
        updated_at: Date;
        id: number;
      }>;

      const isFriends = foundUserFriends.some(
        (friend) => friend.id === input.currentUserId,
      );

      if (isFriends) {
        return {
          ...foundUser,
          friends: foundUserFriends,
          relationshipToCurrentUser: "friend" as const,
        };
      }

      return {
        ...foundUser,
        friends: foundUserFriends,
        relationshipToCurrentUser: "none" as const,
      };
    }),
});
