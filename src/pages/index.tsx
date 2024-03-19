import { LoaderIcon } from "lucide-react";
import { SearchParamInput } from "~/components/SearchParamInput";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { UserCard } from "~/components/UserCard";
import { useSearchParams } from "~/hooks/useSearchParams";

import BaseLayout from "~/layouts/BaseLayout";

import { api } from "~/utils/api";

/*
  ❌ not done
  ✅ done
  ⌛️ not started
  📝 - note

  TODO:
  ✅ The main page list the names of users, which come from an API call to a NextJS API route. 
    - 📝 decided not to use the new App Router from NextJs 13 due to time constraints
  ✅ The data for the users can be seeded from mock data, files, or any other mock. A database is not necessary.
    - 📝 seeded a database & also pulling data from database 
  ✅ The user can click a user to go to a new page which shows that user's detailed profile.
  ✅ The profile information should come from API endpoints that are served from the NextJS app.
    - 📝 Pulling data from tRPC as the api wrapper

  TODO (optional):
  ✅ User should have an attribute that describes its relationship to other users (think friends)
  ✅ The profile page shows a list of their friends. Each friend can be clicked on to take the user to that profile.
    - 📝 just went with a super simple list of friends
*/

function UsersList() {
  const { searchParams } = useSearchParams();
  const users = api.users.search.useQuery(
    {
      name: searchParams.get("search") ?? "",
    },
    {
      // prevents weird ui mid-transition shifting
      placeholderData: (prev) => prev,
    },
  );

  if (!users.data?.length) {
    return (
      <div className="min-h-[54dvh] animate-in fade-in slide-in-from-top-4">
        {users.isLoading && <LoaderIcon className="h-6 w-6 animate-spin" />}
        <p>No users found</p>
      </div>
    );
  }

  return (
    <>
      {users.isLoading && <LoaderIcon className="h-6 w-6 animate-spin" />}
      <ScrollArea
        // tease that this is scrollable
        className="h-[54dvh]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 2%, black 98%, transparent)",
        }}
      >
        <ul className="flex min-w-28 flex-col gap-4 py-1">
          {users.data?.map((user) => {
            return (
              <li key={user.id}>
                <UserCard
                  user={{
                    biography: user.biography ?? "",
                    id: user.id,
                    name: user.name ?? "",
                  }}
                />
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </>
  );
}

function SeedDatabase() {
  const seed = api.users.seed.useMutation();
  const users = api.users.search.useQuery({ name: "" });
  const apiUtil = api.useUtils();

  const onClick = async () => {
    await seed.mutateAsync();
    await apiUtil.invalidate();
  };

  if (users.isLoading) {
    return null;
  }

  if (users.data?.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">Seed Database</h2>
      <div>
        <Button onClick={onClick} disabled={seed.isPending}>
          {seed.isPending ? (
            <div className="flex w-full animate-pulse items-center justify-center">
              Seeding database...
              <LoaderIcon className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="flex w-full items-center justify-center">
              Seed Database
            </div>
          )}
        </Button>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <BaseLayout
      head={{
        title: "Couch Surfing Onsite",
        description: "Couch Surfing technical onsite",
      }}
    >
      <div className="relative overflow-hidden py-2">
        <h1 className="text-5xl font-extrabold tracking-tight duration-500 ease-out animate-in fade-in slide-in-from-bottom sm:text-[5rem]">
          Couch Surfing Onsite
        </h1>
      </div>
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <SearchParamInput pathName="search" />
        <UsersList />
      </div>
      <SeedDatabase />
    </BaseLayout>
  );
}
