import styled from 'styled-components';

const Bar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: #3182F6;
  color: #fff;
  padding: 16px 20px;
  border-radius: 16px 16px 0 0;
  display: ${(props) => (props.$visible ? 'flex' : 'none')};
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  z-index: 100;

  &:active {
    background: #1B6CE5;
  }
`;

const Count = styled.span`
  font-size: 15px;
`;

const Total = styled.span`
  font-size: 16px;
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
