import type { UseMutationOptions } from '@tanstack/react-query';

// -------- LOGIN --------
export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface LoginVariables {
  payload: LoginPayload;
}

export type UseLoginMutationOptions = Omit<UseMutationOptions<LoginResponse, Error, LoginVariables>, 'mutationFn'>;
