import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import api from '../../../lib/api';
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
  background: #fff;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) 8px 8px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  font-size: 24px;
  padding: 8px 12px;
  color: #1a1510;
  background: none;
  border: none;
  line-height: 1;
`;

const PageHeader = styled.section`
  background: #fff;
  padding: 4px 22px 24px;
`;

const PageTitle = styled.h1`
  font-size: 30px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.8px;
  margin: 0 0 28px;
  line-height: 1.15;
`;

const Notice = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #c2453a;
  margin: 0 0 22px;
  letter-spacing: -0.2px;
`;

const TotalSummary = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.6px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

const TotalDivider = styled.span`
  margin: 0 10px;
  color: #d1cbc3;
  font-weight: 400;
`;

const SectionGap = styled.div`
  height: 8px;
  background: #f5f1eb;
`;

const OrdersList = styled.div`
  padding: 16px;
`;

const OrderItem = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 12px;
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
  font-size: 17px;
  font-weight: 700;
  color: #1a1510;
`;

const EmptyState = styled.div`
  padding: 100px 20px;
  text-align: center;
  color: #8c8278;
  font-size: 17px;
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

  const { data: tableData } = useQuery({
    queryKey: ['table', token],
    queryFn: () => api.get(`/tables/token/${token}`).then((res) => res.data),
    enabled: !!token,
  });

  const table = tableData?.data || tableData;
  useOrderWebSocket(table?._id);
  const { sessionStartedAt, expired } = useSession(token, table?.lastClearedAt);

  const { data: orders = [] } = useQuery({
    queryKey: ['table-orders', table?._id, sessionStartedAt],
    queryFn: async () => {
      const params = sessionStartedAt ? { after: sessionStartedAt } : {};
      const { data } = await api.get(`/orders/table/${table._id}`, { params });
      return data;
    },
    enabled: !!table?._id,
    refetchInterval: 10000,
  });

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

  if (!token) return <LoadingScreen message="주문내역을 불러오고 있어요" />;

  if (expired) {
    return <ExpiredScreen tableId={table?._id} sessionStartedAt={sessionStartedAt} />;
  }

  return (
    <PageWrapper>
      <TopBar>
        <BackButton onClick={() => router.back()}>&#8592;</BackButton>
      </TopBar>

      <PageHeader>
        <PageTitle>주문 내역</PageTitle>
        {totalItemCount > 0 && (
          <TotalSummary>
            총 {totalItemCount}개<TotalDivider>|</TotalDivider>{grandTotal.toLocaleString()}원
          </TotalSummary>
        )}
      </PageHeader>

      <SectionGap />

      {orders.length === 0 ? (
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
                  <ItemPrice>{(item.price * item.quantity).toLocaleString()}원</ItemPrice>
                </ItemBlock>
              ))}
              <OrderTop style={{ marginTop: 10, marginBottom: 0 }}>
                <span />
                <OrderTotal>{order.totalPrice.toLocaleString()}원</OrderTotal>
              </OrderTop>
            </OrderItem>
          ))}
        </OrdersList>
      )}
    </PageWrapper>
  );
}
