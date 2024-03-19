import { useEffect, useRef, useState } from "react";

const defaultOptions = {
  minDuration: 250,
  delay: 100,
};

type LoaderDelayOptions = Partial<typeof defaultOptions>;

type LoaderDelayState = "IDLE" | "DELAY" | "DISPLAY" | "EXPIRE";

export function useLoaderDelay(loading: boolean, options?: LoaderDelayOptions) {
  const currentOptions = { ...defaultOptions, ...options };
  const [state, setState] = useState<LoaderDelayState>("IDLE");
  const timeout = useRef<number | NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (loading && state === "IDLE") {
      clearTimeout(timeout.current);

      timeout.current = setTimeout(() => {
        if (!loading) {
          return setState("IDLE");
        }

        timeout.current = setTimeout(() => {
          setState("EXPIRE");
        }, currentOptions.minDuration);

        setState("DISPLAY");
      }, currentOptions.delay);

      setState("DELAY");
    }

    if (!loading && state !== "DISPLAY") {
      clearTimeout(timeout.current);
      setState("IDLE");
    }
  }, [loading, state, currentOptions.delay, currentOptions.minDuration]);

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  return state === "DISPLAY" || state === "EXPIRE";
}
