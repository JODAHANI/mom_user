import { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { formatPrice } from '../lib/format';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 250;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity 0.2s ease;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px 20px 0 0;
  z-index: 251;
  padding: 14px 20px calc(env(safe-area-inset-bottom, 0px) + 22px);
  transform: ${(p) => (p.$open ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.28s ease;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
`;

const DragHandle = styled.div`
  touch-action: none;
  user-select: none;
`;

const Grabber = styled.div`
  width: 44px;
  height: 5px;
  background: #d8cdb8;
  border-radius: 999px;
  margin: 0 auto 14px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.3px;
  margin: 4px 0 22px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 2px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled.button`
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  background: ${(p) => (p.$soldOut ? '#ebe3d0' : '#f4f0e7')};
  border: 1.5px solid transparent;
  color: ${(p) => (p.$soldOut ? '#a89e90' : '#1a1510')};
  letter-spacing: -0.3px;
  cursor: ${(p) => (p.$soldOut ? 'not-allowed' : 'pointer')};
  pointer-events: ${(p) => (p.$soldOut ? 'none' : 'auto')};
  padding: 8px 6px;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;

  &:active {
    background: #fff5d8;
    border-color: #f5c518;
    transform: scale(0.97);
  }
`;

const Name = styled.span`
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  word-break: keep-all;
  text-decoration: ${(p) => (p.$soldOut ? 'line-through' : 'none')};
`;

const Price = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #8c7458;
  font-variant-numeric: tabular-nums;
`;

const SoldOutTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #8c8278;
  letter-spacing: 0.2px;
`;

const Empty = styled.div`
  padding: 30px 0 40px;
  text-align: center;
  color: #8c8278;
  font-size: 14px;
`;

export default function VariantSheet({ open, product, onClose, onSelect }) {
  const variants = product?.variants || [];
  const basePrice = product?.price || 0;

  const touchStartY = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartY.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 80) {
      onClose();
    }
    touchStartY.current = null;
  }, [onClose]);

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Sheet $open={open} role="dialog" aria-modal="true">
        <DragHandle onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <Grabber />
          <Title>{product?.name || ''}</Title>
        </DragHandle>

        {variants.length === 0 ? (
          <Empty>등록된 종류가 없습니다</Empty>
        ) : (
          <Grid>
            {variants.map((v) => {
              const price = v.price != null ? v.price : basePrice;
              const diff = price - basePrice;
              const diffLabel =
                diff > 0
                  ? `+${formatPrice(diff)}`
                  : diff < 0
                  ? `-${formatPrice(Math.abs(diff))}`
                  : '';
              return (
                <Chip
                  key={v._id || v.name}
                  $soldOut={v.isSoldOut}
                  onClick={() => !v.isSoldOut && onSelect(v)}
                >
                  <Name $soldOut={v.isSoldOut}>{v.name}</Name>
                  {v.isSoldOut ? (
                    <SoldOutTag>품절</SoldOutTag>
                  ) : diffLabel ? (
                    <Price>{diffLabel}</Price>
                  ) : null}
                </Chip>
              );
            })}
          </Grid>
        )}
      </Sheet>
    </>
  );
}
