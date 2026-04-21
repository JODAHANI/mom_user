import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import wsManager from '../lib/websocket';
import { useToast } from '../components/Toast';

const statusLabel = {
  pending: '조리대기',
  preparing: '조리시작',
  ready: '조리완료',
  served: '전달완료',
  cancelled: '취소됨',
};

const statusToastType = {
  preparing: 'status',
  ready: 'status',
  served: 'status',
  cancelled: 'error',
};

export function useOrderWebSocket(tableId) {
  const queryClient = useQueryClient();
  const showToast = useToast();

  useEffect(() => {
    if (!wsManager || !tableId) return;

    wsManager.connect();

    const remove = wsManager.addListener((data) => {
      if (data.type === 'NEW_ORDER') {
        const order = data.data;
        if (String(order?.tableId) === String(tableId)) {
          queryClient.invalidateQueries({ queryKey: ['table-orders'] });
        }
      }
      if (data.type === 'ORDER_STATUS') {
        const order = data.data;
        if (order.tableId === tableId) {
          const label = statusLabel[order.status];
          const toastType = statusToastType[order.status] || 'success';
          if (label) {
            showToast(`주문이 ${label} 상태로 변경되었습니다`, toastType);
          }
          queryClient.invalidateQueries({ queryKey: ['table-orders'] });
        }
      }
      if (data.type === 'TABLE_CLEARED') {
        if (data.data?.tableId === String(tableId)) {
          queryClient.invalidateQueries({ queryKey: ['table'] });
        }
      }
    });

    return () => {
      remove();
    };
  }, [tableId, queryClient, showToast]);
}
