import styled from 'styled-components';
import MenuItem from './MenuItem';

const Container = styled.div`
  padding-top: 8px;
  padding-bottom: 100px;
`;

const Section = styled.section`
  scroll-margin-top: 56px;
  padding-top: 24px;

  &:first-of-type {
    padding-top: 16px;
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.5px;
  padding: 0 16px 14px 26px;
`;

const SectionCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #8c8278;
  letter-spacing: 0;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  font-size: 14px;
  color: #8c8278;
`;

export default function MenuList({ groups, onAddToCart }) {
  if (!groups || groups.length === 0) {
    return (
      <Container>
        <EmptyState>메뉴가 없습니다</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {groups.map(({ category, items }) => (
        <Section
          key={category._id}
          id={`cat-${category._id}`}
          data-category-id={category._id}
        >
          <SectionTitle>
            {category.name}
            <SectionCount>{items.length}</SectionCount>
          </SectionTitle>
          {items.map((product) => (
            <MenuItem key={product._id} product={product} onAdd={onAddToCart} />
          ))}
        </Section>
      ))}
    </Container>
  );
}
