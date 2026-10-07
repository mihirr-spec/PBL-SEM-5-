"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { authenticate } from "@/lib/data/repository";
import type { Role, User } from "@/lib/types";

/**
 * Client-side session.
 *
 * V1 persists the signed-in user in localStorage, read through
 * `useSyncExternalStore` so the value is picked up during hydration rather
 * than written in after the first paint. When a real backend lands, only the
 * store below changes — consumers keep using `useSession()`.
 */

const STORAGE_KEY = "pbl.session.v1";

/** Landing route per role. Supervisors share the teacher portal for now. */
export const HOME_BY_ROLE: Record<Role, string> = {
  student: "/student/dashboard",
  faculty: "/faculty/dashboard",
  supervisor: "/faculty/dashboard",
  admin: "/admin/dashboard",
};

/* ------------------------- localStorage store ------------------------- */

const listeners = new Set<() => void>();

/**
 * `getSnapshot` must return a referentially stable value between changes,
 * so the parsed user is cached and only re-parsed when the raw string moves.
 */
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

function readUser(): User | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private browsing) — behave as signed out.
  }

  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as User) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function writeUser(user: User | null) {
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Session simply won't survive a reload.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs of the same session in step.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/* ------------------------------ context ------------------------------- */

interface SessionContextValue {
  user: User | null;
  /** False until hydration has read the stored session — prevents a login flash. */
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    roles?: Role[],
  ) => Promise<{ ok: true; user: User } | { ok: false; error: string }>;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const user = useSyncExternalStore(subscribe, readUser, () => null);
  // On the server and during the first hydration pass this is false, which is
  // exactly the window in which `user` cannot yet be trusted.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const signIn = useCallback<SessionContextValue["signIn"]>(
    async (email, password, roles) => {
      const result = await authenticate({ email, password, roles });
      if (!result.ok) return result;
      writeUser(result.user);
      return { ok: true, user: result.user };
    },
    [],
  );

  const signOut = useCallback(() => {
    writeUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading: !hydrated, signIn, signOut }),
    [user, hydrated, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside a <SessionProvider>.");
  }
  return context;
}
