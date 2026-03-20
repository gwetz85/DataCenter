import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../utils/permissions';

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading..</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If the user tries to go to a path they aren't allowed to, redirect them to dashboard
  if (!canAccessMenu(currentUser.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
