import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardActions, 
  Button, CircularProgress, Chip, LinearProgress, Divider
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { authService } from '@/services/api';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { User, Syllabus, Progress } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize empty syllabi array
  

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    
    // Load user's syllabi
    const fetchSyllabi = async () => {
      setLoading(true);
      try {
        // Get syllabi for current user
        const data = await syllabusService.getAllByUser(currentUser.id);
        
        // For each syllabus, load the progress data
        const syllabusWithProgress = await Promise.all(
          data.map(async (syllabus) => {
            // If syllabus has topics, fetch progress for each topic
            if (syllabus.topics && syllabus.topics.length > 0) {
              // Get all progress data for this syllabus
              const progressData = await topicService.getSyllabusProgress(syllabus.id);
              
              // Associate progress with each topic
              const updatedTopics = syllabus.topics.map(topic => {
                const topicProgress = progressData.find(p => p.topicId === topic.id);
                return {
                  ...topic,
                  progress: topicProgress || undefined
                };
              });
              
              return {
                ...syllabus,
                topics: updatedTopics
              };
            }
            
            return syllabus;
          })
        );
        
        setSyllabi(syllabusWithProgress);
      } catch (err) {
        console.error('Error fetching syllabi:', err);
        setError('Failed to load syllabi. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabi();
  }, [router]);

  // Calculate overall progress for a syllabus
  const calculateOverallProgress = (syllabus: Syllabus): number => {
    if (!syllabus.topics || syllabus.topics.length === 0) return 0;
    
    const totalTopics = syllabus.topics.length;
    const totalProgress = syllabus.topics.reduce((sum, topic) => {
      return sum + (topic.progress?.completionPercentage || 0);
    }, 0);
    
    return Math.round(totalProgress / totalTopics);
  };

  // Format date string
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - StudyForge</title>
        <meta name="description" content="Your StudyForge learning dashboard" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.firstName || user?.username}!
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Your Study Materials
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/syllabi/upload')}
          >
            Upload New Syllabus
          </Button>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Grid container spacing={3}>
          {syllabi.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    You don't have any study materials yet.
                  </Typography>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => router.push('/syllabi/upload')}
                    >
                      Upload Your First Syllabus
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            syllabi.map((syllabus) => (
              <Grid item xs={12} md={6} lg={4} key={syllabus.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {syllabus.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {syllabus.description || 'No description'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                        <strong>Progress:</strong>
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateOverallProgress(syllabus)} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
                        {calculateOverallProgress(syllabus)}%
                      </Typography>
                    </Box>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Start:</strong> {formatDate(syllabus.startDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>End:</strong> {formatDate(syllabus.endDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Topics:</strong> {syllabus.topics?.length || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} href={`/syllabi/${syllabus.id}`}>
                      View Details
                    </Button>
                    <Button size="small" component={Link} href={`/syllabi/${syllabus.id}/topics`}>
                      View Topics
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            {syllabi.length === 0 ? (
              <Typography variant="body1">
                No recent activity to show. Upload your first syllabus to get started!
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {(syllabi.flatMap(syllabus => 
                  syllabus.topics
                    ?.filter(topic => topic.progress?.startedAt)
                    .slice(0, 5)
                    .map(topic => (
                      <Grid item xs={12} key={topic.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1">
                              {topic.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              From: {syllabus.title}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                              label={topic.progress?.completed ? 'Completed' : 'In Progress'} 
                              color={topic.progress?.completed ? 'success' : 'primary'} 
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {topic.progress?.completionPercentage}% complete
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )) || [])
                )}
                {syllabi.some(s => s.topics?.some(t => t.progress?.startedAt)) ? null : (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      You haven't started studying any topics yet.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
