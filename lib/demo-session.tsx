"use client";

import * as React from "react";
import { DEFAULT_DEMO_USER_ID, DEMO_USERS, DemoUser } from "./permissions";

const STORAGE_KEY = "bappebti-demo-role";

interface DemoSessionContextValue {
  user: DemoUser;
  setUserId: (id: string) => void;
}

const DemoSessionContext = React.createContext<DemoSessionContextValue | null>(null);

function findUser(id: string | null): DemoUser {
  return DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
}

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = React.useState<string>(DEFAULT_DEMO_USER_ID);

  React.useEffect(() => {
    // Reconcile with localStorage after mount (not during render) to avoid a
    // hydration mismatch against the statically-exported HTML, which always
    // renders the default demo user.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with localStorage on mount, required to avoid SSR/static-export hydration mismatch
      if (stored) setUserIdState(stored);
    } catch {
      // localStorage unavailable (e.g. private mode) — fall back to default demo user.
    }
  }, []);

  const setUserId = React.useCallback((id: string) => {
    setUserIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore persistence failures in the prototype
    }
  }, []);

  const value = React.useMemo(
    () => ({ user: findUser(userId), setUserId }),
    [userId, setUserId]
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionContextValue {
  const ctx = React.useContext(DemoSessionContext);
  if (!ctx) throw new Error("useDemoSession must be used within DemoSessionProvider");
  return ctx;
}
