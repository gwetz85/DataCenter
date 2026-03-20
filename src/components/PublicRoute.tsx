import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading..</div>;
  }

  // If the user is already logged in, redirect them to the dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
