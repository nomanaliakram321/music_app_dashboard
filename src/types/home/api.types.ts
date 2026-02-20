import type { UseQueryOptions } from '@tanstack/react-query';

import type { Post } from './post.types';

// -------- GET POSTS --------
export type PostsResponse = Record<number, Post>;

// Props for the useGetPosts hook

export interface UseGetPostsProps<TParams extends Record<string, unknown> = Record<string, unknown>> {
  params?: TParams;
  options?: Omit<UseQueryOptions<PostsResponse, Error, PostsResponse, [string, TParams]>, 'queryKey' | 'queryFn'>;
}

// -------- CREATE POST --------
// Generic Params type — defaults to empty object if not specified
export interface CreatePostVariables<TParams extends Record<string, unknown> = Record<string, unknown>> {
  payload?: CreatePostPayload;
  params?: TParams;
}

export interface CreatePostPayload extends Record<string, unknown> {
  userId?: number;
  title?: string;
  body?: string;
}

export interface CreatePostResponse {
  userId?: number;
  id: number;
  title: string;
  body: string;
}
