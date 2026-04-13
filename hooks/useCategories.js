import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data),
  });
};
