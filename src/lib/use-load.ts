"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader on mount (and whenever `key` changes) and exposes the
 * result, any error message, and `reload()` for after a mutation.
 * Pass `null` as the key to skip loading until inputs are ready.
 */
export function useLoad<T>(
  loader: () => Promise<T>,
  key: string | null,
): { data: T | null; error: string | null; reload: () => Promise<void> } {
  const [state, setState] = useState<{ key: string | null; data: T | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  });

  const run = useCallback(async () => {
    try {
      const data = await loader();
      setState({ key, data, error: null });
    } catch (error) {
      setState({ key, data: null, error: error instanceof Error ? error.message : "Something went wrong." });
    }
    // The loader is recreated every render; `key` is what identifies the data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch(
        (error) =>
          !cancelled &&
          setState({ key, data: null, error: error instanceof Error ? error.message : "Something went wrong." }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const fresh = state.key === key;
  return { data: fresh ? state.data : null, error: fresh ? state.error : null, reload: run };
}
