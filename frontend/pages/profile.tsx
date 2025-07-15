import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Paper, CircularProgress, 
  Grid, TextField, Avatar, Card, CardContent, Divider, 
  List, ListItem, ListItemText, ListItemAvatar, LinearProgress,
  Alert, Snackbar
} from '@mui/material';
import { 
  PersonOutline, Save, Edit, AssignmentTurnedIn, MenuBook, 
  TrendingUp, School
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { authService } from '@/services/api';
import { userService } from '@/services/user';
import { syllabusService } from '@/services/syllabus';
import { User, Syllabus } from '@/types';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [recentSyllabi, setRecentSyllabi] = useState<Syllabus[]>([]);
  
  // Initialize empty array for recent syllabi

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get current user profile data
        const userData = await userService.getCurrentUser();
        setUser(userData);
        
        // Get recent syllabi for the user
        const syllabi = await syllabusService.getAllByUser(userData.id);
        // Sort by most recent first and limit to 5
        const sortedSyllabi = syllabi
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        setRecentSyllabi(sortedSyllabi);
        
        // Initialize form data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email,
          password: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);

  const handleEditToggle = () => {
    setEditing(!editing);
    // Reset error when toggling edit mode
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match if password field is filled
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare update data (exclude empty password fields)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {})
      };
      
      // Update user profile with API
      const updatedUser = await userService.updateProfile(updateData);
      
      // Update local user state with the returned user data
      setUser(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = (): string => {
    if (!user) return '';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };

  // Format date string
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - StudyForge</title>
        <meta name="description" content="Your StudyForge profile" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'primary.main', 
                  fontSize: '2.5rem',
                  mb: 2
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                @{user?.username}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <School />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Course Materials"
                  secondary={`${recentSyllabi.length} syllabi`}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <AssignmentTurnedIn />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Completed Assignments"
                  secondary="12 assignments"
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <TrendingUp />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Overall Progress"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={65} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2">65%</Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => router.push('/dashboard')}
              >
                View Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2">
                {editing ? 'Edit Profile' : 'Profile Information'}
              </Typography>
              <Button 
                startIcon={editing ? <Save /> : <Edit />}
                variant={editing ? 'contained' : 'outlined'}
                onClick={editing ? undefined : handleEditToggle}
                type={editing ? 'submit' : 'button'}
                form={editing ? 'profile-form' : undefined}
              >
                {editing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box 
              component="form" 
              id="profile-form"
              onSubmit={handleSubmit}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    value={user?.username}
                    fullWidth
                    disabled
                    helperText="Username cannot be changed"
                  />
                </Grid>
                
                {editing && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Change Password (leave blank to keep current password)
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                  </>
                )}
              </Grid>
              
              {editing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={handleEditToggle}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Recent Activity
            </Typography>
            
            <List>
              {recentSyllabi.map((syllabus) => (
                <ListItem 
                  key={syllabus.id}
                  sx={{ 
                    mb: 1, 
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}
                  button
                  onClick={() => router.push(`/syllabi/${syllabus.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <MenuBook />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={syllabus.title}
                    secondary={`Added on ${formatDate(syllabus.createdAt)}`}
                  />
                </ListItem>
              ))}
            </List>
            
            {recentSyllabi.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No recent activity to show.
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => router.push('/syllabi')}
              >
                View All Syllabi
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
