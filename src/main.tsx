import React from 'react'
import ReactDOM from 'react-dom/client'
import Home from './pages/Home.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SignIn } from './pages/SignIn.tsx'
import { SignUp } from './pages/SignUp.tsx'
import { AuthLayout } from './layouts/Auth.tsx'
import { Notification } from './components/notification/Notification.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { 
    path: '/auth', 
    element: <AuthLayout />,
    children: [
      { path: 'sign-in', element: <SignIn />, },
      { path: 'sign-up', element: <SignUp /> },
    ]
   },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Notification />
  </React.StrictMode>,
)
