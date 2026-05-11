import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useCallItems = () => {
  return useQuery({
    queryKey: ['call-items'],
    queryFn: () => api.get('/call-items').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};
