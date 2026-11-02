import { useCallback, useRef, useState } from "react";
import { useToast } from "../viewmodels/ToastContext";

export type AsyncActionOptions = {
  success?: string;
  fallbackError: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAsyncAction() {
  const { notify } = useToast();
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      options: AsyncActionOptions,
    ): Promise<boolean> => {
      if (runningRef.current) return false;
      runningRef.current = true;
      setRunning(true);
      try {
        await action();
        if (options.success) notify(options.success, "success");
        options.onSuccess?.();
        return true;
      } catch (error) {
        const message = errorMessage(error, options.fallbackError);
        if (options.onError) options.onError(message);
        else notify(message, "error");
        return false;
      } finally {
        runningRef.current = false;
        setRunning(false);
      }
    },
    [notify],
  );

  return { running, run };
}
