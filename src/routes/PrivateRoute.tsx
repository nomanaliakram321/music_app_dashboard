import { Navigate } from 'react-router-dom';

import { ROUTES } from '#/constants';
import { useToken } from '#/store';
import type { PrivateRouteProps } from '#/types/routes.types';

export function PrivateRoute({ children }: PrivateRouteProps) {
  const token = useToken();

  if (token) return children;

  return <Navigate to={ROUTES.LOGIN} replace />;
}
