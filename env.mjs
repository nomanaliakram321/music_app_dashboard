import { z } from 'zod';

const envSchema = z.object({
  VITE_BACKEND_BASE_URL: z.string().url(),
  VITE_ENV: z.enum(['development', 'staging', 'production']),
  VITE_SENTRY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_SENTRY_SAMPLE_RATE: z.preprocess(val => Number(val), z.number().min(0).max(1)).optional(),
  VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: z.preprocess(val => Number(val), z.number().min(0).max(1)).optional(),
  VITE_REPLAYS_ON_ERROR_SAMPLE_RATE: z.preprocess(val => Number(val), z.number().min(0).max(1)).optional(),
  VITE_ENCRYPTED_KEY: z.string().min(1),
});

let env;

try {
  env = envSchema.parse(import.meta.env);
} catch (error) {
  if (error.name === 'ZodError') {
    const missingKeys = error.errors
      .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
      .map(e => e.path.join('.'));
    const otherErrors = error.errors
      .filter(e => !(e.code === 'invalid_type' && e.received === 'undefined'))
      .map(e => `${e.path.join('.')}: ${e.message}`);

    let message = '';

    if (missingKeys.length) {
      message += `Missing required environment variables: ${missingKeys.join(', ')}.\n`;
    }

    if (otherErrors.length) {
      message += `Other environment variable errors:\n - ${otherErrors.join('\n - ')}`;
    }

    throw new Error(
      `❌ Environment validation failed:\n${message}\nPlease check your .env file and add the missing or correct the invalid keys.`
    );
  }

  throw error;
}

export default env;
