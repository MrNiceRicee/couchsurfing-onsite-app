import {
  useSearchParams as useNextSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function useSearchParams({
  debounce = 200,
}: { debounce?: number } = {}) {
  const searchParams = useNextSearchParams();
  const pathName = usePathname();
  const router = useRouter();

  const updateSearchParams = useDebouncedCallback(
    async (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        const isArray = Array.isArray(value);
        if (!value || (isArray && !value.length)) {
          // drizzle linter is too aggressive here
          // eslint-disable-next-line drizzle/enforce-delete-with-where
          newSearchParams.delete(key);
          return;
        }
        if (isArray) {
          value.forEach((val, index) => {
            if (index === 0) {
              newSearchParams.set(key, String(val));
            } else {
              newSearchParams.append(key, String(val));
            }
          });
          return;
        }
        newSearchParams.set(key, String(value));
      });

      router.replace(
        `${pathName}${
          newSearchParams.size ? `?${newSearchParams.toString()}` : ""
        }`,
      );
    },
    debounce,
  );

  return {
    searchParams,
    updateSearchParams,
  };
}
