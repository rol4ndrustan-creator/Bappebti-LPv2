"use client";

// Credential-based login for the internal staff portals (Bappebti,
// Platform, Ekosistem, Admin, Asosiasi). Each of the DEMO_USERS personas
// (excluding the public reporter, who uses the separate publik-auth system)
// gets a username (its DEMO_USERS id) and a shared demo password, so a
// live demo can be driven by actually typing in credentials rather than
// only picking from the "Mode Demonstrasi" dropdown. Logging in also sets
// the active demo persona to match, and the dropdown keeps working
// afterward to hop between personas without re-authenticating.

import * as React from "react";
import { DEMO_USERS } from "./permissions";
import { useDemoSession } from "./demo-session";

const SESSION_KEY = "bappebti-internal-authed";

/** Shared demo password for every internal account — deliberately simple and identical across accounts so it's easy to type live. */
export const INTERNAL_DEMO_PASSWORD = "demo123";

export const INTERNAL_ACCOUNTS = DEMO_USERS.filter((u) => u.role !== "PUBLIC_REPORTER").map((u) => ({
  username: u.id,
  password: INTERNAL_DEMO_PASSWORD,
  name: u.name,
  institution: u.institution,
  portalHref: u.portalHref,
}));

interface InternalAuthContextValue {
  isAuthenticated: boolean;
  /** True once the localStorage session has been checked on mount. */
  ready: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const InternalAuthContext = React.createContext<InternalAuthContextValue | null>(null);

export function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const { setUserId } = useDemoSession();

  React.useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with localStorage on mount, required to avoid SSR/static-export hydration mismatch
      setIsAuthenticated(window.localStorage.getItem(SESSION_KEY) === "1");
    } catch {
      // localStorage unavailable (e.g. private mode) — stay logged out.
    }
    setReady(true);
  }, []);

  const login = React.useCallback(
    (username: string, password: string) => {
      const account = INTERNAL_ACCOUNTS.find(
        (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
      );
      if (!account) return false;
      setUserId(account.username);
      setIsAuthenticated(true);
      try {
        window.localStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore persistence failures in the prototype
      }
      return true;
    },
    [setUserId]
  );

  const logout = React.useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore persistence failures in the prototype
    }
  }, []);

  const value = React.useMemo(
    () => ({ isAuthenticated, ready, login, logout }),
    [isAuthenticated, ready, login, logout]
  );

  return <InternalAuthContext.Provider value={value}>{children}</InternalAuthContext.Provider>;
}

export function useInternalAuth(): InternalAuthContextValue {
  const ctx = React.useContext(InternalAuthContext);
  if (!ctx) throw new Error("useInternalAuth must be used within InternalAuthProvider");
  return ctx;
}
