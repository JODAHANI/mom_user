import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { formatPrice } from '../lib/format';

const sunlightDrift = keyframes`
  0% {
    transform: translate(-110%, -110%);
  }
  100% {
    transform: translate(110%, 110%);
  }
`;

const Card = styled.div`
  padding: 16px;
  border-radius: 12px;
  margin: 0 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FBF8F1;
  border: 1px solid #d8cdb8;
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
  white-space: pre-line;
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
  margin-bottom: 6px;
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

const ImageWrap = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
`;

const Skeleton = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 16px;
  overflow: hidden;
  background-color: #ebe2cf;
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 27px,
      rgba(122, 92, 50, 0.09) 27px,
      rgba(122, 92, 50, 0.09) 28px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 27px,
      rgba(122, 92, 50, 0.09) 27px,
      rgba(122, 92, 50, 0.09) 28px
    );
  opacity: ${(p) => (p.$loaded ? 0 : 1)};
  transition: opacity 0.45s ease;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      transparent 35%,
      rgba(245, 222, 175, 0.6) 50%,
      transparent 65%
    );
    animation: ${sunlightDrift} 2.6s ease-in-out infinite;
  }
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: contain;
  padding: 4px;
  cursor: zoom-in;
  display: block;
  opacity: ${(p) => (p.$loaded ? 1 : 0)};
  transition: opacity 0.45s ease;
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
  '추천': { bg: '#E3F2FD', color: '#1976D2' },
  '사장님 추천': { bg: '#FFF8E1', color: '#F59E0B' },
  '인기': { bg: '#E8F5E9', color: '#2E7D32' },
  '시그니처': { bg: '#F3E8FF', color: '#8B5CF6' },
  'BEST': { bg: '#FFEBEE', color: '#FF3B30' },
  'NEW': { bg: '#E8F5E9', color: '#4CAF50' },
  '품절': { bg: '#ede8e0', color: '#8c8278' },
};

export default function MenuItem({ product, onAdd }) {
  const [pressed, setPressed] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  // variants가 있고 전부 품절이면 상품도 품절로 취급 (시트 열어도 의미 없음)
  const variants = product.variants || [];
  const allVariantsSoldOut = variants.length > 0 && variants.every((v) => v.isSoldOut);
  const isSoldOut = product.isSoldOut || allVariantsSoldOut;

  useEffect(() => {
    setImageLoaded(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [product.image]);

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
          <Name>{product.name}</Name>
          {product.description && <Description>{product.description}</Description>}
          <Price>{formatPrice(product.price)}</Price>
        </LeftSide>
        {product.image && (
          <ImageWrap>
            <Skeleton $loaded={imageLoaded} aria-hidden="true" />
            <ProductImage
              ref={imgRef}
              src={product.image}
              alt={product.name}
              onClick={handleImageClick}
              onLoad={() => setImageLoaded(true)}
              $loaded={imageLoaded}
            />
          </ImageWrap>
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
