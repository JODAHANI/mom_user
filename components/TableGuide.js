import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 24px;
  background: #f5f1eb;
  text-align: center;
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(26, 21, 16, 0.06);
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #1a1510;
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #5a5046;
`;

const SubDescription = styled.p`
  font-size: 13px;
  color: #8c8278;
  margin-top: 20px;
`;

export default function TableGuide() {
  return (
    <Wrapper>
      <IconCircle>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#c3904a" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#c3904a" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#c3904a" strokeWidth="2" />
          <rect x="14" y="14" width="3" height="3" fill="#c3904a" />
          <rect x="18" y="14" width="3" height="3" fill="#c3904a" />
          <rect x="14" y="18" width="3" height="3" fill="#c3904a" />
          <rect x="18" y="18" width="3" height="3" fill="#c3904a" />
        </svg>
      </IconCircle>
      <Title>QR코드를 스캔해주세요</Title>
      <Description>테이블에 비치된 QR코드를</Description>
      <Description>스캔하시면 메뉴를 확인하실 수 있습니다.</Description>
      <SubDescription>
        문의사항은 직원에게 편하게 말씀해주세요.
      </SubDescription>
    </Wrapper>
  );
}
