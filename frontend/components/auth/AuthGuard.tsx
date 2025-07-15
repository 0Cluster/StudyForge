import { ReactNode, useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = () => {
      if (!isAuthenticated && !authLoading) {
        // Save the intended destination for redirect after login
        const returnUrl = encodeURIComponent(router.asPath);
        router.push(`/login?returnUrl=${returnUrl}`);
      } else if (isAuthenticated) {
        setAuthorized(true);
      }
      setLoading(false);
    };

    // Execute auth check on route change or when auth state changes
    checkAuth();

    // Listen to changes in the route
    const handleRouteChange = () => {
      checkAuth();
    };

    // Add event listener for route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up event listener when component unmounts
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, isAuthenticated, authLoading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If authorized, render children
  return authorized ? <>{children}</> : null;
};

export default AuthGuard;
