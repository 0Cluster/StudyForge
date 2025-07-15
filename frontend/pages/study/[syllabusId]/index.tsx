import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Box, Typography, Container, Button, Grid, Card, 
  CardContent, LinearProgress, Divider, Paper, 
  List, ListItem, ListItemText, ListItemIcon, 
  Chip, Stepper, Step, StepLabel, CircularProgress,
  Tooltip, IconButton
} from '@mui/material';
import { 
  ArrowBack, Check, AccessTime, CalendarToday, 
  ChevronRight, CheckCircle, Assignment, Notes,
  Timer, PlayArrow, NotStarted
} from '@mui/icons-material';
import Link from 'next/link';
import { authService } from '@/services/api';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { assignmentService } from '@/services/assignment';
import { Syllabus, Topic } from '@/types';

export default function StudyPage() {
  const router = useRouter();
  const { syllabusId } = router.query;
  
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const fetchSyllabus = async () => {
      if (!syllabusId) return; // Wait until id is available from router

      setLoading(true);
      try {
        // Get syllabus details with topics
        const syllabusData = await syllabusService.getById(Number(syllabusId));
        
        // If topics are not included in the response, fetch them separately
        if (!syllabusData.topics) {
          const topics = await topicService.getAllBySyllabus(Number(syllabusId));
          
          // For each topic, fetch its progress and assignments
          const topicsWithDetails = await Promise.all(
            topics.map(async (topic) => {
              let topicWithDetails = { ...topic };
              
              try {
                const progress = await topicService.getProgress(topic.id);
                topicWithDetails.progress = progress;
              } catch (err) {
                console.error(`Error fetching progress for topic ${topic.id}:`, err);
                // Set default progress if not found
                topicWithDetails.progress = {
                  id: 0,
                  completed: false,
                  completionPercentage: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  topicId: topic.id
                };
              }
              
              try {
                const assignments = await assignmentService.getAllByTopic(topic.id);
                topicWithDetails.assignments = assignments;
              } catch (err) {
                console.error(`Error fetching assignments for topic ${topic.id}:`, err);
                topicWithDetails.assignments = [];
              }
              
              return topicWithDetails;
            })
          );
          
          syllabusData.topics = topicsWithDetails;
        }
        
        setSyllabus(syllabusData);
      } catch (err) {
        console.error('Error fetching syllabus:', err);
        setError('Failed to load syllabus details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabus();
  }, [router, syllabusId]);

  // Helper functions
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate overall progress
  const calculateOverallProgress = (syllabus: Syllabus | null): number => {
    if (!syllabus || !syllabus.topics || syllabus.topics.length === 0) return 0;
    
    const totalTopics = syllabus.topics.length;
    const totalProgress = syllabus.topics.reduce((sum, topic) => {
      return sum + (topic.progress?.completionPercentage || 0);
    }, 0);
    
    return Math.round(totalProgress / totalTopics);
  };

  // Find next topic to study
  const findNextTopicToStudy = (syllabus: Syllabus | null): Topic | null => {
    if (!syllabus || !syllabus.topics || syllabus.topics.length === 0) return null;
    
    // First, look for topics in progress
    const inProgressTopic = syllabus.topics.find(topic => {
      const progress = topic.progress?.completionPercentage || 0;
      return progress > 0 && progress < 100;
    });
    
    if (inProgressTopic) return inProgressTopic;
    
    // If no topics in progress, find first not started topic
    const notStartedTopic = syllabus.topics.find(topic => {
      return !topic.progress || topic.progress.completionPercentage === 0;
    });
    
    if (notStartedTopic) return notStartedTopic;
    
    // If all topics are completed, return null
    return null;
  };

  // Get upcoming assignments
  const getUpcomingAssignments = (syllabus: Syllabus | null) => {
    if (!syllabus || !syllabus.topics) return [];
    
    const allAssignments = syllabus.topics.flatMap(topic => 
      (topic.assignments || [])
        .filter(assignment => !assignment.completed)
        .map(assignment => ({ ...assignment, topicTitle: topic.title }))
    );
    
    // Sort by due date (ascending)
    return allAssignments.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }).slice(0, 5); // Return top 5
  };

  // Get recently studied topics
  const getRecentlyStudiedTopics = (syllabus: Syllabus | null) => {
    if (!syllabus || !syllabus.topics) return [];
    
    const topicsWithProgress = syllabus.topics
      .filter(topic => topic.progress && topic.progress.startedAt)
      .map(topic => ({
        ...topic,
        lastStudied: topic.progress?.updatedAt || topic.progress?.startedAt || ''
      }));
    
    // Sort by last studied date (descending)
    return topicsWithProgress.sort((a, b) => {
      return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
    }).slice(0, 3); // Return top 3
  };

  const overallProgress = calculateOverallProgress(syllabus);
  const nextTopic = findNextTopicToStudy(syllabus);
  const upcomingAssignments = getUpcomingAssignments(syllabus);
  const recentTopics = getRecentlyStudiedTopics(syllabus);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !syllabus) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center" sx={{ my: 4 }}>
          {error || 'Syllabus not found'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            component={Link}
            href="/syllabi"
            startIcon={<ArrowBack />}
          >
            Back to Syllabi
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Study: {syllabus.title} | StudyForge</title>
        <meta name="description" content={`Study dashboard for ${syllabus.title}`} />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button 
              component={Link}
              href="/syllabi"
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back to Syllabi
            </Button>
            <Typography variant="h4" component="h1">
              {syllabus.title}
            </Typography>
          </Box>
          
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" paragraph>
                    {syllabus.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Overall Progress:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={overallProgress === 100 ? 'success.main' : 'primary.main'}
                      >
                        {overallProgress}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={overallProgress} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={overallProgress === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Topics
                      </Typography>
                      <Typography variant="h6">
                        {syllabus.topics.filter(t => (t.progress?.completionPercentage || 0) === 100).length}/{syllabus.topics.length}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Assignments
                      </Typography>
                      <Typography variant="h6">
                        {syllabus.topics.reduce((sum, topic) => {
                          return sum + ((topic.assignments?.filter(a => a.completed)?.length) || 0);
                        }, 0)}/{syllabus.topics.reduce((sum, topic) => {
                          return sum + ((topic.assignments?.length) || 0);
                        }, 0)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="h6">
                        {formatDuration(syllabus.topics.reduce((sum, topic) => {
                          return sum + (topic.estimatedDurationMinutes || 0);
                        }, 0))}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Timeline
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(syllabus.startDate)} - {formatDate(syllabus.endDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  {nextTopic ? (
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Continue Studying
                      </Typography>
                      
                      <Typography variant="subtitle1">
                        {nextTopic.title}
                      </Typography>
                      
                      {nextTopic.progress && nextTopic.progress.startedAt && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 2 }}>
                            <Typography variant="body2">
                              <strong>Progress:</strong>
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="primary.main"
                            >
                              {nextTopic.progress.completionPercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={nextTopic.progress.completionPercentage} 
                            sx={{ height: 6, borderRadius: 3, mb: 2 }}
                          />
                        </>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(nextTopic.estimatedDurationMinutes || 0)}
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        fullWidth 
                        component={Link}
                        href={`/study/${syllabus.id}/topic/${nextTopic.id}`}
                        startIcon={<PlayArrow />}
                        sx={{ mt: 1 }}
                      >
                        {nextTopic.progress && nextTopic.progress.startedAt ? 'Continue Topic' : 'Start Topic'}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, textAlign: 'center' }}>
                      <CheckCircle color="success" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        All Topics Completed!
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Congratulations! You've completed all topics in this syllabus.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        component={Link}
                        href={`/syllabi/view/${syllabus.id}`}
                      >
                        Review Syllabus
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        
        {/* Study Progress Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Topics
              </Typography>
              
              <Stepper orientation="vertical" nonLinear>
                {syllabus.topics.map((topic) => {
                  const progress = topic.progress?.completionPercentage || 0;
                  const isCompleted = progress === 100;
                  const isInProgress = progress > 0 && progress < 100;
                  const isNotStarted = progress === 0;
                  
                  return (
                    <Step key={topic.id} completed={isCompleted} active={isInProgress}>
                      <StepLabel
                        StepIconProps={{
                          icon: isCompleted ? <CheckCircle color="success" /> : 
                                isInProgress ? <Timer color="primary" /> : 
                                <NotStarted color="disabled" />
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                              variant="subtitle1"
                              component={Link} 
                              href={`/study/${syllabus.id}/topic/${topic.id}`}
                              sx={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {topic.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDuration(topic.estimatedDurationMinutes || 0)}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  Due: {formatDate(topic.deadline)}
                                </Typography>
                              </Box>
                              
                              {topic.assignments && topic.assignments.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Assignment fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {topic.assignments.filter(a => a.completed).length}/{topic.assignments.length} assignments
                                  </Typography>
                                </Box>
                              )}
                              
                              {topic.resources && topic.resources.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Notes fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {topic.resources.length} resources
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '150px', ml: 2 }}>
                            {isCompleted ? (
                              <Chip 
                                label="Completed" 
                                size="small" 
                                color="success" 
                                icon={<Check />}
                                sx={{ mr: 1 }}
                              />
                            ) : isInProgress ? (
                              <>
                                <Box sx={{ width: '70px', mr: 2 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={progress} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                  <Typography variant="body2" sx={{ mt: 0.5 }} align="center">
                                    {progress}%
                                  </Typography>
                                </Box>
                              </>
                            ) : (
                              <Chip 
                                label="Not Started" 
                                size="small" 
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                            )}
                            
                            <Button 
                              variant={isInProgress ? "contained" : "outlined"}
                              size="small"
                              component={Link}
                              href={`/study/${syllabus.id}/topic/${topic.id}`}
                              endIcon={<ChevronRight />}
                            >
                              {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                            </Button>
                          </Box>
                        </Box>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Upcoming Assignments Section */}
            {upcomingAssignments.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Upcoming Assignments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  {upcomingAssignments.map((assignment) => (
                    <ListItem 
                      key={assignment.id}
                      disablePadding
                      sx={{ mb: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={assignment.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {assignment.topicTitle}
                            </Typography>
                            <Typography variant="body2" color="error">
                              Due: {formatDate(assignment.dueDate)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            {/* Recently Studied Section */}
            {recentTopics.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Recently Studied
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  {recentTopics.map((topic) => {
                    const progress = topic.progress?.completionPercentage || 0;
                    
                    return (
                      <ListItem 
                        key={topic.id}
                        disablePadding
                        sx={{ mb: 2 }}
                      >
                        <ListItemText 
                          primary={
                            <Box 
                              component={Link}
                              href={`/study/${syllabus.id}/topic/${topic.id}`}
                              sx={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {topic.title}
                            </Box>
                          }
                          secondary={
                            <>
                              <Box sx={{ mt: 1, mb: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progress} 
                                  sx={{ height: 4, borderRadius: 2 }}
                                  color={progress === 100 ? 'success' : 'primary'}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {progress}% complete
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Last studied: {new Date(topic.lastStudied).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    component={Link}
                    href={`/syllabi/view/${syllabus.id}`}
                  >
                    View All Topics
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
