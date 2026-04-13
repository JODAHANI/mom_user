import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useProducts = (categoryId) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => {
      const params = { showOnTable: true };
      if (categoryId && categoryId !== 'all') {
        params.category = categoryId;
      }
      return api.get('/products', { params }).then(res => res.data);
    },
  });
};
