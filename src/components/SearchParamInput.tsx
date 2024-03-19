import { useSearchParams } from "~/hooks/useSearchParams";
import { Input } from "./ui/input";

interface SearchParamInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  pathName: string;
  debounceDelay?: number;
}

export function SearchParamInput({
  pathName,
  debounceDelay,
  ...props
}: SearchParamInputProps) {
  const { updateSearchParams, searchParams } = useSearchParams({
    debounce: debounceDelay,
  });

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateSearchParams({ [pathName]: e.target.value });
  };
  return (
    <Input
      type="text"
      placeholder="Search"
      defaultValue={searchParams.get(pathName) ?? ""}
      onChange={onChange}
      {...props}
    />
  );
}
