import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { apiEndpoints } from '#/constants';
import { POST } from '#/constants';
import { performRequest } from '#/services/apiClient';
import type { CreatePostResponse, CreatePostVariables, CreatePostPayload } from '#/types/home/api.types';

/**
 * Custom hook to send a POST request to create a new user.
 *
 * This mutation will typically be used in:
 * `data/home/mutations/createPosts.ts` to separate the data layer from components.
 */
export const useCreatePost = <TParams extends Record<string, unknown> = Record<string, unknown>>(
  onSuccess?: (data: CreatePostResponse) => void,
  onError?: (error: Error) => void,
  options?: UseMutationOptions<CreatePostResponse, Error, CreatePostVariables<TParams>>
): UseMutationResult<CreatePostResponse, Error, CreatePostVariables<TParams>> => {
  return useMutation<CreatePostResponse, Error, CreatePostVariables<TParams>>({
    mutationFn: (variables?: CreatePostVariables<TParams>) => {
      const payload: CreatePostPayload = variables?.payload ?? ({} as CreatePostPayload);
      const params: TParams = variables?.params ?? ({} as TParams);

      return performRequest({
        method: POST,
        url: apiEndpoints.POSTS,
        payload,
        params,
      });
    },
    onSuccess,
    onError,
    ...options,
  });
};
