import { useEffect, useState } from 'react';
import styled from 'styled-components';

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
  margin-bottom: 26px;
`;

const Chip = styled.button`
  height: 96px;
  border-radius: 12px;
  background: ${(p) => (p.$active ? '#fff5d8' : '#f4f0e7')};
  border: 1.5px solid ${(p) => (p.$active ? '#f5c518' : 'transparent')};
  color: #1a1510;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;

  &:active {
    transform: scale(0.97);
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 10px;
`;

const ActionBtn = styled.button`
  height: 54px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
  background: ${(p) => (p.$primary ? '#a9c4f7' : '#ede7da')};
  color: ${(p) => (p.$primary ? '#1a3a7a' : '#1a1510')};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  transition: opacity 0.15s ease, background 0.15s ease;

  &:active {
    background: ${(p) => (p.$primary ? '#8eb1ef' : '#dfd6c2')};
  }
`;

const Empty = styled.div`
  padding: 30px 0 40px;
  text-align: center;
  color: #8c8278;
  font-size: 14px;
`;

export default function StaffCallSheet({ open, onClose, onSubmit, items = [], submitting = false }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const canSubmit = selected.length > 0 && !submitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(selected);
  };

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Sheet $open={open} role="dialog" aria-modal="true">
        <Grabber />
        <Title>무엇을 도와드릴까요?</Title>

        {items.length === 0 ? (
          <Empty>등록된 호출 항목이 없습니다</Empty>
        ) : (
          <Grid>
            {items.map((it) => (
              <Chip
                key={it._id || it.name}
                $active={selected.includes(it.name)}
                onClick={() => toggle(it.name)}
              >
                {it.name}
              </Chip>
            ))}
          </Grid>
        )}

        <Actions>
          <ActionBtn onClick={onClose} disabled={submitting}>
            닫기
          </ActionBtn>
          <ActionBtn $primary onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? '호출중...' : '호출하기'}
          </ActionBtn>
        </Actions>
      </Sheet>
    </>
  );
}
