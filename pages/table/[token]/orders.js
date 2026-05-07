import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import api from '../../../lib/api';
import { formatPrice } from '../../../lib/format';
import { useSession } from '../../../hooks/useSession';
import { useOrderWebSocket } from '../../../hooks/useWebSocket';
import ExpiredScreen from '../../../components/ExpiredScreen';
import LoadingScreen from '../../../components/LoadingScreen';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f1eb;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
`;

const TopBar = styled.header`
  background: #f5f1eb;
  padding-top: env(safe-area-inset-top, 0px);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TopBarInner = styled.div`
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
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

const PageTitle = styled.h1`
  font-size: 17px;
  font-weight: 700;
  color: #1a1510;
  margin: 0;
  letter-spacing: -0.3px;
`;

const SummaryArea = styled.section`
  background: #f5f1eb;
  padding: 18px 16px 16px;
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

const OrdersList = styled.div`
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
`;

const OrderItem = styled.div`
  background: #FBF8F1;
  border: 1px solid #d8cdb8;
  border-radius: 14px;
  padding: 16px 18px 14px;
  margin-bottom: 12px;
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

const OrderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const OrderTime = styled.span`
  font-size: 15px;
  color: #8c8278;
`;

const StatusBadge = styled.span`
  font-size: 13px;
  font-weight: 600;
  padding: 3px 10px;
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
  margin-top: 12px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ItemName = styled.div`
  font-size: 16px;
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
  font-size: 14px;
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

const EmptyState = styled.div`
  padding: 100px 20px;
  text-align: center;
  color: #8c8278;
  font-size: 17px;
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
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
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

export default function OrdersPage() {
  const router = useRouter();
  const { token } = router.query;

  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ['table', token],
    queryFn: () => api.get(`/tables/token/${token}`).then((res) => res.data),
    enabled: !!token,
  });

  const table = tableData?.data || tableData;
  useOrderWebSocket(table?._id);
  const { sessionStartedAt, sessionClearedAt, expired, expiredClearedAt } = useSession(token, table?.lastClearedAt);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['table-orders', table?._id, table?.lastClearedAt],
    queryFn: async () => {
      const { data } = await api.get(`/orders/table/${table._id}`);
      return data;
    },
    enabled: !!table?._id,
    refetchInterval: 10000,
  });

  const isLoading = tableLoading || ordersLoading;

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const grandTotal = validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalItemCount = validOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    window.sessionStorage.setItem('currentToken', token);
    if (router.asPath !== '/table/orders') {
      router.replace(
        { pathname: '/table/[token]/orders', query: { token } },
        '/table/orders',
        { shallow: true }
      );
    }
  }, [token, router]);

  useEffect(() => {
    if (!expired || !token) return;
    router.replace({ pathname: '/table/[token]', query: { token } }, '/table');
  }, [expired, token, router]);

  if (!token) return <LoadingScreen message="주문내역을 불러오고 있어요" />;

  if (expired) {
    return <ExpiredScreen tableId={table?._id} sessionStartedAt={sessionStartedAt} sessionClearedAt={sessionClearedAt} expiredClearedAt={expiredClearedAt} />;
  }

  return (
    <PageWrapper>
      <TopBar>
        <TopBarInner>
          <BackButton onClick={() => router.back()} aria-label="뒤로">
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
        </TopBarInner>
      </TopBar>

      {totalItemCount > 0 && (
        <SummaryArea>
          <SummaryPill>
            <SummaryCount>총 {totalItemCount}개</SummaryCount>
            <SummaryTotal>{formatPrice(grandTotal)}</SummaryTotal>
          </SummaryPill>
        </SummaryArea>
      )}

      {isLoading ? (
        <LoadingWrap>
          <Dots>
            <Dot $delay="0s" />
            <Dot $delay="0.15s" />
            <Dot $delay="0.3s" />
          </Dots>
        </LoadingWrap>
      ) : orders.length === 0 ? (
        <EmptyState>아직 주문내역이 없습니다</EmptyState>
      ) : (
        <OrdersList>
          {orders.map((order) => (
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
              <TotalDivider />
              <TotalRow>
                <TotalLabel>합계</TotalLabel>
                <OrderTotal>{formatPrice(order.totalPrice)}</OrderTotal>
              </TotalRow>
            </OrderItem>
          ))}
        </OrdersList>
      )}
    </PageWrapper>
  );
}
