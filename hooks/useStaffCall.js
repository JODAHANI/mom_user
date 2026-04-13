import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export const useStaffCall = () => {
  return useMutation({
    mutationFn: (data) => api.post('/staff-calls', data).then(res => res.data),
  });
};
