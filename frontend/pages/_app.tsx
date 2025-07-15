import '@/styles/globals.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AuthGuard from '@/components/auth/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a client
const queryClient = new QueryClient();

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Define paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/reset-password',
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.includes(router.pathname);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Layout>
            {isPublicPath ? (
              // Public page - no auth required
              <Component {...pageProps} />
            ) : (
              // Protected page - requires authentication
              <AuthGuard>
                <Component {...pageProps} />
              </AuthGuard>
            )}
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
