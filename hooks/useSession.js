import { useEffect, useRef, useState } from 'react';

const sessionKey = (token) => `session_${token}`;
const sessionClearKey = (token) => `session_clear_${token}`;
const expiredKey = (token) => `expired_cleared_${token}`;

export function useSession(token, lastClearedAt) {
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  // 손님 세션의 하한: 스캔 시점에 캡처한 table.lastClearedAt.
  // OrderHistory가 이걸 after로 사용하므로 손님 도착 전 관리자 주문도 같은 세션으로 묶임.
  const [sessionClearedAt, setSessionClearedAt] = useState(null);
  const [expiredClearedAt, setExpiredClearedAt] = useState(null);
  const [mountTime] = useState(() => Date.now());
  const rotatedRef = useRef(false);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    const sk = sessionKey(token);
    let stored = window.sessionStorage.getItem(sk);
    if (!stored) {
      stored = new Date().toISOString();
      window.sessionStorage.setItem(sk, stored);
    }
    setSessionStartedAt(stored);

    const storedClear = window.sessionStorage.getItem(sessionClearKey(token));
    if (storedClear) setSessionClearedAt(storedClear);

    const storedExpired = window.sessionStorage.getItem(expiredKey(token));
    if (storedExpired) setExpiredClearedAt(storedExpired);
  }, [token]);

  // sessionClearedAt 미저장 + lastClearedAt이 sessionStartedAt 이전이면(=정상 진입)
  // 그 lastClearedAt을 손님 세션의 하한으로 캡처.
  // lastClearedAt이 sessionStartedAt 이후면 만료/회전 케이스로 별도 effect가 처리.
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    if (sessionClearedAt) return;
    if (!sessionStartedAt || !lastClearedAt) return;
    if (new Date(lastClearedAt).getTime() > new Date(sessionStartedAt).getTime()) return;
    window.sessionStorage.setItem(sessionClearKey(token), lastClearedAt);
    setSessionClearedAt(lastClearedAt);
  }, [token, sessionStartedAt, lastClearedAt, sessionClearedAt]);

  // 진입 이전(mount 이전)에 결제된 잔여 세션이면 새 세션으로 회전.
  // 단, 이미 만료 스냅샷이 박힌 세션(=ExpiredScreen을 한 번이라도 본 세션)은
  // 새로고침해도 회전하지 않음. 결제 끝난 손님이 refresh로 새 세션을 얻는 우회 방지.
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    if (rotatedRef.current) return;
    if (!sessionStartedAt || !lastClearedAt) return;
    if (window.sessionStorage.getItem(expiredKey(token))) return;

    const clearTime = new Date(lastClearedAt).getTime();
    const storedTime = new Date(sessionStartedAt).getTime();

    if (clearTime > storedTime && clearTime <= mountTime) {
      rotatedRef.current = true;
      const now = new Date().toISOString();
      window.sessionStorage.setItem(sessionKey(token), now);
      window.sessionStorage.setItem(sessionClearKey(token), lastClearedAt);
      setSessionStartedAt(now);
      setSessionClearedAt(lastClearedAt);
    }
  }, [token, sessionStartedAt, lastClearedAt, mountTime]);

  const expired =
    !!sessionStartedAt &&
    !!lastClearedAt &&
    new Date(lastClearedAt).getTime() > new Date(sessionStartedAt).getTime();

  // 만료가 처음 감지되는 순간 lastClearedAt을 동결 (= 세션의 상한).
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;
    if (expiredClearedAt) return;
    if (!expired || !lastClearedAt) return;
    window.sessionStorage.setItem(expiredKey(token), lastClearedAt);
    setExpiredClearedAt(lastClearedAt);
  }, [token, expired, lastClearedAt, expiredClearedAt]);

  const effectiveExpiredAt = expiredClearedAt || (expired ? lastClearedAt : null);

  return {
    sessionStartedAt,
    sessionClearedAt,
    expired,
    expiredClearedAt: effectiveExpiredAt,
  };
}
