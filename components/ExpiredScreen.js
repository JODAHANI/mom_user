import { useState } from 'react';
import styled from 'styled-components';
import OrderHistory from './OrderHistory';

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
  margin-bottom: 8px;
`;

const SubDescription = styled.p`
  font-size: 13px;
  color: #8c8278;
`;

const HistoryLink = styled.button`
  margin-top: 32px;
  font-size: 14px;
  color: #c3904a;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 8px;
`;

export default function ExpiredScreen({ tableId, sessionStartedAt, sessionClearedAt, expiredClearedAt }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const canShowHistory = !!tableId && !!sessionStartedAt;

  return (
    <Wrapper>
      <IconCircle>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill="#c3904a"
          />
        </svg>
      </IconCircle>
      <Title>결제가 완료되었습니다.</Title>
      <Description style={{ marginTop: 8 }}>오늘 방문해주셔서 진심으로 감사합니다.</Description>
      <Description>편안한 시간 보내셨길 바랍니다.</Description>
      <SubDescription style={{ marginTop: 20 }}>
        추가 주문은 QR코드를 다시 스캔해주세요.
      </SubDescription>
      <SubDescription>
        문의사항은 직원에게 편하게 말씀해주세요.
      </SubDescription>
      {canShowHistory && (
        <HistoryLink onClick={() => setHistoryOpen(true)}>이전 주문내역 보기</HistoryLink>
      )}
      {canShowHistory && (
        <OrderHistory
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          tableId={tableId}
          sessionClearedAt={sessionClearedAt}
          before={expiredClearedAt}
        />
      )}
    </Wrapper>
  );
}
