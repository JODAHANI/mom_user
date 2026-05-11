import { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import api from '../lib/api';
import { formatPrice, formatItemName } from '../lib/format';

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

const TopBar = styled.div`
  flex-shrink: 0;
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f1eb;
`;

const BackButton = styled.button`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #1a1510;

  &:active {
    color: #8c8278;
  }
`;

const PageTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #1a1510;
  margin: 0;
  letter-spacing: -0.3px;
`;

const SummaryArea = styled.div`
  flex-shrink: 0;
  padding: 18px 16px 16px;
  background: #f5f1eb;
`;

const SummaryPill = styled.div`
  background: #FBF8F1;
  border: 1px solid #d8cdb8;
  border-radius: 16px;
  padding: 26px 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SummaryCount = styled.span`
  font-size: 17px;
  color: #8c8278;
  font-weight: 500;
`;

const SummaryTotal = styled.span`
  font-size: 26px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.4px;
  font-variant-numeric: tabular-nums;
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

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-12px);
    opacity: 1;
  }
`;

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c3904a;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const OrderItem = styled.div`
  background: #FBF8F1;
  border: 1px solid #d8cdb8;
  border-radius: 14px;
  padding: 16px 18px 14px;
  margin-bottom: 12px;
`;

const OrderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const TotalDivider = styled.div`
  height: 1px;
  background: #f0e8d6;
  margin: 12px 0 10px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  color: #8c8278;
  font-weight: 500;
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
  font-size: 18px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
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

export default function OrderHistory({ open, onClose, tableId, sessionClearedAt, before }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['table-orders', tableId, sessionClearedAt, before],
    queryFn: async () => {
      const params = {};
      if (sessionClearedAt) {
        params.after = sessionClearedAt;
      } else if (before) {
        // 한 번도 결제된 적 없는 테이블의 첫 세션 — 서버가 lastClearedAt(=expiredClearedAt)
        // 폴백으로 빈 범위가 나오는 걸 방지하려고 멀리 과거를 보냄.
        params.after = '1970-01-01T00:00:00.000Z';
      }
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
        <TopBar>
          <BackButton onClick={onClose} aria-label="뒤로">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </BackButton>
          <PageTitle>주문 내역</PageTitle>
        </TopBar>
        {totalItemCount > 0 && (
          <SummaryArea>
            <SummaryPill>
              <SummaryCount>총 {totalItemCount}개</SummaryCount>
              <SummaryTotal>{formatPrice(grandTotal)}</SummaryTotal>
            </SummaryPill>
          </SummaryArea>
        )}
        <ScrollArea>
          {isLoading ? (
            <LoadingWrap>
              <Dots>
                <Dot $delay="0s" />
                <Dot $delay="0.15s" />
                <Dot $delay="0.3s" />
              </Dots>
            </LoadingWrap>
          ) : orders.length === 0 ? (
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
                      {formatItemName(item)}
                      <ItemQty>× {item.quantity}</ItemQty>
                    </ItemName>
                    <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
                  </ItemBlock>
                ))}
                <TotalDivider />
                <TotalRow>
                  <TotalLabel>합계</TotalLabel>
                  <OrderTotal>{formatPrice(order.totalPrice)}</OrderTotal>
                </TotalRow>
              </OrderItem>
            ))
          )}
        </ScrollArea>
      </Sheet>
    </>
  );
}
