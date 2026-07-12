"use client";

// Prototype-grade auth for the public reporter portal. There is no real
// backend: a single demo account is persisted to localStorage so that
// "Buat Pengaduan" can be gated behind registration/login, and the
// registration data can be reused to prefill the complaint form.

import * as React from "react";

const ACCOUNT_KEY = "bappebti-publik-account";
const SESSION_KEY = "bappebti-publik-authed";

export interface PublikAccount {
  nama: string;
  nomorIdentitas: string;
  email: string;
  hp: string;
  provinsi: string;
  kota: string;
  platformUserId: string;
  password: string;
}

interface PublikAuthContextValue {
  account: PublikAccount | null;
  isAuthenticated: boolean;
  /** True once the localStorage session has been checked on mount. */
  ready: boolean;
  register: (account: PublikAccount) => void;
  login: (identifier: string, password: string) => boolean;
  loginAsDemo: () => void;
  logout: () => void;
}

const PublikAuthContext = React.createContext<PublikAuthContextValue | null>(null);

/** Seeded account used by the "Lanjutkan sebagai Demo" shortcut on the login page, so reviewers don't have to register first. */
const DEMO_ACCOUNT: PublikAccount = {
  nama: "Andra Wicaksono",
  nomorIdentitas: "3175012345670001",
  email: "andra.wicaksono@email.com",
  hp: "081234567890",
  provinsi: "DKI Jakarta",
  kota: "Jakarta Selatan",
  platformUserId: "USR-1029384",
  password: "demo1234",
};

function readAccount(): PublikAccount | null {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as PublikAccount) : null;
  } catch {
    return null;
  }
}

export function PublikAuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<PublikAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Reconcile with localStorage after mount to avoid a hydration mismatch
    // against the statically-exported HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with localStorage on mount
    setAccount(readAccount());
    try {
      setIsAuthenticated(window.localStorage.getItem(SESSION_KEY) === "1");
    } catch {
      // localStorage unavailable (e.g. private mode) — stay logged out.
    }
    setReady(true);
  }, []);

  const register = React.useCallback((next: PublikAccount) => {
    setAccount(next);
    setIsAuthenticated(true);
    try {
      window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      window.localStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore persistence failures in the prototype
    }
  }, []);

  const login = React.useCallback((identifier: string, password: string) => {
    const stored = readAccount();
    const matches =
      !!stored &&
      (stored.email.toLowerCase() === identifier.trim().toLowerCase() || stored.hp === identifier.trim()) &&
      stored.password === password;
    if (!matches) return false;
    setAccount(stored);
    setIsAuthenticated(true);
    try {
      window.localStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore persistence failures in the prototype
    }
    return true;
  }, []);

  const loginAsDemo = React.useCallback(() => {
    register(DEMO_ACCOUNT);
  }, [register]);

  const logout = React.useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore persistence failures in the prototype
    }
  }, []);

  const value = React.useMemo(
    () => ({ account, isAuthenticated, ready, register, login, loginAsDemo, logout }),
    [account, isAuthenticated, ready, register, login, loginAsDemo, logout]
  );

  return <PublikAuthContext.Provider value={value}>{children}</PublikAuthContext.Provider>;
}

export function usePublikAuth(): PublikAuthContextValue {
  const ctx = React.useContext(PublikAuthContext);
  if (!ctx) throw new Error("usePublikAuth must be used within PublikAuthProvider");
  return ctx;
}
