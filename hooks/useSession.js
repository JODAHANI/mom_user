import { useEffect, useRef, useState } from 'react';

const sessionKey = (token) => `session_${token}`;
const expiredKey = (token) => `expired_cleared_${token}`;

export function useSession(token, lastClearedAt) {
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [expiredClearedAt, setExpiredClearedAt] = useState(null);
  const [mountTime] = useState(() => Date.now());
  const rotatedRef = useRef(false);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    const sk = sessionKey(token);
    const stored = window.sessionStorage.getItem(sk);
    if (stored) {
      setSessionStartedAt(stored);
    } else {
      const now = new Date().toISOString();
      window.sessionStorage.setItem(sk, now);
      setSessionStartedAt(now);
    }
    const storedExpired = window.sessionStorage.getItem(expiredKey(token));
    if (storedExpired) setExpiredClearedAt(storedExpired);
  }, [token]);

  // 진입 이전(mount 이전)에 결제된 세션이면 → 이전 손님의 잔여 세션. 새 세션으로 회전.
  // 진입 이후에 결제가 발생하면 회전하지 않고 expired 플래그가 ExpiredScreen으로 전환되게 둔다.
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    if (rotatedRef.current) return;
    if (!sessionStartedAt || !lastClearedAt) return;

    const clearTime = new Date(lastClearedAt).getTime();
    const storedTime = new Date(sessionStartedAt).getTime();

    if (clearTime > storedTime && clearTime <= mountTime) {
      rotatedRef.current = true;
      const now = new Date().toISOString();
      window.sessionStorage.setItem(sessionKey(token), now);
      window.sessionStorage.removeItem(expiredKey(token));
      setSessionStartedAt(now);
      setExpiredClearedAt(null);
    }
  }, [token, sessionStartedAt, lastClearedAt, mountTime]);

  const expired =
    !!sessionStartedAt &&
    !!lastClearedAt &&
    new Date(lastClearedAt).getTime() > new Date(sessionStartedAt).getTime();

  // 만료가 처음 감지되는 순간 lastClearedAt을 sessionStorage에 동결.
  // 이후 관리자가 같은 테이블을 다시 결제해도 이전 손님의 조회 상한선은 변하지 않음.
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;
    if (expiredClearedAt) return;
    if (!expired || !lastClearedAt) return;
    window.sessionStorage.setItem(expiredKey(token), lastClearedAt);
    setExpiredClearedAt(lastClearedAt);
  }, [token, expired, lastClearedAt, expiredClearedAt]);

  const effectiveExpiredAt = expiredClearedAt || (expired ? lastClearedAt : null);

  return { sessionStartedAt, expired, expiredClearedAt: effectiveExpiredAt };
}
