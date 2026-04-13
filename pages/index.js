import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #3182F6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const PhoneSvg = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="white" strokeWidth="2" />
    <line x1="12" y1="18" x2="12" y2="18.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #191F28;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #8B95A1;
  line-height: 1.5;
  max-width: 260px;
`;

export default function Home() {
  return (
    <Container>
      <IconWrapper>
        <PhoneSvg />
      </IconWrapper>
      <Title>QR코드를 스캔해주세요</Title>
      <Subtitle>테이블의 QR코드를 스캔하면 메뉴를 확인할 수 있습니다</Subtitle>
    </Container>
  );
}
