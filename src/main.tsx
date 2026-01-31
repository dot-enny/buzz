import React, { Suspense, lazy, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Notification } from './components/notification/Notification.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { RouteErrorBoundary } from './components/ui/ErrorBoundary.tsx'
import { Spinner } from './components/ui/Spinner.tsx'

// Remove initial loader once React hydrates
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease';
    setTimeout(() => loader.remove(), 300);
  }
  document.body.classList.add('app-loaded');
};

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home.tsx'))
const SignIn = lazy(() => import('./pages/SignIn.tsx').then(m => ({ default: m.SignIn })))
const SignUp = lazy(() => import('./pages/SignUp.tsx').then(m => ({ default: m.SignUp })))
const AuthLayout = lazy(() => import('./layouts/Auth.tsx').then(m => ({ default: m.AuthLayout })))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
    <Spinner />
  </div>
)

// App wrapper to handle initial loader removal
const App = () => {
  useEffect(() => {
    removeInitialLoader();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Notification />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute><Home /></ProtectedRoute>
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'sign-in', element: <Suspense fallback={<PageLoader />}><SignIn /></Suspense> },
      { path: 'sign-up', element: <Suspense fallback={<PageLoader />}><SignUp /></Suspense> },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
