import { useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { userAtom } from "~/atoms/userAtom";
import { SearchParamInput } from "~/components/SearchParamInput";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
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

function SeedOrResetDatabase() {
  const setImpersonateUser = useSetAtom(userAtom);
  const seed = api.users.seed.useMutation();
  const reset = api.users.deleteAll.useMutation();
  const users = api.users.search.useQuery({ name: "" });
  const apiUtil = api.useUtils();

  const onClickSeed = async () => {
    try {
      await seed.mutateAsync();
      await apiUtil.invalidate();
    } catch (e) {
      console.error(e);
    }
  };

  const onClickReset = async () => {
    try {
      await reset.mutateAsync();
      await apiUtil.invalidate();
      setImpersonateUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (users.isLoading) {
    return null;
  }

  if (users.data?.length) {
    return (
      <section className="mt-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold">Start over?</h2>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Reset Database</Button>
            </DialogTrigger>
            <DialogContent>
              <p>Are you sure you want to reset the database?</p>
              <Button onClick={onClickReset} disabled={reset.isPending}>
                {reset.isPending ? (
                  <div className="flex w-full animate-pulse items-center justify-center">
                    Resetting database...
                    <LoaderIcon className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center">
                    Reset Database
                  </div>
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold">Seed Database</h2>
      <div>
        <Button onClick={onClickSeed} disabled={seed.isPending}>
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
        <h1 className="font-cal text-5xl font-extrabold tracking-tight duration-500 ease-out animate-in fade-in slide-in-from-bottom sm:text-[5rem]">
          Couch Surfing Onsite
        </h1>
      </div>
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <SearchParamInput pathName="search" />
        <UsersList />
      </div>
      <SeedOrResetDatabase />
    </BaseLayout>
  );
}
