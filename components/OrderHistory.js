import { useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import api from '../lib/api';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: ${(p) => (p.$open ? 'block' : 'none')};
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px 20px 0 0;
  height: 90vh;
  display: flex;
  flex-direction: column;
  z-index: 201;
  transform: ${(p) => (p.$open ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease;
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  background: #d1cbc3;
  border-radius: 2px;
  margin: 12px auto;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a1510;
  padding: 4px 20px 16px;
  flex-shrink: 0;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #8c8278;
  font-size: 14px;
`;

const OrderItem = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #f0ebe3;
`;

const OrderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const OrderTime = styled.span`
  font-size: 13px;
  color: #8c8278;
`;

const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${(p) => {
    switch (p.$status) {
      case 'pending': return '#FFF3E0';
      case 'accepted': return '#f5edd8';
      case 'preparing': return '#f5edd8';
      case 'ready': return '#E8F5E9';
      case 'served': return '#f5f1eb';
      case 'cancelled': return '#FFF0F0';
      default: return '#f5f1eb';
    }
  }};
  color: ${(p) => {
    switch (p.$status) {
      case 'pending': return '#E65100';
      case 'accepted': return '#9e7535';
      case 'preparing': return '#9e7535';
      case 'ready': return '#2E7D32';
      case 'served': return '#8c8278';
      case 'cancelled': return '#FF3B30';
      default: return '#8c8278';
    }
  }};
`;

const OrderTotal = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #1a1510;
`;

const ItemRow = styled.div`
  font-size: 14px;
  color: #5a5046;
  line-height: 1.6;
`;

const TotalSummary = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 20px 12px;
  padding: 14px 18px;
  background: #f5f1eb;
  border-radius: 12px;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #5a5046;
`;

const TotalAmount = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #1a1510;
`;

const BottomBar = styled.div`
  flex-shrink: 0;
  padding: 12px 20px 24px;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #1a1510;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const statusLabel = {
  pending: '대기중',
  accepted: '접수됨',
  preparing: '준비중',
  ready: '준비완료',
  served: '서빙완료',
  cancelled: '취소됨',
};

function formatTime(iso) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h < 12 ? '오전' : '오후';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period} ${hour}:${m}`;
}

export default function OrderHistory({ open, onClose, tableId, sessionStartedAt }) {
  const { data: orders = [] } = useQuery({
    queryKey: ['table-orders', tableId, sessionStartedAt],
    queryFn: async () => {
      const params = sessionStartedAt ? { after: sessionStartedAt } : {};
      const { data } = await api.get(`/orders/table/${tableId}`, { params });
      return data;
    },
    enabled: !!tableId && open,
    refetchInterval: open ? 10000 : false,
  });

  const grandTotal = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const touchStartY = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartY.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 80) {
      onClose();
    }
    touchStartY.current = null;
  }, [onClose]);

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Sheet $open={open} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <Handle />
        <Title>주문내역</Title>
        {orders.length > 0 && (
          <TotalSummary>
            <TotalLabel>총 주문 금액</TotalLabel>
            <TotalAmount>{grandTotal.toLocaleString()}원</TotalAmount>
          </TotalSummary>
        )}
        <ScrollArea>
          {orders.length === 0 ? (
            <EmptyState>아직 주문내역이 없습니다</EmptyState>
          ) : (
            orders.map((order) => (
              <OrderItem key={order._id}>
                <OrderTop>
                  <OrderTime>{formatTime(order.createdAt)}</OrderTime>
                  <StatusBadge $status={order.status}>
                    {statusLabel[order.status] || order.status}
                  </StatusBadge>
                </OrderTop>
                {order.items.map((item, i) => (
                  <ItemRow key={i}>
                    {item.name} x {item.quantity} — {(item.price * item.quantity).toLocaleString()}원
                  </ItemRow>
                ))}
                <OrderTop style={{ marginTop: 8, marginBottom: 0 }}>
                  <span />
                  <OrderTotal>{order.totalPrice.toLocaleString()}원</OrderTotal>
                </OrderTop>
              </OrderItem>
            ))
          )}
        </ScrollArea>
        {/* <BottomBar>
          <CloseButton onClick={onClose}>닫기</CloseButton>
        </BottomBar> */}
      </Sheet>
    </>
  );
}
