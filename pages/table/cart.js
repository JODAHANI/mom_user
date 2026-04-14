import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../../components/LoadingScreen';

export default function CartGate() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.sessionStorage.getItem('currentToken');
    if (token) {
      router.replace(
        { pathname: '/table/[token]/cart', query: { token } },
        '/table/cart'
      );
    } else {
      router.replace('/table');
    }
  }, [router]);

  return <LoadingScreen message="장바구니를 불러오고 있습니다" />;
}
