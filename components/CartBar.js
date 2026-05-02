import styled, { keyframes } from 'styled-components';
import { formatPrice } from '../lib/format';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const Bar = styled.div`
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  max-width: 448px;
  margin: 0 auto;
  background: #c3904a;
  color: #fff;
  padding: 16px 20px;
  border-radius: 16px;
  display: ${(props) => (props.$visible ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 6px 20px rgba(195, 144, 74, 0.4);
  animation: ${bounce} 1.6s ease-in-out infinite;

  &:active {
    background: #a87a3a;
    animation-play-state: paused;
  }

  ${(props) =>
    props.$pending &&
    `
    background: #d1cbc3;
    box-shadow: none;
    animation: none;
    pointer-events: none;
  `}
`;

const CountBubble = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: 12px;
  background: #fff;
  color: #c3904a;
  font-size: 13px;
  font-weight: 800;
`;

const Label = styled.span`
  font-size: 18px;
  font-weight: 700;
`;

export default function CartBar({ count, total, onClick, pending }) {
  return (
    <Bar $visible={count > 0} $pending={pending} onClick={onClick}>
      <CountBubble>{count}</CountBubble>
      <Label>{pending ? '주문 중...' : `${formatPrice(total)} 주문하기`}</Label>
    </Bar>
  );
}
