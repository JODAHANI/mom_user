import { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import api from '../lib/api';
import { formatPrice } from '../lib/format';

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
  height: 99vh;
  height: 99dvh;
  max-height: calc(100dvh - 4px);
  display: flex;
  flex-direction: column;
  z-index: 201;
  transform: ${(p) => (p.$open ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease;
  overflow: hidden;
  text-align: left;
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  background: #d1cbc3;
  border-radius: 2px;
  margin: 12px auto 8px;
  flex-shrink: 0;
`;

const HeaderArea = styled.div`
  flex-shrink: 0;
  padding: 4px 20px 18px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #8c8278;

  &:active {
    color: #1a1510;
  }
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.7px;
  margin: 0 0 14px;
  line-height: 1.15;
`;

const TotalSummary = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

const TotalDivider = styled.span`
  margin: 0 9px;
  color: #d1cbc3;
  font-weight: 400;
`;


const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  background: #f5f1eb;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #8c8278;
  font-size: 15px;
`;

const OrderItem = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
`;

const OrderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const OrderTime = styled.span`
  font-size: 14px;
  color: #8c8278;
`;

const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 12px;
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

const ItemBlock = styled.div`
  margin-top: 10px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ItemName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1a1510;
  line-height: 1.4;
`;

const ItemQty = styled.span`
  font-weight: 400;
  color: #8c8278;
  margin-left: 4px;
`;

const ItemPrice = styled.div`
  font-size: 13px;
  color: #8c8278;
  margin-top: 2px;
`;

const OrderTotal = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #1a1510;
`;

const statusLabel = {
  pending: '조리대기',
  accepted: '접수됨',
  preparing: '조리시작',
  ready: '조리완료',
  served: '전달완료',
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

export default function OrderHistory({ open, onClose, tableId, sessionStartedAt, before }) {
  const { data: orders = [] } = useQuery({
    queryKey: ['table-orders', tableId, sessionStartedAt, before],
    queryFn: async () => {
      const params = {};
      if (sessionStartedAt) params.after = sessionStartedAt;
      if (before) params.before = before;
      const { data } = await api.get(`/orders/table/${tableId}`, { params });
      return data;
    },
    enabled: !!tableId && open,
  });

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const grandTotal = validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalItemCount = validOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

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
        <HeaderArea>
          <CloseButton onClick={onClose} aria-label="닫기">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </CloseButton>
          <Title>주문 내역</Title>
          {totalItemCount > 0 && (
            <TotalSummary>
              총 {totalItemCount}개<TotalDivider>|</TotalDivider>{formatPrice(grandTotal)}
            </TotalSummary>
          )}
        </HeaderArea>
        <ScrollArea>
          {orders.length === 0 ? (
            <EmptyState>주문내역이 없습니다</EmptyState>
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
                  <ItemBlock key={i}>
                    <ItemName>
                      {item.name}
                      <ItemQty>× {item.quantity}</ItemQty>
                    </ItemName>
                    <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
                  </ItemBlock>
                ))}
                <OrderTop style={{ marginTop: 8, marginBottom: 0 }}>
                  <span />
                  <OrderTotal>{formatPrice(order.totalPrice)}</OrderTotal>
                </OrderTop>
              </OrderItem>
            ))
          )}
        </ScrollArea>
      </Sheet>
    </>
  );
}
