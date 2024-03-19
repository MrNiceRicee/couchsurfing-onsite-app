import { db } from "~/server/db";
import { users as dbUser, friends as dbFriend } from "~/server/db/schema";

// https://www.ssa.gov/OACT/babynames/decades/century.html
const commonMaleNames = [
  "James",
  "Robert",
  "John",
  "Michael",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Christopher",
  "Charles",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Donald",
  "Steven",
  "Andrew",
  "Paul",
  "Joshua",
];

const commonFemaleNames = [
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Lisa",
  "Nancy",
  "Betty",
  "Sandra",
  "Margaret",
  "Ashley",
  "Kimberly",
  "Emily",
  "Donna",
  "Michelle",
];

// https://www.thoughtco.com/most-common-us-surnames-1422656
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
];

function generateLastName() {
  const isFirstNameAsLastName = Math.random() > 0.5;
  if (isFirstNameAsLastName) {
    return generateRandomFirstName();
  }
  return lastNames.at(Math.floor(Math.random() * lastNames.length))!;
}

function generateRandomFirstName(): string {
  const isMale = Math.random() > 0.5;
  if (isMale) {
    return commonMaleNames.at(
      Math.floor(Math.random() * commonMaleNames.length),
    )!;
  }
  return commonFemaleNames.at(
    Math.floor(Math.random() * commonFemaleNames.length),
  )!;
}

function generateRandomName() {
  return `${generateRandomFirstName()} ${generateLastName()}`;
}

// https://skillscouter.com/popular-common-hobbies/
const activities = [
  "reading",
  "martial arts",
  "jewelry making",
  "woodworking",
  "gardening",
  "video games",
  "fishing",
  "team sports",
  "walking",
  "yoga",
  "traveling",
  "golf",
  "watching sports",
  "playing cards",
  "board games",
  "eating out",
  "writing",
  "running",
  "tennis",
  "volunteer work",
  "dancing",
  "painting",
  "cooking",
  "bicycling",
  "housework",
];

const likenessLevel = ["kinda like", "like", "really like", "love"];

const disLikenessLevel = ["kinda dislike", "dislike", "really dislike", "hate"];

function generateRandomBiography() {
  const likedActivity = activities.at(
    Math.floor(Math.random() * activities.length),
  )!;
  const dislikedActivity = activities.at(
    Math.floor(Math.random() * activities.length),
  )!;

  if (likedActivity === dislikedActivity) {
    return `I have a weird relationship with ${likedActivity}.`;
  }

  const levelOfLike = likenessLevel.at(
    Math.floor(Math.random() * likenessLevel.length),
  )!;

  const levelOfDislike = disLikenessLevel.at(
    Math.floor(Math.random() * disLikenessLevel.length),
  )!;

  return `I ${levelOfLike} ${likedActivity} and ${levelOfDislike} ${dislikedActivity}.`;
}

async function seedUsers(amount: number) {
  return db
    .insert(dbUser)
    .values(
      Array.from({ length: amount }, () => ({
        name: generateRandomName(),
        biography: generateRandomBiography(),
      })),
    )
    .returning();
}

async function addFriendsToUsers({
  numberOfFriends,
}: {
  numberOfFriends: number;
}) {
  const foundUsers = await db
    .select({
      id: dbUser.id,
      name: dbUser.name,
    })
    .from(dbUser);
  for (let i = 0; i < foundUsers.length; i++) {
    const user = foundUsers.at(i)!;
    await db.transaction(async (tx) => {
      const potentialFriends = foundUsers.filter(
        (friend) => friend.id !== user.id,
      );

      const valuesToInsert: Array<{
        userId: number;
        userName: string;
        friendId: number;
        friendName: string;
      }> = [];
      for (let j = 0; j < numberOfFriends; j++) {
        const friend = potentialFriends.at(
          Math.floor(Math.random() * potentialFriends.length),
        )!;
        if (!friend) {
          continue;
        }

        valuesToInsert.push({
          userId: user.id,
          userName: user.name,
          friendId: friend.id,
          friendName: friend.name,
        });
        valuesToInsert.push({
          userId: friend.id,
          userName: friend.name,
          friendId: user.id,
          friendName: user.name,
        });
      }
      await tx.insert(dbFriend).values(valuesToInsert).onConflictDoNothing();
    });
  }
}

export async function seedDatabase() {
  console.log("seeding database");
  await seedUsers(100);
  console.log("added users");
  console.log("adding friends");
  await addFriendsToUsers({ numberOfFriends: 10 });
  console.log("added friends");
  console.log("done seeding database");
  return Promise.resolve();
}

export default seedDatabase;
