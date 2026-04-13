import styled from 'styled-components';

const Bar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: #c3904a;
  color: #fff;
  padding: 18px 20px;
  padding-bottom: calc(18px + env(safe-area-inset-bottom, 8px));
  border-radius: 16px 16px 0 0;
  display: ${(props) => (props.$visible ? 'flex' : 'none')};
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  z-index: 100;

  &:active {
    background: #a87a3a;
  }
`;

const Count = styled.span`
  font-size: 16px;
`;

const Total = styled.span`
  font-size: 17px;
  font-weight: 700;
`;

export default function CartBar({ count, total, onClick }) {
  return (
    <Bar $visible={count > 0} onClick={onClick}>
      <Count>총 {count}개</Count>
      <Total>{total?.toLocaleString()}원 주문하기</Total>
    </Bar>
  );
}
