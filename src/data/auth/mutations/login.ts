import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { apiEndpoints } from '#/constants';
import { POST } from '#/constants';
import { performRequest } from '#/services/apiClient';
import { useAuthStore } from '#/store';
import type { LoginResponse, LoginVariables, LoginPayload, UseLoginMutationOptions } from '#/types/auth/api.types';

export const useLoginMutation = (
  options?: UseLoginMutationOptions,
  onError?: (error: Error) => void
): UseMutationResult<LoginResponse, Error, LoginVariables> => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: (variables: LoginVariables) => {
      const payload: LoginPayload = variables.payload;

      return performRequest<LoginResponse, Record<string, unknown>>({
        method: POST,
        url: apiEndpoints.AUTH_LOGIN,
        payload: payload as unknown as Record<string, unknown>,
      });
    },
    onSuccess: (data: LoginResponse) => {
      login(data.accessToken);
      toast.success('Login successful!');
      navigate('/', { replace: true });
    },

    onError,
    ...options,
  });
};
