import { BADGE_VARIANTS } from '#/constants';
import type { BadgeProps } from '#/types/common/badge.types';

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
