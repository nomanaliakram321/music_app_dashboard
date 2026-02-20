import { z } from 'zod';

/**
 * Zod schema for Login Form validation.
 */
export const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Type inferred directly from the schema
 * Keeps types and validation in sync
 */
export type LoginFormData = z.infer<typeof loginFormSchema>;
