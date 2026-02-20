import { z } from 'zod';

/**
 * Zod schema for User Registration Form validation.
 */
export const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z
    .number({ invalid_type_error: 'Age is required' })
    .min(18, 'You must be at least 18')
    .max(100, 'Age must be 100 or less'),
});

/**
 * Type inferred directly from the schema
 * Keeps types and validation in sync
 */
export type UserFormData = z.infer<typeof userFormSchema>;
