import { useAtomValue } from "jotai";
import { ArrowLeftIcon, CalendarIcon, LoaderIcon } from "lucide-react";
import { useRouter } from "next/router";
import { userAtom } from "~/atoms/userAtom";
import { ImpersonateUser } from "~/components/ImpersonateUser";
import { SearchParamInput } from "~/components/SearchParamInput";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { UserCard } from "~/components/UserCard";
import { useLoaderDelay } from "~/hooks/useLoaderDelay";
import { useSearchParams } from "~/hooks/useSearchParams";
import BaseLayout from "~/layouts/BaseLayout";
import { api } from "~/utils/api";

function InitialName({ name }: { name: string }) {
  const splitName = name.split(" ");

  if (splitName.length === 1) {
    return <span>{splitName.at(0)!}</span>;
  }
  const initials = splitName
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("");

  return <span className="text-sm font-normal">{initials}</span>;
}

const relationshipToCurrentUserMap = {
  friend: "Friend",
  mutual: "Mutual",
  none: "No relationship",
};

function UserDetails({ userId }: { userId: number }) {
  const impersonateUser = useAtomValue(userAtom);
  const { searchParams } = useSearchParams();
  const user = api.users.one.useQuery(
    { id: userId, currentUserId: impersonateUser?.id ?? undefined },
    {
      retry: false,
    },
  );

  const isLoading = useLoaderDelay(user.isLoading, {
    minDuration: 500,
    delay: 200,
  });

  if (isLoading) {
    return <LoaderIcon className="h-6 w-6 animate-spin" />;
  }

  if (!user.data) {
    return <div>User not found</div>;
  }

  return (
    <div className="w-full space-y-4 duration-200 ease-out animate-in fade-in-0 lg:w-1/2">
      <div className="space-y-4 rounded-lg border border-border p-4">
        <header className="flex items-baseline gap-2 font-semibold">
          <Avatar>
            <AvatarFallback>
              <InitialName name={user.data.name ?? ""} />
            </AvatarFallback>
          </Avatar>
          <div className="flex w-full justify-between">
            <h1 className="text-xl">{user.data.name}</h1>
            <ImpersonateUser
              user={{ name: user.data.name ?? "", id: user.data.id }}
            />
          </div>
        </header>
        <section>
          <p>{user.data.biography}</p>
          <div>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarIcon className="inline h-4 w-4" />
              Joined{" "}
              {Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
                new Date(user.data.createdAt),
              )}
            </span>
          </div>
          {user.data.relationshipToCurrentUser !== "none" ? (
            <Badge variant="outline">
              {
                relationshipToCurrentUserMap[
                  user.data.relationshipToCurrentUser
                ]
              }
            </Badge>
          ) : null}
        </section>
      </div>
      <section className="flex w-full flex-col gap-2">
        <h2 className="text-2xl font-bold">Friends</h2>
        <SearchParamInput pathName="search" debounceDelay={0} />
        <ScrollArea
          // tease that there are more users to scroll to (same as the main page)
          className="h-[54dvh]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 2%, black 98%, transparent)",
          }}
        >
          <ul className="flex min-w-28 flex-col gap-4 py-1">
            {user.data.friends
              .filter((friend) =>
                friend.name
                  .toLowerCase()
                  .includes(searchParams.get("search") ?? ""),
              )
              .map((friend) => (
                <li key={`friend-${friend.id}`}>
                  <UserCard user={friend} />
                </li>
              ))}
          </ul>
        </ScrollArea>
      </section>
    </div>
  );
}

function parseStringToNumber(str: string) {
  const res = Number(str);

  return Number.isNaN(res) ? null : res;
}

function Back() {
  const router = useRouter();

  const onClick = () => {
    router.back();
  };

  return (
    <div className="flex w-full items-start lg:w-1/2">
      <Button variant="ghost" size="icon" onClick={onClick}>
        <ArrowLeftIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default function UserPage() {
  const router = useRouter();
  const params = router.query;

  if (!params.id) {
    return (
      <BaseLayout
        head={{
          title: "User not found",
          description: "User not found",
        }}
      >
        <Back />
        <div>User not found</div>
      </BaseLayout>
    );
  }

  const userId = parseStringToNumber(params.id as string);

  if (!userId) {
    return (
      <BaseLayout
        head={{
          title: "User not found",
          description: "User not found",
        }}
      >
        <Back />
        <div>User not found</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      head={{
        title: "User details",
        description: "User details",
      }}
    >
      <Back />
      <UserDetails userId={userId} />
    </BaseLayout>
  );
}
