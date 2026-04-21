import styled from 'styled-components';

const HeaderWrapper = styled.header`
  background: #fff;
  padding: calc(env(safe-area-inset-top, 0px) + 32px) 24px 20px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
`;

const Identity = styled.div`
  flex: 1;
  min-width: 0;
`;

const StoreName = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #1a1510;
  letter-spacing: -0.3px;
`;

const TableInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 15px;
  color: #8c8278;
  font-weight: 500;
`;

const StaffCallPill = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 16px;
  border-radius: 999px;
  background: #fff8e6;
  color: #8b6914;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid #f5e0a6;

  &:active {
    background: #fceec3;
  }
`;

const ActionBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ActionButton = styled.button`
  position: relative;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f5f1eb;
  color: #5a5046;
  font-size: 17px;
  font-weight: 700;

  &:active {
    background: #ede6d8;
  }
`;

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C10.9 2 10 2.9 10 4C10 4.1 10 4.2 10.03 4.3C7.69 5.03 6 7.24 6 9.83V15L4 17V18H20V17L18 15V9.83C18 7.24 16.31 5.03 13.97 4.3C14 4.2 14 4.1 14 4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="#F5C518"/>
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#c3904a"/>
  </svg>
);

export default function Header({ table, onStaffCall, onOrderHistory, onCart }) {
  return (
    <HeaderWrapper>
      <TopRow>
        <Identity>
          <StoreName>장유해신탕</StoreName>
          {table && (
            <TableInfo>
              <PinIcon />
              {table.floor}층 {table.number}번 테이블
            </TableInfo>
          )}
        </Identity>
        <StaffCallPill onClick={onStaffCall}>
          <BellIcon />
          직원호출
        </StaffCallPill>
      </TopRow>
      <ActionBar>
        <ActionButton onClick={onCart}>장바구니</ActionButton>
        <ActionButton onClick={onOrderHistory}>주문내역</ActionButton>
      </ActionBar>
    </HeaderWrapper>
  );
}
