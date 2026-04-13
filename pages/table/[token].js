import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import styled from 'styled-components';
import api from '../../lib/api';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useStaffCall } from '../../hooks/useStaffCall';
import { addToCartAtom, cartCountAtom, cartTotalAtom } from '../../store/cartAtom';
import { useToast } from '../../components/Toast';
import Header from '../../components/Header';
import PromoBanner from '../../components/PromoBanner';
import CategoryTabs from '../../components/CategoryTabs';
import MenuList from '../../components/MenuList';
import CartBar from '../../components/CartBar';
import OrderHistory from '../../components/OrderHistory';
import { useOrderWebSocket } from '../../hooks/useWebSocket';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f1eb;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 14px;
  color: #8c8278;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 14px;
  color: #8c8278;
  padding: 20px;
  text-align: center;
`;

export default function TablePage() {
  const router = useRouter();
  const { token } = router.query;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [, addToCart] = useAtom(addToCartAtom);
  const [cartCount] = useAtom(cartCountAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const staffCallMutation = useStaffCall();
  const showToast = useToast();

  const {
    data: tableData,
    isLoading: tableLoading,
    error: tableError,
  } = useQuery({
    queryKey: ['table', token],
    queryFn: () => api.get(`/tables/token/${token}`).then((res) => res.data),
    enabled: !!token,
  });

  const { data: categoriesData } = useCategories();
  const { data: productsData } = useProducts(selectedCategory);

  const table = tableData?.data || tableData;
  useOrderWebSocket(table?._id);
  const categories = categoriesData?.data || categoriesData || [];
  const allProducts = productsData?.data || productsData || [];
  const products = allProducts.filter((p) => p.showOnTable !== false);

  const handleStaffCall = () => {
    if (!table?._id) return;
    staffCallMutation.mutate(
      { tableId: table._id, tableNumber: table.number, floor: table.floor },
      {
        onSuccess: () => showToast('직원호출이\n완료되었습니다.', 'staff'),
        onError: () => showToast('호출에 실패했습니다. 다시 시도해주세요.', 'error'),
      }
    );
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} 추가`, 'success');
  };

  const handleCartClick = () => {
    router.push(`/table/${token}/cart`);
  };

  if (!token) return null;

  if (tableLoading) {
    return <LoadingWrapper>메뉴를 불러오고 있습니다...</LoadingWrapper>;
  }

  if (tableError) {
    return (
      <ErrorWrapper>
        <p>테이블 정보를 불러올 수 없습니다.</p>
        <p style={{ marginTop: 8 }}>QR코드를 다시 스캔해주세요.</p>
      </ErrorWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header table={table} cartCount={cartCount} onStaffCall={handleStaffCall} onOrderHistory={() => setOrderHistoryOpen(true)} onCart={handleCartClick} />
      <PromoBanner />
      <CategoryTabs
        categories={categories}
        activeId={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <MenuList products={products} onAddToCart={handleAddToCart} />
      <CartBar count={cartCount} total={cartTotal} onClick={handleCartClick} />
      <OrderHistory open={orderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} tableId={table?._id} lastClearedAt={table?.lastClearedAt} />
    </PageWrapper>
  );
}
