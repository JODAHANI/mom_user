import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export const useOrder = () => {
  return useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData).then(res => res.data),
  });
};
