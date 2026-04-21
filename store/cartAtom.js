import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const cartStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? window.sessionStorage : undefined
);

export const cartItemsAtom = atomWithStorage('cart', [], cartStorage, { getOnInit: true });

export const cartCountAtom = atom((get) => {
  return get(cartItemsAtom).reduce((sum, item) => sum + item.quantity, 0);
});

export const cartTotalAtom = atom((get) => {
  return get(cartItemsAtom).reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Helper: add item to cart
export const addToCartAtom = atom(null, (get, set, product) => {
  const items = get(cartItemsAtom);
  const existing = items.find(item => item.productId === product._id);
  if (existing) {
    set(cartItemsAtom, items.map(item =>
      item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  } else {
    set(cartItemsAtom, [...items, { productId: product._id, name: product.name, price: product.price, quantity: 1 }]);
  }
});

export const removeFromCartAtom = atom(null, (get, set, productId) => {
  set(cartItemsAtom, get(cartItemsAtom).filter(item => item.productId !== productId));
});

export const updateQuantityAtom = atom(null, (get, set, { productId, quantity }) => {
  if (quantity <= 0) {
    set(cartItemsAtom, get(cartItemsAtom).filter(item => item.productId !== productId));
  } else {
    set(cartItemsAtom, get(cartItemsAtom).map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
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
