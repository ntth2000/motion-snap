import type { ComponentType } from 'react';

import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import VideoPage from './pages/Video';

export type AppRoute = {
  path: string;
  name: 'login' | 'register' | 'dashboard' | 'video';
  Component: ComponentType;
  isPrivate?: boolean;
};

export const publicRoutes: readonly AppRoute[] = [
  { path: '/login', name: 'login', Component: LoginPage },
  { path: '/register', name: 'register', Component: RegisterPage },
] as const;

export const privateRoutes: readonly AppRoute[] = [
  { path: '/', name: 'dashboard', Component: DashboardPage },
  { path: '/video/:videoId', name: 'video', Component: VideoPage },
] as const;
