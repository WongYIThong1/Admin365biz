/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserManage } from './pages/UserManage';
import { AccountBookManage } from './pages/AccountBookManage';
import { TeamManage } from './pages/TeamManage';
import { VersionControl } from './pages/VersionControl';
import { DatabaseMonitor } from './pages/DatabaseMonitor';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isLoading } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/users" element={<UserManage />} />
      <Route path="/account-books" element={<AccountBookManage />} />
      <Route path="/teams" element={<TeamManage />} />
      <Route path="/versions" element={<VersionControl />} />
      <Route path="/database-monitor" element={<DatabaseMonitor />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  if (isLoginPage) {
    return routes;
  }

  return <Layout>{routes}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
