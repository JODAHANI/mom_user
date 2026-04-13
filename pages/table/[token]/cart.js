import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import api from '../../../lib/api';
import { useOrder } from '../../../hooks/useOrder';
import { useToast } from '../../../components/Toast';
import {
  cartItemsAtom,
  cartTotalAtom,
  updateQuantityAtom,
  removeFromCartAtom,
  clearCartAtom,
} from '../../../store/cartAtom';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #F5F6F8;
`;

const TopBar = styled.header`
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #E5E8EB;
  display: flex;
  align-items: center;
  position: relative;
`;

const BackButton = styled.button`
  font-size: 18px;
  padding: 4px 8px;
  color: #191F28;
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
  color: #191F28;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  font-size: 14px;
  color: #8B95A1;
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
  border: 1px solid #E5E8EB;
  background: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #191F28;

  &:active {
    background: #F5F6F8;
  }
`;

const Quantity = styled.span`
  font-size: 16px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const RemoveButton = styled.button`
  font-size: 12px;
  color: #8B95A1;
  padding: 4px 8px;
  margin-left: 8px;

  &:active {
    color: #FF3B30;
  }
`;

const BottomSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  padding: 16px 20px;
  border-top: 1px solid #E5E8EB;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TotalLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #191F28;
`;

const TotalPrice = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #191F28;
`;

const OrderButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background: #3182F6;
  color: #fff;
  font-size: 16px;
  font-weight: 700;

  &:active {
    background: #1B6CE5;
  }

  &:disabled {
    background: #D1D6DB;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  font-size: 15px;
  color: #8B95A1;
`;

export default function CartPage() {
  const router = useRouter();
  const { token } = router.query;
  const [cartItems] = useAtom(cartItemsAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const [, updateQuantity] = useAtom(updateQuantityAtom);
  const [, removeFromCart] = useAtom(removeFromCartAtom);
  const [, clearCart] = useAtom(clearCartAtom);
  const orderMutation = useOrder();
  const showToast = useToast();

  const { data: tableData } = useQuery({
    queryKey: ['table', token],
    queryFn: () => api.get(`/tables/token/${token}`).then((res) => res.data),
    enabled: !!token,
  });

  const table = tableData?.data || tableData;

  const handleOrder = () => {
    if (!table?._id || cartItems.length === 0) return;

    const orderData = {
      tableId: table._id,
      tableNumber: table.number,
      floor: table.floor,
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
      onError: () => {
        showToast('주문에 실패했습니다. 다시 시도해주세요.', 'error');
      },
    });
  };

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
                  <RemoveButton onClick={() => { removeFromCart(item.productId); showToast(`${item.name}이(가) 삭제되었습니다`, 'info'); }}>삭제</RemoveButton>
                </Controls>
              </CartItem>
            ))}
          </CartList>

          <BottomSection>
            <TotalRow>
              <TotalLabel>총 결제금액</TotalLabel>
              <TotalPrice>{cartTotal.toLocaleString()}원</TotalPrice>
            </TotalRow>
            <OrderButton onClick={handleOrder} disabled={orderMutation.isPending}>
              {orderMutation.isPending ? '주문 중...' : '주문하기'}
            </OrderButton>
          </BottomSection>
        </>
      )}
    </PageWrapper>
  );
}
