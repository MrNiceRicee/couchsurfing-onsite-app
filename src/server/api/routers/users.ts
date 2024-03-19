import { gt, ilike, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { friends, users } from "~/server/db/schema";
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
  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    return ctx.db.transaction(async (tx) => {
      await tx.delete(friends).where(gt(friends.id, 0));
      await tx.delete(users).where(gt(users.id, 0));
    });
  }),
  one: publicProcedure
    .input(
      z.object({
        id: z.coerce.number(),
        currentUserId: z.coerce.number().optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // const [foundUser] = await ctx.db
      //   .select({
      //     id: users.id,
      //     name: users.name,
      //     biography: users.biography,
      //     createdAt: users.createdAt,
      //     updatedAt: users.updatedAt,
      //   })
      //   .from(users)
      //   .where(eq(users.id, input.id))
      //   .limit(1);

      // if (!foundUser) {
      //   return null;
      // }

      // const foundUserFriends = (await ctx.db.execute(
      //   sql`
      //     SELECT
      //       "user"."name" AS "name",
      //       "user"."biography" AS "biography",
      //       "user"."created_at" AS "createdAt",
      //       "user"."updated_at" AS "updatedAt",
      //       "user"."id" AS "id"

      //     FROM "couchsurfing-onsite-app_friends" "friends"
      //       LEFT JOIN "couchsurfing-onsite-app_users" "user"
      //          ON "friends"."friend_id" = "user"."id"
      //     WHERE "friends"."user_id" = ${input.id}
      //   `,
      // )) as Array<{
      //   name: string;
      //   biography: string;
      //   created_at: Date;
      //   updated_at: Date;
      //   id: number;
      // }>;

      // const isFriends = foundUserFriends.some(
      //   (friend) => friend.id === input.currentUserId,
      // );

      // if (isFriends) {
      //   return {
      //     ...foundUser,
      //     friends: foundUserFriends,
      //     relationshipToCurrentUser: "friend" as const,
      //   };
      // }

      // if (input.currentUserId && input.id !== input.currentUserId) {
      //   const currentUserFriends = (await ctx.db.execute(
      //     sql`
      //       SELECT
      //         "user"."name" AS "name",
      //         "user"."biography" AS "biography",
      //         "user"."created_at" AS "createdAt",
      //         "user"."updated_at" AS "updatedAt",
      //         "user"."id" AS "id"

      //       FROM "couchsurfing-onsite-app_friends" "friends"
      //         LEFT JOIN "couchsurfing-onsite-app_users" "user"
      //            ON "friends"."friend_id" = "user"."id"
      //       WHERE "friends"."user_id" = ${input.currentUserId}
      //     `,
      //   )) as Array<{
      //     name: string;
      //     biography: string;
      //     createdAt: Date;
      //     updatedAt: Date;
      //     id: number;
      //   }>;

      //   const isMutual = currentUserFriends.some((mutuals) => {
      //     if (mutuals.id === input.id) {
      //       return true;
      //     }
      //     return foundUserFriends.some((friend) => friend.id === mutuals.id);
      //   });

      //   if (isMutual) {
      //     return {
      //       ...foundUser,
      //       friends: foundUserFriends,
      //       relationshipToCurrentUser: "mutual" as const,
      //     };
      //   }
      // }

      // return {
      //   ...foundUser,
      //   friends: foundUserFriends,
      //   relationshipToCurrentUser: "none" as const,
      // };

      const [foundUserQuery] = (await ctx.db.execute(
        sql`
        SELECT
        "user"."id" AS "id",
        "user"."name" AS "name",
        "user"."biography" AS "biography",
        "user"."created_at" AS "createdAt",
        "user"."updated_at" AS "updatedAt",
        COALESCE("user_friends"."friends", '[]'::json) AS "friends",
        CASE
          WHEN "friendship"."friend_id" IS NOT NULL THEN 'friend'
          WHEN "mutual_count"."count" > 0 THEN 'mutual'
          ELSE 'none'
        END AS "relationshipToCurrentUser"
      FROM
        "couchsurfing-onsite-app_users" "user"
        LEFT JOIN LATERAL (
          SELECT
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', "friend"."friend_id",
                'name', "friend"."friend_name",
                'biography', "friend_user"."biography",
                'createdAt', "friend"."created_at",
                'updatedAt', "friend"."updated_at"
              )
            ) AS "friends"
          FROM
            "couchsurfing-onsite-app_friends" "friend"
            JOIN "couchsurfing-onsite-app_users" "friend_user" ON "friend"."friend_id" = "friend_user"."id"
          WHERE
            "friend"."user_id" = "user"."id"
        ) "user_friends" ON TRUE
        
        LEFT JOIN "couchsurfing-onsite-app_friends" "friendship"
          ON "friendship"."user_id" = ${input.currentUserId} AND "friendship"."friend_id" = "user"."id"
        
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS "count"
          FROM "couchsurfing-onsite-app_friends" "mutual"
          WHERE "mutual"."user_id" = "user"."id" AND "mutual"."friend_id" IN (
            SELECT "friend_id"
            FROM "couchsurfing-onsite-app_friends"
            WHERE "user_id" = ${input.currentUserId}
          )
          ${sql`AND "mutual"."user_id" != ${input.currentUserId}`}
        ) "mutual_count" ON TRUE
        WHERE
          "user"."id" = ${input.id};
        `,
      )) as Array<{
        id: number;
        name: string;
        biography: string | null;
        createdAt: Date;
        updatedAt: Date;
        friends: Array<{
          id: number;
          name: string;
          biography: string | null;
          createdAt: Date;
          updatedAt: Date;
        }>;
        relationshipToCurrentUser: "friend" | "mutual" | "none";
      }>;

      if (!foundUserQuery) {
        return null;
      }

      console.log(foundUserQuery);

      return foundUserQuery;
    }),
});
