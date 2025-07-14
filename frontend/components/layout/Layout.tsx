import { ReactNode, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon, Dashboard, MenuBook, Assignment, Person, Logout } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Link from 'next/link';
// import { authService } from '@/services/api';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Check if user is authenticated
  // const isAuthenticated = authService.isAuthenticated();
  const isAuthenticated = true; // Placeholder for authentication check, replace with actual logic
  // const currentUser = authService.getCurrentUser();
  const currentUser = { username: 'JohnDoe' }; // Placeholder for current user, replace with actual logic

  // Handle logout
  const handleLogout = () => {
    // authService.logout();
    router.push('/login');
  };

  // Toggle drawer
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  // Menu items for authenticated users
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },
    { text: 'My Syllabi', icon: <MenuBook />, href: '/syllabi' },
    { text: 'Assignments', icon: <Assignment />, href: '/assignments' },
    { text: 'Profile', icon: <Person />, href: '/profile' },
  ];

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          StudyForge
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Link href={item.href} key={item.text} passHref legacyBehavior>
            <ListItem button component="a">
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isAuthenticated && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" passHref legacyBehavior>
              <a style={{ color: 'white', textDecoration: 'none' }}>StudyForge</a>
            </Link>
          </Typography>
          {isAuthenticated ? (
            <Typography variant="body1" sx={{ mr: 2 }}>
              {currentUser?.username}
            </Typography>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} href="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}{new Date().getFullYear()}{' StudyForge. All rights reserved.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
