import styled from 'styled-components';
import MenuItem from './MenuItem';

const Container = styled.div`
  padding-top: 8px;
  padding-bottom: 100px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  font-size: 14px;
  color: #8B95A1;
`;

export default function MenuList({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <Container>
        <EmptyState>메뉴가 없습니다</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {products.map((product) => (
        <MenuItem key={product._id} product={product} onAdd={onAddToCart} />
      ))}
    </Container>
  );
}
