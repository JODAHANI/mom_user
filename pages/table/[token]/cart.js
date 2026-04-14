import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import api from '../../../lib/api';
import { useOrder } from '../../../hooks/useOrder';
import { useSession } from '../../../hooks/useSession';
import { useOrderWebSocket } from '../../../hooks/useWebSocket';
import { useToast } from '../../../components/Toast';
import ExpiredScreen from '../../../components/ExpiredScreen';
import {
  cartItemsAtom,
  cartCountAtom,
  cartTotalAtom,
  updateQuantityAtom,
  removeFromCartAtom,
  clearCartAtom,
} from '../../../store/cartAtom';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f1eb;
`;

const TopBar = styled.header`
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #e5ded4;
  display: flex;
  align-items: center;
  position: relative;
`;

const BackButton = styled.button`
  font-size: 18px;
  padding: 4px 8px;
  color: #1a1510;
`;

const TopTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  flex: 1;
  text-align: center;
  margin-right: 40px;
`;

const CartList = styled.div`
  padding: 16px;
`;

const CartItem = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1510;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  font-size: 14px;
  color: #8c8278;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QtyButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5ded4;
  background: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1510;

  &:active {
    background: #f5f1eb;
  }
`;

const Quantity = styled.span`
  font-size: 16px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const RemoveButton = styled.button`
  font-size: 24px;
  color: #8c8278;
  padding: 4px 18px;
  margin-left: 8px;
  line-height: 1;

  &:active {
    color: #FF3B30;
  }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const OrderButton = styled.button`
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  max-width: 448px;
  margin: 0 auto;
  background: #c3904a;
  color: #fff;
  padding: 16px 20px;
  border: none;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 6px 20px rgba(195, 144, 74, 0.4);
  animation: ${bounce} 1.6s ease-in-out infinite;

  &:active {
    background: #a87a3a;
    animation-play-state: paused;
  }

  &:disabled {
    background: #d1cbc3;
    cursor: not-allowed;
    box-shadow: none;
    animation: none;
  }
`;

const CountBubble = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: 12px;
  background: #fff;
  color: #c3904a;
  font-size: 13px;
  font-weight: 800;
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 700;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  font-size: 15px;
  color: #8c8278;
`;

export default function CartPage() {
  const router = useRouter();
  const { token } = router.query;
  const [cartItems] = useAtom(cartItemsAtom);
  const [cartCount] = useAtom(cartCountAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const [, updateQuantity] = useAtom(updateQuantityAtom);
  const [, removeFromCart] = useAtom(removeFromCartAtom);
  const [, clearCart] = useAtom(clearCartAtom);
  const orderMutation = useOrder();
  const showToast = useToast();
  const queryClient = useQueryClient();

  const { data: tableData } = useQuery({
    queryKey: ['table', token],
    queryFn: () => api.get(`/tables/token/${token}`).then((res) => res.data),
    enabled: !!token,
  });

  const table = tableData?.data || tableData;
  useOrderWebSocket(table?._id);
  const { sessionStartedAt, expired } = useSession(token, table?.lastClearedAt);

  useEffect(() => {
    if (expired) {
      clearCart();
    }
  }, [expired, clearCart]);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    window.sessionStorage.setItem('currentToken', token);
    if (router.asPath !== '/table/cart') {
      router.replace(
        { pathname: '/table/[token]/cart', query: { token } },
        '/table/cart',
        { shallow: true }
      );
    }
  }, [token, router]);

  const handleOrder = () => {
    if (!table?._id || cartItems.length === 0) return;

    const orderData = {
      tableId: table._id,
      tableNumber: table.number,
      floor: table.floor,
      sessionStartedAt,
      items: cartItems.map((item) => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: cartTotal,
    };

    orderMutation.mutate(orderData, {
      onSuccess: () => {
        showToast('주문이 완료되었습니다!', 'order');
        clearCart();
        router.back();
      },
      onError: (err) => {
        if (err?.response?.status === 409) {
          showToast('테이블이 정리되었습니다.', 'error');
          clearCart();
          queryClient.invalidateQueries({ queryKey: ['table'] });
        } else {
          showToast('주문에 실패했습니다. 다시 시도해주세요.', 'error');
        }
      },
    });
  };

  if (expired) {
    return <ExpiredScreen />;
  }

  return (
    <PageWrapper>
      <TopBar>
        <BackButton onClick={() => router.back()}>&#8592;</BackButton>
        <TopTitle>장바구니</TopTitle>
      </TopBar>

      {cartItems.length === 0 ? (
        <EmptyState>장바구니가 비어있습니다</EmptyState>
      ) : (
        <>
          <CartList>
            {cartItems.map((item) => (
              <CartItem key={item.productId}>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemPrice>{(item.price * item.quantity).toLocaleString()}원</ItemPrice>
                </ItemInfo>
                <Controls>
                  <QtyButton
                    onClick={() =>
                      updateQuantity({ productId: item.productId, quantity: item.quantity - 1 })
                    }
                  >
                    -
                  </QtyButton>
                  <Quantity>{item.quantity}</Quantity>
                  <QtyButton
                    onClick={() =>
                      updateQuantity({ productId: item.productId, quantity: item.quantity + 1 })
                    }
                  >
                    +
                  </QtyButton>
                  <RemoveButton onClick={() => { removeFromCart(item.productId); showToast(`${item.name} 삭제`, 'delete'); }}>&times;</RemoveButton>
                </Controls>
              </CartItem>
            ))}
          </CartList>

          <OrderButton onClick={handleOrder} disabled={orderMutation.isPending}>
            <CountBubble>{cartCount}</CountBubble>
            <Label>
              {orderMutation.isPending ? '주문 중...' : `${cartTotal.toLocaleString()}원 주문하기`}
            </Label>
          </OrderButton>
        </>
      )}
    </PageWrapper>
  );
}
