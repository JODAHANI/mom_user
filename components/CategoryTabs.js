import styled from 'styled-components';

const ScrollContainer = styled.div`
  overflow-x: auto;
  padding: 12px 0;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 16px;
  width: max-content;
`;

const Tab = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 20px;
  white-space: nowrap;
  transition: all 0.15s ease;
  background: ${(props) => (props.$active ? '#c3904a' : '#f5f1eb')};
  color: ${(props) => (props.$active ? '#fff' : '#8c8278')};
  font-weight: ${(props) => (props.$active ? '600' : '400')};
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
