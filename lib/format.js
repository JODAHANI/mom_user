export const formatPrice = (price) =>
  price === 0 ? '무료' : `${(price ?? 0).toLocaleString()}원`;
