import styled from 'styled-components';

const HeaderWrapper = styled.header`
  background: #fff;
  padding: 0 16px 16px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 0;
`;

const StaffCallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #5a5046;
  background: none;

  &:active {
    background: #f5f1eb;
  }
`;

const BellIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C10.9 2 10 2.9 10 4C10 4.1 10 4.2 10.03 4.3C7.69 5.03 6 7.24 6 9.83V15L4 17V18H20V17L18 15V9.83C18 7.24 16.31 5.03 13.97 4.3C14 4.2 14 4.1 14 4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="#F5C518"/>
  </svg>
);

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: none;

  &:active {
    background: #f5f1eb;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #c3904a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OrderIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <text x="12" y="18" textAnchor="middle" fontSize="20" fontWeight="700" fill="#8c8278" fontFamily="sans-serif">&#x20A9;</text>
  </svg>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#8c8278" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="#8c8278" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="#8c8278" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoSection = styled.div`
  margin-top: 2px;
  padding: 8px 12px 4px;
`;

const StoreName = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: #1a1510;
`;

const SubLine = styled.p`
  font-size: 13px;
  color: #8c8278;
  margin-top: 4px;
`;

export default function Header({ table, cartCount, onStaffCall, onOrderHistory, onCart }) {
  return (
    <HeaderWrapper>
      <TopBar>
        <StaffCallButton onClick={onStaffCall}>
          <BellIcon />
          직원호출
        </StaffCallButton>
        <IconGroup>
          <IconButton onClick={onOrderHistory}>
            <OrderIcon />
          </IconButton>
          <IconButton onClick={onCart}>
            <CartIcon />
            {cartCount > 0 && <Badge>{cartCount}</Badge>}
          </IconButton>
        </IconGroup>
      </TopBar>
      <InfoSection>
        <StoreName>장유해신탕</StoreName>
        {table && (
          <SubLine>{table.floor}층 {table.number}번 테이블</SubLine>
        )}
      </InfoSection>
    </HeaderWrapper>
  );
}
