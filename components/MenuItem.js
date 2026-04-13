import { useState } from 'react';
import styled from 'styled-components';

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
  font-size: 16px;
  font-weight: 700;
  color: #191F28;
  margin-bottom: 4px;
`;

const Price = styled.div`
  font-size: 15px;
  color: #8B95A1;
  margin-bottom: 8px;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => props.$bg};
  color: ${(props) => props.$color};
`;

const ImagePlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #F0F0F0;
  flex-shrink: 0;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
  padding: 4px;
`;

const badgeStyles = {
  '추천': { bg: '#E8F0FE', color: '#3182F6' },
  '사장님 추천': { bg: '#FFF8E1', color: '#F59E0B' },
  '인기': { bg: '#FFF3E0', color: '#FF9500' },
  '시그니처': { bg: '#F3E8FF', color: '#8B5CF6' },
  'BEST': { bg: '#FFEBEE', color: '#FF3B30' },
  'NEW': { bg: '#E8F5E9', color: '#4CAF50' },
  '품절': { bg: '#F0F0F0', color: '#8B95A1' },
};

export default function MenuItem({ product, onAdd }) {
  const [pressed, setPressed] = useState(false);
  const isSoldOut = product.isSoldOut;

  const handleClick = () => {
    if (isSoldOut) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 100);
    onAdd(product);
  };

  const badges = isSoldOut ? ['품절'] : (product.badges || []);

  return (
    <Card $soldOut={isSoldOut} $pressed={pressed} onClick={handleClick}>
      <LeftSide>
        <Name>{product.name}</Name>
        <Price>{product.price?.toLocaleString()}원</Price>
        {badges.length > 0 && (
          <BadgeRow>
            {badges.map((badge) => {
              const style = badgeStyles[badge] || { bg: '#F0F0F0', color: '#666' };
              return (
                <Badge key={badge} $bg={style.bg} $color={style.color}>
                  {badge}
                </Badge>
              );
            })}
          </BadgeRow>
        )}
      </LeftSide>
      {product.image ? (
        <ProductImage src={product.image} alt={product.name} />
      ) : (
        <ImagePlaceholder />
      )}
    </Card>
  );
}
