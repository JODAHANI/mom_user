export const formatPrice = (price) =>
  price === 0 ? '무료' : `${(price ?? 0).toLocaleString()}원`;

// 변형이 있는 상품은 "상품명 (변형명)"으로 표시
export const formatItemName = (item) =>
  item?.variantName ? `${item.name} (${item.variantName})` : item?.name || '';
