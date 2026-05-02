import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const ScrollContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 20;
  background: #f5f1eb;
  overflow-x: auto;
  padding: 8px 0 10px;
  border-bottom: 1px solid #e8e1d4;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabRow = styled.div`
  position: relative;
  display: flex;
  gap: 6px;
  padding: 0 16px;
  width: max-content;
`;

const Indicator = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: #f5edd8;
  border: 1px solid #e9d6a2;
  border-radius: 999px;
  pointer-events: none;
  z-index: 0;
  transition:
    transform 0.32s cubic-bezier(0.32, 0.72, 0, 1),
    width 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform, width;
`;

const Tab = styled.button`
  position: relative;
  z-index: 1;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: ${(p) => (p.$active ? '700' : '600')};
  white-space: nowrap;
  border-radius: 999px;
  background: transparent;
  border: 1px solid transparent;
  color: ${(p) => (p.$active ? '#8b6914' : '#8c8278')};
  transition: color 0.22s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.97);
  }
`;

export default function CategoryTabs({ categories, activeId, onSelect }) {
  const containerRef = useRef(null);
  const tabsRef = useRef({});
  const [indicator, setIndicator] = useState(null);

  useEffect(() => {
    const tab = tabsRef.current[activeId];
    if (!tab) return;
    setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });

    const container = containerRef.current;
    if (container) {
      const cRect = container.getBoundingClientRect();
      const tRect = tab.getBoundingClientRect();
      const offset =
        tRect.left - cRect.left - cRect.width / 2 + tRect.width / 2;
      container.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [activeId, categories?.length]);

  const setTabRef = (id) => (el) => {
    tabsRef.current[id] = el;
  };

  return (
    <ScrollContainer ref={containerRef}>
      <TabRow>
        {indicator && (
          <Indicator
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
            }}
          />
        )}
        <Tab
          ref={setTabRef('all')}
          $active={activeId === 'all'}
          onClick={() => onSelect('all')}
        >
          전체
        </Tab>
        {categories?.map((cat) => (
          <Tab
            key={cat._id}
            ref={setTabRef(cat._id)}
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
