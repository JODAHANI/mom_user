import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import api from '../lib/api';

const Banner = styled.div`
  margin: 12px 16px 4px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #FBF8F1;
  border: 1px solid #d8cdb8;
  color: #5a5046;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.98);
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
  color: #8c8278;
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
