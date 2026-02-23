import type { JSX } from 'react';
import React, { lazy, Suspense } from 'react';

import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';

import Layout from '#/components/layout/Layout';
import { ROUTES } from '#/constants';
import { PrivateRoute } from './PrivateRoute';

const Login = lazy(() => import('#/pages/Login'));
const Radio = lazy(() => import('#/pages/Radio'));
const Home = lazy(() => import('#/pages/Home'));
const Browse = lazy(() => import('#/pages/Browse'));
const Artist = lazy(() => import('#/pages/Artist'));
const Albums = lazy(() => import('#/pages/Albums'));

const LoadingFallback = (): JSX.Element => (
  <div className='flex items-center justify-center h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary' />
  </div>
);

const LazyComponent = ({ Component }: { Component: React.ComponentType }) => (
  <Suspense
    fallback={
      <div className='flex justify-center items-center min-h-screen'>
        <LoadingFallback />
      </div>
    }
  >
    <Component />
  </Suspense>
);

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={ROUTES.LOGIN} element={<LazyComponent Component={Login} />} />

      <Route
        path={ROUTES.HOME}
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path={ROUTES.HOME} element={<LazyComponent Component={Home} />} />
        <Route path={ROUTES.BROWSE} element={<LazyComponent Component={Browse} />} />
        <Route path={ROUTES.RADIO} element={<LazyComponent Component={Radio} />} />
        <Route path={ROUTES.ARTIST} element={<LazyComponent Component={Artist} />} />
        <Route path={ROUTES.ALBUMS} element={<LazyComponent Component={Albums} />} />

        <Route path='*' element={<Navigate to={'/'} replace />} />
      </Route>
    </>
  )
);
// export const router = createBrowserRouter([
//   {
//     path: ROUTES.LOGIN,
//     element: <LazyComponent Component={Login} />,
//   },
//   {
//     path: '/',
//     element: (
//       <PrivateRoute>
//         <Layout />
//       </PrivateRoute>
//     ),
//     children: [
//       {
//         index: true,
//         element: <Navigate to={ROUTES.PRODUCTS} replace />,
//       },

//       {
//         path: 'products',
//         element: <LazyComponent Component={Products} />,
//       },

//       {
//         path: 'products/:id',
//         element: <LazyComponent Component={ProductDetail} />,
//       },

//       {
//         path: '*',
//         element: <Navigate to={ROUTES.PRODUCTS} replace />,
//       },
//     ],
//   },
// ]);
