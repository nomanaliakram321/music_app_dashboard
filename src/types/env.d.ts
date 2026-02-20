declare module '#env' {
  type EnvValue = string | number | boolean | null | undefined;

  interface EnvShape {
    VITE_BACKEND_BASE_URL: string;
    VITE_ENV: 'development' | 'staging' | 'production';
    VITE_SENTRY?: string;
    VITE_SENTRY_DSN?: string;
    VITE_SENTRY_SAMPLE_RATE?: string | number;
    VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE?: string | number;
    VITE_REPLAYS_ON_ERROR_SAMPLE_RATE?: string | number;
    VITE_ENCRYPTED_KEY: string;
    [key: string]: EnvValue;
  }

  const value: EnvShape;
  export default value;
}
