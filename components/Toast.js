import { createContext, useContext, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import styled, { keyframes } from 'styled-components';
import { cartCountAtom } from '../store/cartAtom';

const ToastContext = createContext();

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; transform: translateY(10px); }
`;

const Container = styled.div`
  position: fixed;
  bottom: ${(p) => (p.$hasBar ? '80px' : '24px')};
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
  transition: bottom 0.2s ease;
`;

const ToastItem = styled.div`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: ${(p) => (p.$removing ? fadeOut : slideUp)} 0.25s ease forwards;
  background: ${(p) =>
    p.$type === 'success' ? '#2a2a2a' :
    p.$type === 'error' ? '#FF3B30' :
    p.$type === 'delete' ? '#D4726A' :
    p.$type === 'info' ? '#FF9500' :
    p.$type === 'order' ? '#6DBE8B' :
    p.$type === 'staff' ? '#1a1510' :
    p.$type === 'status' ? '#4CAF50' :
    '#1a1510'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: pre-line;
`;

const Icon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
  font-weight: ${(p) => (p.$text ? '700' : '400')};
  font-size: ${(p) => (p.$text ? '20px' : '18px')};
`;

const typeIcons = {
  success: '🛒',
  error: '⚠️',
  delete: '❌',
  info: '🔔',
  order: '✅',
  staff: '🔔',
  status: '📋',
};

export function ToastProvider({ children }) {
  const [cartCount] = useAtom(cartCountAtom);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, removing: false }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toasts.length > 0 && (
        <Container $hasBar={cartCount > 0}>
          {toasts.map((t) => (
            <ToastItem key={t.id} $type={t.type} $removing={t.removing} onClick={() => removeToast(t.id)}>
              <Icon $text={typeof typeIcons[t.type] === 'string' && typeIcons[t.type].length === 1}>{typeIcons[t.type] || '✓'}</Icon>
              {t.message}
            </ToastItem>
          ))}
        </Container>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
