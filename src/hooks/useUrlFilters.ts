import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type UrlFilters<K extends string> = Record<K, string>;

export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const result = {} as UrlFilters<K>;
    for (const key of keys) result[key] = params.get(key) ?? "";
    return result;
  }, [params, keys]);

  const update = useCallback(
    (patch: Partial<UrlFilters<K>>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const key of Object.keys(patch) as K[]) {
            const value = patch[key];
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clear = useCallback(
    () =>
      update(
        Object.fromEntries(keys.map((key) => [key, ""])) as Partial<
          UrlFilters<K>
        >,
      ),
    [keys, update],
  );

  const setter = useCallback(
    (key: K) => (value: string) =>
      update({ [key]: value } as Partial<UrlFilters<K>>),
    [update],
  );

  return { values, update, clear, setter };
}
