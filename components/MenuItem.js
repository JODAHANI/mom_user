import { useState } from 'react';
import styled from 'styled-components';
import { formatPrice } from '../lib/format';

const Card = styled.div`
  padding: 16px;
  border-radius: 12px;
  margin: 0 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  cursor: pointer;
  transition: transform 0.1s ease;
  opacity: ${(props) => (props.$soldOut ? 0.5 : 1)};
  pointer-events: ${(props) => (props.$soldOut ? 'none' : 'auto')};
  transform: ${(props) => (props.$pressed ? 'scale(0.98)' : 'scale(1)')};
  user-select: none;
`;

const LeftSide = styled.div`
  flex: 1;
  margin-right: 12px;
`;

const Name = styled.div`
  font-size: 19px;
  font-weight: 700;
  color: #1a1510;
  margin-bottom: 6px;
`;

const Description = styled.div`
  font-size: 13px;
  color: #8c8278;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Price = styled.div`
  font-size: 18px;
  color: #8c8278;
  margin-bottom: 10px;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 9px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => props.$bg};
  color: ${(props) => props.$color};
`;

const ImagePlaceholder = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  background: #ede8e0;
  flex-shrink: 0;
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: contain;
  flex-shrink: 0;
  padding: 4px;
  cursor: zoom-in;
`;

const ImageOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.15s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
  object-fit: contain;
  background: #fff;
`;

const CloseHint = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const badgeStyles = {
  '추천': { bg: '#f5edd8', color: '#c3904a' },
  '사장님 추천': { bg: '#FFF8E1', color: '#F59E0B' },
  '인기': { bg: '#FFF3E0', color: '#FF9500' },
  '시그니처': { bg: '#F3E8FF', color: '#8B5CF6' },
  'BEST': { bg: '#FFEBEE', color: '#FF3B30' },
  'NEW': { bg: '#E8F5E9', color: '#4CAF50' },
  '품절': { bg: '#ede8e0', color: '#8c8278' },
};

export default function MenuItem({ product, onAdd }) {
  const [pressed, setPressed] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const isSoldOut = product.isSoldOut;

  const handleClick = () => {
    if (isSoldOut) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 100);
    onAdd(product);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (product.image) setImageOpen(true);
  };

  const badges = isSoldOut ? ['품절'] : (product.badges || []);

  return (
    <>
      <Card $soldOut={isSoldOut} $pressed={pressed} onClick={handleClick}>
        <LeftSide>
          <Name>{product.name}</Name>
          {product.description && <Description>{product.description}</Description>}
          <Price>{formatPrice(product.price)}</Price>
          {badges.length > 0 && (
            <BadgeRow>
              {badges.map((badge) => {
                const style = badgeStyles[badge] || { bg: '#ede8e0', color: '#666' };
                return (
                  <Badge key={badge} $bg={style.bg} $color={style.color}>
                    {badge}
                  </Badge>
                );
              })}
            </BadgeRow>
          )}
        </LeftSide>
        {product.image && (
          <ProductImage src={product.image} alt={product.name} onClick={handleImageClick} />
        )}
      </Card>
      {imageOpen && (
        <ImageOverlay onClick={() => setImageOpen(false)}>
          <CloseHint>×</CloseHint>
          <ModalImage src={product.image} alt={product.name} onClick={(e) => e.stopPropagation()} />
        </ImageOverlay>
      )}
    </>
  );
}
