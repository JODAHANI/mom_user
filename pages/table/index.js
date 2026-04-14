import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TableGuide from '../../components/TableGuide';
import LoadingScreen from '../../components/LoadingScreen';

export default function TableGate() {
  const router = useRouter();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.sessionStorage.getItem('currentToken');
    if (token) {
      router.replace(
        { pathname: '/table/[token]', query: { token } },
        '/table'
      );
    } else {
      setShowGuide(true);
    }
  }, [router]);

  if (!showGuide) return <LoadingScreen message="메뉴를 불러오고 있습니다" />;
  return <TableGuide />;
}
