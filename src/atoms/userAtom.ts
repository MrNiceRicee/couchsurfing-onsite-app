import { atom } from "jotai";

export const userAtom = atom<{
  name: string;
  id: number;
} | null>(null);
