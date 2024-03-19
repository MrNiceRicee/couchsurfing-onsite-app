import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ImpersonateUser } from "./ImpersonateUser";

interface User {
  id: number;
  name: string;
  biography: string | null;
}

export function UserCard({ user }: { user: User }) {
  if (!user) {
    return null;
  }

  return (
    <Link href={`/users/${user.id}`}>
      <Card>
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <ImpersonateUser
              user={{
                name: user.name ?? "",
                id: user.id,
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <CardDescription>{user.biography}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
