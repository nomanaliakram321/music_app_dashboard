import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const PAGE_LIMIT = 20;

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
