// types/apiClient.types.ts
export interface RequestParams<TParams extends Record<string, unknown> = Record<string, unknown>> {
  url: string;
  params?: TParams;
}

export interface RequestWithPayload<
  TPayload extends object,
  TParams extends Record<string, unknown> = Record<string, unknown>,
> extends RequestParams<TParams> {
  payload?: TPayload;
}
