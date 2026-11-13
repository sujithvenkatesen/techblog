import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const store = {
  get: () => { try { return localStorage.getItem('bw_token'); } catch { return null; } },
  set: (t) => { try { localStorage.setItem('bw_token', t); } catch { /* noop */ } },
  clear: () => { try { localStorage.removeItem('bw_token'); } catch { /* noop */ } },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!store.get()) { setReady(true); return; }
    adminApi.me().then(setUser).catch(() => store.clear()).finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await adminApi.login(email, password);
    store.set(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => { store.clear(); setUser(null); }, []);

  const can = useCallback((perm) => !!user && (user.role === 'admin' || user.permissions?.includes(perm)), [user]);

  const value = useMemo(() => ({ user, ready, login, logout, can }), [user, ready, login, logout, can]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
