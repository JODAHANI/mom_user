import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import api from '../lib/api';

const Banner = styled.div`
  margin: 12px 16px;
  padding: 20px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #d4a05a 0%, #9a6b2e 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
`;

const FirstLine = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FullContent = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
`;

const FoldButton = styled.button`
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
`;

export default function PromoBanner() {
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api.get('/notices').then((res) => res.data),
  });

  const notices = data?.data || data || [];
  if (notices.length === 0) return null;

  const notice = notices[0];
  const lines = notice.content.split('\n');
  const hasMore = lines.length > 1;

  return (
    <Banner onClick={() => hasMore && setExpanded((v) => !v)}>
      {expanded ? (
        <FullContent>{notice.content}</FullContent>
      ) : (
        <FirstLine>{lines[0]}</FirstLine>
      )}
    </Banner>
  );
}
