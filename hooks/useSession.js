import { useEffect, useState } from 'react';

const sessionKey = (token) => `session_${token}`;

export function useSession(token, lastClearedAt) {
  const [sessionStartedAt, setSessionStartedAt] = useState(null);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    const key = sessionKey(token);
    const stored = window.sessionStorage.getItem(key);
    if (stored) {
      setSessionStartedAt(stored);
    } else {
      const now = new Date().toISOString();
      window.sessionStorage.setItem(key, now);
      setSessionStartedAt(now);
    }
  }, [token]);

  const expired =
    !!sessionStartedAt &&
    !!lastClearedAt &&
    new Date(lastClearedAt).getTime() > new Date(sessionStartedAt).getTime();

  return { sessionStartedAt, expired };
}
