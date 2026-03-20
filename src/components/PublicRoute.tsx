import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
  const { currentUser } = useAuth();

  // If the user is already logged in, redirect them to the dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
