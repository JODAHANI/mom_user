import { useState } from 'react';
import { useAtom } from 'jotai';
import styled from 'styled-components';
import { addToCartAtom, cartCountAtom, cartTotalAtom, placeOrderAtom } from '../store/cartAtom';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import PromoBanner from '../components/PromoBanner';
import CategoryTabs from '../components/CategoryTabs';
import MenuList from '../components/MenuList';
import CartBar from '../components/CartBar';
import StaffCallSheet from '../components/StaffCallSheet';

// 더미 데이터 (seed.js 기준)
const CATEGORIES = [
  { _id: 'cat1', name: '추천메뉴' },
  { _id: 'cat2', name: '라멘' },
  { _id: 'cat3', name: '토핑' },
  { _id: 'cat4', name: '사이드메뉴' },
  { _id: 'cat5', name: '음료' },
];

const PRODUCTS = [
  { _id: 'p1', name: '신라멘', price: 10000, categoryId: 'cat2', isSoldOut: true, isPopular: true, image: '/images/shin_ramen.png' },
  { _id: 'p2', name: '돈코츠라멘', price: 11000, categoryId: 'cat2', isNew: true, image: '/images/tonkotsu.png' },
  { _id: 'p3', name: '쇼유라멘', price: 10500, categoryId: 'cat2', image: '/images/shoyu.png' },
  { _id: 'p4', name: '미소라멘', price: 10500, categoryId: 'cat2', isRecommended: true, image: '/images/miso.png' },
  { _id: 'p5', name: '차슈토핑', price: 2000, categoryId: 'cat3', image: '/images/chashu.png' },
  { _id: 'p6', name: '계란토핑', price: 1500, categoryId: 'cat3', image: '/images/egg.png' },
  { _id: 'p7', name: '교자', price: 5000, categoryId: 'cat4', image: '/images/gyoza.png' },
  { _id: 'p8', name: '에다마메', price: 4000, categoryId: 'cat4', image: '/images/edamame.png' },
  { _id: 'p9', name: '콜라', price: 2000, categoryId: 'cat5', image: '/images/cola.png' },
  { _id: 'p10', name: '사이다', price: 2000, categoryId: 'cat5', image: '/images/cider.png' },
];

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f1eb;
`;

export default function DemoPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [, addToCart] = useAtom(addToCartAtom);
  const [cartCount] = useAtom(cartCountAtom);
  const [cartTotal] = useAtom(cartTotalAtom);
  const [, placeOrder] = useAtom(placeOrderAtom);
  const showToast = useToast();
  const [staffSheetOpen, setStaffSheetOpen] = useState(false);

  const table = { _id: 'demo', number: 1, floor: 1 };
  const demoCallItems = [
    { _id: 'd1', name: '물' },
    { _id: 'd2', name: '냅킨' },
    { _id: 'd3', name: '직원부르기' },
  ];

  const products =
    selectedCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.categoryId === selectedCategory);

  const handleStaffCall = () => setStaffSheetOpen(true);

  const handleStaffCallSubmit = (items) => {
    setStaffSheetOpen(false);
    showToast(`호출이 접수되었습니다: ${items.join(', ')}`, 'success');
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleCartClick = () => {
    if (cartCount === 0) return;
    placeOrder();
    showToast('주문이 완료되었습니다!', 'success');
  };

  return (
    <PageWrapper>
      <Header table={table} cartCount={cartCount} onStaffCall={handleStaffCall} onOrderHistory={() => showToast('데모에서는 주문내역을 볼 수 없어요', 'info')} onCart={handleCartClick} />
      <PromoBanner />
      <CategoryTabs
        categories={CATEGORIES}
        activeId={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <MenuList products={products} onAddToCart={handleAddToCart} />
      <CartBar count={cartCount} total={cartTotal} onClick={handleCartClick} />
      <StaffCallSheet
        open={staffSheetOpen}
        onClose={() => setStaffSheetOpen(false)}
        onSubmit={handleStaffCallSubmit}
        items={demoCallItems}
      />
    </PageWrapper>
  );
}
