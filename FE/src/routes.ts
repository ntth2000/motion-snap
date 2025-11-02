import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import VideoPage from './pages/Video';
import type { ComponentType } from 'react';

export type AppRoute = {
  path: string;
  name: 'login' | 'register' | 'dashboard' | 'video';
  Component: ComponentType;
  isPrivate?: boolean;
};

export const routes: readonly AppRoute[] = [
  { path: '*', name: 'dashboard', Component: DashboardPage, isPrivate: true },
  { path: '/login', name: 'login', Component: LoginPage },
  { path: '/register', name: 'register', Component: RegisterPage },
  { path: '/video/:id', name: 'video', Component: VideoPage, isPrivate: true },
] as const;
