import styled from 'styled-components';
import { formatPrice } from '../lib/format';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 250;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity 0.22s ease;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 480px;
  margin: 0 auto;
  background: #f5f1eb;
  border-radius: 22px 22px 0 0;
  z-index: 251;
  padding: 12px 18px calc(env(safe-area-inset-bottom, 0px) + 22px);
  transform: ${(p) => (p.$open ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 -12px 32px rgba(26, 21, 16, 0.18);
`;

const Grabber = styled.div`
  width: 44px;
  height: 5px;
  background: #d8cdb8;
  border-radius: 999px;
  margin: 0 auto 14px;
`;

const HeaderRow = styled.div`
  margin: 6px 4px 18px;
`;

const Eyebrow = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #c3904a;
  letter-spacing: 0.2px;
  margin-bottom: 4px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.4px;
  line-height: 1.25;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 2px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 16px 16px 18px;
  border-radius: 14px;
  background: ${(p) => (p.$soldOut ? '#ebe3d0' : '#FBF8F1')};
  border: 1px solid ${(p) => (p.$soldOut ? '#cdc1a7' : '#d8cdb8')};
  text-align: left;
  cursor: ${(p) => (p.$soldOut ? 'not-allowed' : 'pointer')};
  pointer-events: ${(p) => (p.$soldOut ? 'none' : 'auto')};
  box-shadow: ${(p) => (p.$soldOut ? 'none' : '0 1px 0 rgba(195, 144, 74, 0.06)')};
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;

  &:active {
    background: #fff5e0;
    border-color: #c3904a;
    transform: scale(0.985);
  }
`;

const NameBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Name = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.$soldOut ? '#a89e90' : '#1a1510')};
  letter-spacing: -0.2px;
  text-decoration: ${(p) => (p.$soldOut ? 'line-through' : 'none')};
`;

const Price = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => (p.$soldOut ? '#bdb4a4' : '#8c7458')};
  font-variant-numeric: tabular-nums;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const SoldOutPill = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #8c8278;
  background: #f5f1eb;
  border: 1px solid #d8cdb8;
  border-radius: 999px;
  padding: 3px 10px;
  letter-spacing: 0.2px;
`;

const Chevron = styled.span`
  font-size: 20px;
  line-height: 1;
  color: #c3904a;
  font-weight: 400;
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

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Sheet $open={open} role="dialog" aria-modal="true">
        <Grabber />
        <HeaderRow>
          <Eyebrow>종류 선택</Eyebrow>
          <Title>{product?.name || ''}</Title>
        </HeaderRow>

        {variants.length === 0 ? (
          <Empty>등록된 종류가 없습니다</Empty>
        ) : (
          <List>
            {variants.map((v) => {
              const price = v.price != null ? v.price : basePrice;
              return (
                <Row
                  key={v._id || v.name}
                  $soldOut={v.isSoldOut}
                  onClick={() => !v.isSoldOut && onSelect(v)}
                >
                  <NameBlock>
                    <Name $soldOut={v.isSoldOut}>{v.name}</Name>
                    <Price $soldOut={v.isSoldOut}>{formatPrice(price)}</Price>
                  </NameBlock>
                  <RightSide>
                    {v.isSoldOut ? <SoldOutPill>품절</SoldOutPill> : <Chevron>›</Chevron>}
                  </RightSide>
                </Row>
              );
            })}
          </List>
        )}
      </Sheet>
    </>
  );
}
