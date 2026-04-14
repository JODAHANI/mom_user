import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-12px);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f1eb;
  animation: ${fadeIn} 0.2s ease;
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c3904a;
  animation: ${bounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const Caption = styled.p`
  margin-top: 18px;
  font-size: 13px;
  color: #8c8278;
  letter-spacing: 0.02em;
  animation: ${pulse} 1.6s ease-in-out infinite;
`;

export default function LoadingScreen({ message = '잠시만 기다려주세요' }) {
  return (
    <Wrapper>
      <Dots>
        <Dot $delay="0s" />
        <Dot $delay="0.15s" />
        <Dot $delay="0.3s" />
      </Dots>
      {message && <Caption>{message}</Caption>}
    </Wrapper>
  );
}
