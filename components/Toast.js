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
  max-width: 400px;
  width: calc(100% - 32px);
  transition: bottom 0.2s ease;
`;

const ToastItem = styled.div`
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  animation: ${(p) => (p.$removing ? fadeOut : slideUp)} 0.25s ease forwards;
  background: ${(p) =>
    p.$type === 'success' ? '#1B1D1F' :
    p.$type === 'error' ? '#FF3B30' :
    p.$type === 'info' ? '#FF9500' :
    p.$type === 'order' ? '#3182F6' :
    p.$type === 'staff' ? '#1B1D1F' :
    p.$type === 'status' ? '#4CAF50' :
    '#1B1D1F'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
`;

const typeIcons = {
  success: '🛒',
  error: '⚠️',
  info: '↩️',
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
              <Icon>{typeIcons[t.type] || '✓'}</Icon>
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
