import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () =>
      api
        .get('/products', { params: { showOnTable: true } })
        .then((res) => res.data),
  });
};
