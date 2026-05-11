import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import styled from 'styled-components';
import api from '../../lib/api';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useStaffCall } from '../../hooks/useStaffCall';
import { useCallItems } from '../../hooks/useCallItems';
import { useOrder } from '../../hooks/useOrder';
import { useSession } from '../../hooks/useSession';
import {
  addToCartAtom,
  cartItemsAtom,
  cartCountAtom,
  cartTotalAtom,
  clearCartAtom,
} from '../../store/cartAtom';
import { useToast } from '../../components/Toast';
import Header from '../../components/Header';
import PromoBanner from '../../components/PromoBanner';
import CategoryTabs from '../../components/CategoryTabs';
import MenuList from '../../components/MenuList';
import CartBar from '../../components/CartBar';
import ExpiredScreen from '../../components/ExpiredScreen';
import LoadingScreen from '../../components/LoadingScreen';
import StaffCallSheet from '../../components/StaffCallSheet';
import VariantSheet from '../../components/VariantSheet';
import { useOrderWebSocket } from '../../hooks/useWebSocket';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f1eb;
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
  const [cartItems] = useAtom(cartItemsAtom);
  const [cartCount] = useAtom(cartCountAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const [, clearCart] = useAtom(clearCartAtom);
  const staffCallMutation = useStaffCall();
  const { data: callItemsData } = useCallItems();
  const callItems = callItemsData?.data || callItemsData || [];
  const [staffSheetOpen, setStaffSheetOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const orderMutation = useOrder();
  const showToast = useToast();
  const queryClient = useQueryClient();

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
  const { data: productsData } = useProducts();

  const table = tableData?.data || tableData;
  useOrderWebSocket(table?._id);
  const { sessionStartedAt, sessionClearedAt, expired, expiredClearedAt } = useSession(token, table?.lastClearedAt);
  const categories = categoriesData?.data || categoriesData || [];
  const allProducts = productsData?.data || productsData || [];
  const products = allProducts.filter((p) => p.showOnTable !== false);

  const groupedProducts = useMemo(() => {
    if (!categories.length) return [];
    const groups = categories.map((cat) => ({
      category: cat,
      items: products.filter((p) =>
        (p.categoryIds || []).some((c) => (c?._id || c) === cat._id)
      ),
    }));
    return groups.filter((g) => g.items.length > 0);
  }, [categories, products]);

  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef(null);

  useEffect(() => {
    if (groupedProducts.length === 0) return;
    let raf = 0;
    const onScroll = () => {
      if (scrollLockRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (scrollLockRef.current) return;
        if (window.scrollY < 80) {
          setSelectedCategory('all');
          return;
        }
        const sections = document.querySelectorAll('[data-category-id]');
        if (sections.length === 0) return;

        const atBottom =
          window.innerHeight + Math.ceil(window.scrollY) >=
          document.documentElement.scrollHeight - 2;
        if (atBottom) {
          setSelectedCategory(
            sections[sections.length - 1].dataset.categoryId
          );
          return;
        }

        const trigger = 80;
        let current = null;
        for (const sec of sections) {
          const top = sec.getBoundingClientRect().top;
          if (top <= trigger) current = sec;
          else break;
        }
        if (current) setSelectedCategory(current.dataset.categoryId);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [groupedProducts.length]);

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    scrollLockRef.current = true;
    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    scrollLockTimerRef.current = setTimeout(() => {
      scrollLockRef.current = false;
      scrollLockTimerRef.current = null;
    }, 1000);
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(`cat-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (expired) {
      clearCart();
    }
  }, [expired, clearCart]);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    window.sessionStorage.setItem('currentToken', token);
    if (router.asPath !== '/table') {
      router.replace(
        { pathname: '/table/[token]', query: { token } },
        '/table',
        { shallow: true }
      );
    }
  }, [token, router]);

  const staffCallLockRef = useRef(false);
  const handleStaffCall = () => {
    if (!table?._id) return;
    setStaffSheetOpen(true);
  };

  const handleStaffCallSubmit = (items) => {
    if (!table?._id) return;
    if (staffCallLockRef.current) return;
    staffCallLockRef.current = true;
    setTimeout(() => {
      staffCallLockRef.current = false;
    }, 2000);
    staffCallMutation.mutate(
      {
        tableId: table._id,
        tableNumber: table.number,
        floor: table.floor,
        items,
        sessionStartedAt,
      },
      {
        onSuccess: () => {
          setStaffSheetOpen(false);
          showToast('직원호출이\n완료되었습니다.', 'staff');
        },
        onError: (err) => {
          if (err?.response?.status === 409) {
            setStaffSheetOpen(false);
            showToast('테이블이 정리되었습니다.', 'error');
            queryClient.invalidateQueries({ queryKey: ['table'] });
          } else {
            showToast('호출에 실패했습니다. 다시 시도해주세요.', 'error');
          }
        },
      }
    );
  };

  const handleAddToCart = (product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      setVariantProduct(product);
      return;
    }
    addToCart({ product });
    showToast(`${product.name} 추가`, 'success');
  };

  const handleVariantSelect = (variant) => {
    if (!variantProduct) return;
    addToCart({ product: variantProduct, variant });
    showToast(`${variantProduct.name} (${variant.name}) 추가`, 'success');
    setVariantProduct(null);
  };

  const handleCartClick = () => {
    router.push(
      { pathname: '/table/[token]/cart', query: { token } },
      '/table/cart'
    );
  };

  const handleOrderHistoryClick = () => {
    router.push(
      { pathname: '/table/[token]/orders', query: { token } },
      '/table/orders'
    );
  };

  const handleOrderSubmit = () => {
    if (!table?._id || cartItems.length === 0 || orderMutation.isPending) return;

    const orderData = {
      tableId: table._id,
      tableNumber: table.number,
      floor: table.floor,
      sessionStartedAt,
      items: cartItems.map((item) => ({
        product: item.productId,
        name: item.name,
        variantName: item.variantName || '',
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: cartTotal,
    };

    orderMutation.mutate(orderData, {
      onSuccess: () => {
        showToast('주문이 완료되었습니다!', 'order');
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['table-orders', table._id] });
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

  if (!token) return <LoadingScreen message="맛있는 메뉴를 가져오고 있어요" />;

  if (tableLoading) {
    return <LoadingScreen message="맛있는 메뉴를 가져오고 있어요" />;
  }

  if (tableError) {
    return (
      <ErrorWrapper>
        <p>테이블 정보를 불러올 수 없습니다.</p>
        <p style={{ marginTop: 8 }}>QR코드를 다시 스캔해주세요.</p>
      </ErrorWrapper>
    );
  }

  if (expired) {
    return <ExpiredScreen tableId={table?._id} sessionStartedAt={sessionStartedAt} sessionClearedAt={sessionClearedAt} expiredClearedAt={expiredClearedAt} />;
  }

  return (
    <PageWrapper>
      <Header table={table} cartCount={cartCount} onStaffCall={handleStaffCall} onOrderHistory={handleOrderHistoryClick} onCart={handleCartClick} />
      <PromoBanner />
      <CategoryTabs
        categories={categories}
        activeId={selectedCategory}
        onSelect={handleSelectCategory}
      />
      <MenuList groups={groupedProducts} onAddToCart={handleAddToCart} />
      <CartBar count={cartCount} total={cartTotal} onClick={handleOrderSubmit} pending={orderMutation.isPending} />
      <StaffCallSheet
        open={staffSheetOpen}
        onClose={() => setStaffSheetOpen(false)}
        onSubmit={handleStaffCallSubmit}
        items={callItems}
        submitting={staffCallMutation.isPending}
      />
      <VariantSheet
        open={!!variantProduct}
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
        onSelect={handleVariantSelect}
      />
    </PageWrapper>
  );
}
