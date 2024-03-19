// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
  unique,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `couchsurfing-onsite-app_${name}`,
);

export const users = createTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    biography: text("biography"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (usersTable) => ({
    nameIndex: index("name_idx").on(usersTable.name),
  }),
);

export const friends = createTable(
  "friends",
  {
    id: serial("id").primaryKey(),
    userId: serial("user_id").notNull(),
    userName: varchar("user_name", { length: 256 }),
    friendId: serial("friend_id").notNull(),
    friendName: varchar("friend_name", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (friendsTable) => ({
    userIdIndex: index("user_id_idx").on(friendsTable.userId),
    friendIdIndex: index("friend_id_idx").on(friendsTable.friendId),
    userIdFriendsIdUnique: unique("user_id_friends_id_unique").on(
      friendsTable.userId,
      friendsTable.friendId,
    ),
  }),
);

export const userRelations = relations(users, ({ many }) => {
  return {
    friends: many(friends, {
      relationName: "user-friends",
    }),
  };
});

export const friendRelations = relations(friends, ({ one, many }) => {
  return {
    user: one(users, {
      fields: [friends.userId],
      references: [users.id],
      relationName: "friends-table-is-user"
    }),
    friend: one(users, {
      fields: [friends.friendId],
      references: [users.id],
      relationName: "friends-table-is-friend"
    }),
  };
});
