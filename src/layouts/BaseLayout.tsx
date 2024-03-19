import { useAtom } from "jotai";
import { HomeIcon } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { userAtom } from "~/atoms/userAtom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface HeadProps {
  title: string;
  description: string;
}

interface BaseLayoutProps {
  children: React.ReactNode;
  head: HeadProps;
}

function AnimateText({ text, speed = 100 }: { text: string; speed?: number }) {
  const [currentText, setCurrentText] = useState("");
  const [cursorHead, setCursorHead] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cursorHead < text.length) {
        setCurrentText(currentText + text[cursorHead]);
        setCursorHead(cursorHead + 1);
      }
    }, speed / text.length);
    return () => {
      clearTimeout(timer);
    };
  }, [currentText, cursorHead, speed, text]);

  return (
    <span className="relative overflow-hidden">
      <span className="duration-100 animate-in fade-in slide-in-from-top-6">
        {currentText}
      </span>
    </span>
  );
}

function NavBar() {
  const [impersonateUser, setImpersonateUser] = useAtom(userAtom);

  const onClick = () => {
    setImpersonateUser(null);
  };

  return (
    <div
      className="group flex w-full items-center justify-center px-2 pt-2"
      data-impersonating={!!impersonateUser}
    >
      <div className="group flex w-fit items-center gap-2 rounded-full border px-2 py-2 transition-all duration-300 group-data-[impersonating=false]:gap-0">
        <Link href="/">
          <span className="flex items-center gap-2 rounded-full px-2 text-sm outline outline-1 outline-border group-data-[impersonating=false]:outline-none">
            <HomeIcon className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-sm">
            <span
              key={`${impersonateUser?.name ?? "no-user"}-name`}
              className="fill-mode-forwards group-data-[impersonating=false]:w-0 group-data-[impersonating=false]:animate-out group-data-[impersonating=false]:zoom-out-0"
            >
              <AnimateText
                text={
                  impersonateUser
                    ? `Hello, ${impersonateUser.name}!`
                    : "Goodbye!"
                }
                speed={500}
              />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onClick}>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function BaseLayout({ children, head }: BaseLayoutProps) {
  return (
    <>
      <Head>
        <title>{head.title}</title>
        <meta name="description" content={head.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex h-full flex-col items-center justify-center p-2">
          {children}
        </div>
      </main>
    </>
  );
}

export default BaseLayout;
