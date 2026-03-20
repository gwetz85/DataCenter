import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../utils/permissions';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // If the user tries to go to a path they aren't allowed to, redirect them to dashboard
  if (!canAccessMenu(user.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
