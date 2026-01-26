import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export function AdminRoute({ children, requiredRole = 'admin' }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole();

  // Debug logging
  console.log('AdminRoute state:', { 
    authLoading, 
    roleLoading, 
    user: user?.email, 
    roles 
  });

  // Show loading while checking auth and roles
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('AdminRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = roles.includes(requiredRole);
  
  if (!hasRequiredRole) {
    console.log('AdminRoute: User lacks required role, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute: Access granted');
  return <>{children}</>;
}
