import type { AxiosRequestConfig, Method } from 'axios';

import axiosInstance from './axiosInstance';

/**
 * Generic function to perform an API request using Axios.
 *
 * @template TResponse - The expected response type.
 * @template TPayload - The request body type (defaults to object or undefined).
 * @template TParams - The query parameter type (defaults to object).
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param url - API endpoint URL.
 * @param payload - Optional request body (ignored for GET).
 * @param params - Optional query parameters.
 * @param config - Optional Axios request configuration.
 * @returns The response data typed as `TResponse`.
 */

export const performRequest = async <
  TResponse,
  TPayload extends Record<string, unknown> | undefined = undefined,
  TParams extends Record<string, unknown> = Record<string, unknown>,
>({
  method,
  url,
  payload,
  params,
  config,
}: {
  method: Method;
  url: string;
  payload?: TPayload;
  params?: TParams;
  config?: AxiosRequestConfig;
}): Promise<TResponse> => {
  const res = await axiosInstance.request<TResponse>({
    method,
    url,
    params,
    data: payload,
    ...config,
  });
  return res.data;
};
