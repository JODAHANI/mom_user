import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../../components/LoadingScreen';

export default function OrdersGate() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.sessionStorage.getItem('currentToken');
    if (token) {
      router.replace(
        { pathname: '/table/[token]/orders', query: { token } },
        '/table/orders'
      );
    } else {
      router.replace('/table');
    }
  }, [router]);

  return <LoadingScreen message="주문내역을 불러오고 있습니다" />;
}
