import { useSetAtom } from "jotai";
import { userAtom } from "~/atoms/userAtom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { api } from "~/utils/api";

type User = {
  id: number;
  name: string;
};

export function ImpersonateUser({ user }: { user: User }) {
  const setImpersonateUser = useSetAtom(userAtom);
  const apiUtil = api.useUtils();

  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setImpersonateUser(user);
    await apiUtil.invalidate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVerticalIcon className="h-6 w-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onClick}>Impersonate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
