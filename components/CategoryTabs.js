import styled from 'styled-components';

const ScrollContainer = styled.div`
  overflow-x: auto;
  padding: 4px 0 8px;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 4px;
  padding: 0 16px;
  width: max-content;
`;

const Tab = styled.button`
  position: relative;
  padding: 10px 16px;
  font-size: 16px;
  white-space: nowrap;
  background: none;
  color: ${(props) => (props.$active ? '#1a1510' : '#8c8278')};
  font-weight: ${(props) => (props.$active ? '700' : '500')};
  transition: color 0.15s ease;

  &::after {
    content: '';
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 2px;
    height: 2px;
    border-radius: 1px;
    background: ${(props) => (props.$active ? '#c3904a' : 'transparent')};
    transition: background 0.15s ease;
  }
`;

export default function CategoryTabs({ categories, activeId, onSelect }) {
  return (
    <ScrollContainer>
      <TabRow>
        <Tab $active={activeId === 'all'} onClick={() => onSelect('all')}>
          전체
        </Tab>
        {categories?.map((cat) => (
          <Tab
            key={cat._id}
            $active={activeId === cat._id}
            onClick={() => onSelect(cat._id)}
          >
            {cat.name}
          </Tab>
        ))}
      </TabRow>
    </ScrollContainer>
  );
}
