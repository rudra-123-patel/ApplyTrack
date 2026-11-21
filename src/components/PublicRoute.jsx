import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
