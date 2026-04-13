import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import wsManager from '../lib/websocket';
import { useToast } from '../components/Toast';

const statusLabel = {
  pending: '대기중',
  preparing: '준비중',
  ready: '준비완료',
  served: '서빙완료',
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
    });

    return () => {
      remove();
    };
  }, [tableId, queryClient, showToast]);
}
