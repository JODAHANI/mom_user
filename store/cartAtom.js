import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const cartStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? window.sessionStorage : undefined
);

export const cartItemsAtom = atomWithStorage('cart', [], cartStorage, { getOnInit: true });

// 같은 상품도 변형이 다르면 별도 라인. 같은 변형이면 수량 합산.
const sameLine = (a, b) =>
  a.productId === b.productId && (a.variantName || '') === (b.variantName || '');

export const cartCountAtom = atom((get) => {
  return get(cartItemsAtom).reduce((sum, item) => sum + item.quantity, 0);
});

export const cartTotalAtom = atom((get) => {
  return get(cartItemsAtom).reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// product: 일반 상품 객체. variant(선택): { name, price?, isSoldOut? } — 변형 시트에서 선택된 항목.
export const addToCartAtom = atom(null, (get, set, payload) => {
  const product = payload.product || payload;
  const variant = payload.variant || null;
  const variantName = variant?.name || '';
  const price = variant && variant.price != null ? variant.price : product.price;
  const line = { productId: product._id, name: product.name, variantName, price, quantity: 1 };

  const items = get(cartItemsAtom);
  const existing = items.find((item) => sameLine(item, line));
  if (existing) {
    set(
      cartItemsAtom,
      items.map((item) => (sameLine(item, line) ? { ...item, quantity: item.quantity + 1 } : item))
    );
  } else {
    set(cartItemsAtom, [...items, line]);
  }
});

export const removeFromCartAtom = atom(null, (get, set, key) => {
  const productId = typeof key === 'string' ? key : key.productId;
  const variantName = typeof key === 'string' ? '' : key.variantName || '';
  set(
    cartItemsAtom,
    get(cartItemsAtom).filter(
      (item) => !(item.productId === productId && (item.variantName || '') === variantName)
    )
  );
});

export const updateQuantityAtom = atom(null, (get, set, { productId, variantName = '', quantity }) => {
  if (quantity <= 0) {
    set(
      cartItemsAtom,
      get(cartItemsAtom).filter(
        (item) => !(item.productId === productId && (item.variantName || '') === variantName)
      )
    );
  } else {
    set(
      cartItemsAtom,
      get(cartItemsAtom).map((item) =>
        item.productId === productId && (item.variantName || '') === variantName
          ? { ...item, quantity }
          : item
      )
    );
  }
});

export const clearCartAtom = atom(null, (get, set) => {
  set(cartItemsAtom, []);
});

// 주문 내역
export const orderHistoryAtom = atom([]);

export const placeOrderAtom = atom(null, (get, set) => {
  const items = get(cartItemsAtom);
  if (items.length === 0) return;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: Date.now().toString(),
    items: [...items],
    total,
    createdAt: new Date().toISOString(),
  };
  set(orderHistoryAtom, [order, ...get(orderHistoryAtom)]);
  set(cartItemsAtom, []);
});
