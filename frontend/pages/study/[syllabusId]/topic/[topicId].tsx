import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Box, Typography, Container, Button, Grid, Card, CardContent,
  LinearProgress, Divider, Paper, List, ListItem, ListItemText,
  ListItemIcon, Chip, IconButton, Accordion, AccordionSummary, 
  AccordionDetails, Stepper, Step, StepLabel, StepContent,
  CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, TextField, Checkbox, FormControlLabel
} from '@mui/material';
import { 
  ArrowBack, Check, AccessTime, CalendarToday, ChevronLeft,
  ChevronRight, CheckCircle, Assignment, Notes, PlayArrow,
  PictureAsPdf, Description, InsertDriveFile, ExpandMore,
  BookmarkAdd, BookmarkAdded, Edit, Timer
} from '@mui/icons-material';
import Link from 'next/link';
import { authService } from '@/services/api';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { assignmentService } from '@/services/assignment';
import { Syllabus, Topic, Progress } from '@/types';

export default function TopicStudyPage() {
  const router = useRouter();
  const { syllabusId, topicId } = router.query;
  
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUpdateProgressDialogOpen, setIsUpdateProgressDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);


  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
      if (!syllabusId || !topicId) return; // Wait until params are available
      
      setLoading(true);
      try {
        // Get syllabus data
        const syllabusData = await syllabusService.getById(Number(syllabusId));
        setSyllabus(syllabusData);
        
        // Get topic details
        const topicData = await topicService.getById(Number(topicId));
        
        // Get topic progress
        let progressData;
        try {
          progressData = await topicService.getProgress(Number(topicId));
        } catch (err) {
          console.warn('No progress data found for this topic, initializing with defaults');
          progressData = {
            id: 0,
            completed: false,
            completionPercentage: 0,
            topicId: Number(topicId),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Initialize progress if this is the first time viewing the topic
          if (!progressData.startedAt) {
            progressData = await topicService.trackProgress(Number(topicId), 0);
          }
        }
        
        // Get assignments for this topic
        let assignments = [];
        try {
          assignments = await assignmentService.getAllByTopic(Number(topicId));
        } catch (err) {
          console.warn('Error fetching assignments:', err);
        }
        
        // Combine all data
        const fullTopicData = {
          ...topicData,
          progress: progressData,
          assignments: assignments
        };
        
        setTopic(fullTopicData);
        setProgress(progressData.completionPercentage || 0);
        setProgressValue(progressData.completionPercentage || 0);
        setIsCompleted(progressData.completed || false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load topic details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router, syllabusId, topicId]);

  const handleUpdateProgress = async () => {
    if (!topic) return;
    
    try {
      // Update progress in API
      const updatedProgress = await topicService.updateProgress(topic.id, progressValue, isCompleted);
      
      // Update local state
      setProgress(progressValue);
      setTopic({
        ...topic,
        progress: updatedProgress
      });
      
      // Close dialog
      setIsUpdateProgressDialogOpen(false);
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress. Please try again.');
    }
  };

  const handleOpenUpdateProgressDialog = () => {
    setProgressValue(progress);
    setIsCompleted(!!topic?.progress?.completed);
    setIsUpdateProgressDialogOpen(true);
  };

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

  // Get document type icon
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <PictureAsPdf />;
      case 'WORD': return <Description />;
      case 'TEXT': return <InsertDriveFile />;
      default: return <InsertDriveFile />;
    }
  };

  // Get next and previous topics
  const getAdjacentTopics = () => {
    if (!syllabus || !topic) return { prev: null, next: null };
    
    const currentIndex = syllabus.topics.findIndex(t => t.id === topic.id);
    const prev = currentIndex > 0 ? syllabus.topics[currentIndex - 1] : null;
    const next = currentIndex < syllabus.topics.length - 1 ? syllabus.topics[currentIndex + 1] : null;
    
    return { prev, next };
  };

  const adjacentTopics = getAdjacentTopics();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !syllabus || !topic) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center" sx={{ my: 4 }}>
          {error || 'Topic not found'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            component={Link}
            href={`/syllabi/view/${syllabusId}`}
            startIcon={<ArrowBack />}
          >
            Back to Syllabus
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{topic.title} | StudyForge</title>
        <meta name="description" content={`Study materials for ${topic.title}`} />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumb & Navigation */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Button 
              component={Link}
              href={`/syllabi/view/${syllabusId}`}
              startIcon={<ArrowBack />}
              size="small"
              sx={{ mr: 1 }}
            >
              Back to Syllabus
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                component={Link}
                href={`/study/${syllabusId}`}
                startIcon={<ArrowBack />}
                size="small"
                sx={{ mr: 2 }}
              >
                Back to Dashboard
              </Button>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexGrow: 1
                }}
              >
                {syllabus.title} 
                <ChevronRight fontSize="small" sx={{ mx: 1 }} /> 
                Topic {topic.orderIndex} of {syllabus.topics.length}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, sm: 0 } }}>
              {adjacentTopics.prev && (
                <Button 
                  component={Link}
                  href={`/study/${syllabusId}/topic/${adjacentTopics.prev.id}`}
                  startIcon={<ChevronLeft />}
                  size="small"
                  variant="outlined"
                >
                  Previous
                </Button>
              )}
              
              {adjacentTopics.next && (
                <Button 
                  component={Link}
                  href={`/study/${syllabusId}/topic/${adjacentTopics.next.id}`}
                  endIcon={<ChevronRight />}
                  size="small"
                  variant="outlined"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Topic Header */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h1" gutterBottom>
                {topic.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Estimated: {formatDuration(topic.estimatedDurationMinutes)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Deadline: {formatDate(topic.deadline)}
                  </Typography>
                </Box>
                
                <Chip 
                  label={topic.progress?.completed ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                  color={topic.progress?.completed ? 'success' : progress > 0 ? 'primary' : 'default'}
                  size="small"
                  icon={topic.progress?.completed ? <Check /> : undefined}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Progress
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color={progress === 100 ? 'success.main' : 'primary.main'}>
                        {progress}% Complete
                      </Typography>
                      {progress === 100 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="success.main">
                            Completed
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                      color={progress === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                  
                  {/* Assignment progress if any */}
                  {topic.assignments && topic.assignments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Assignments: {topic.assignments.filter(a => a.completed).length}/{topic.assignments.length} completed
                      </Typography>
                    </Box>
                  )}
                  
                  <Button 
                    variant="contained"
                    fullWidth
                    onClick={handleOpenUpdateProgressDialog}
                    startIcon={<Edit />}
                  >
                    Update Progress
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Content Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Content paragraphs */}
              {topic.content.split('\n\n').map((paragraph, index) => (
                <Typography key={index} variant="body1" paragraph>
                  {paragraph}
                </Typography>
              ))}
            </Paper>
            
            {/* Assignments Section */}
            {topic.assignments && topic.assignments.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 1 }} />
                  Assignments
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  {topic.assignments.map((assignment) => (
                    <Accordion key={assignment.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1">
                              {assignment.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Due: {formatDate(assignment.dueDate)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={assignment.completed ? "Completed" : "Pending"}
                            color={assignment.completed ? "success" : "primary"}
                            size="small"
                            variant={assignment.completed ? "filled" : "outlined"}
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" paragraph>
                          {assignment.description}
                        </Typography>
                        
                        {!assignment.completed && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              variant="contained"
                              size="small"
                            >
                              Mark as Completed
                            </Button>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Resources Section */}
            {topic.resources && topic.resources.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Notes sx={{ mr: 1 }} />
                  Resources
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List disablePadding>
                  {topic.resources.map((resource) => (
                    <ListItem 
                      key={resource.id}
                      disablePadding
                      sx={{ mb: 2 }}
                    >
                      <ListItemIcon>
                        {getDocumentTypeIcon(resource.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={resource.title}
                        secondary={resource.type}
                        primaryTypographyProps={{
                          variant: 'body1',
                          component: 'a',
                          href: resource.url,
                          target: "_blank",
                          rel: "noopener",
                          sx: { 
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            {/* Syllabus Navigation Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Syllabus Navigation
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stepper orientation="vertical" activeStep={topic.orderIndex - 1} nonLinear sx={{ ml: -1 }}>
                {syllabus.topics.map((t) => {
                  const isActive = t.id === topic.id;
                  const topicProgress = t.progress?.completionPercentage || 0;
                  
                  return (
                    <Step key={t.id}>
                      <StepLabel
                        StepIconProps={{
                          active: isActive,
                          completed: !!t.progress?.completed
                        }}
                      >
                        <Box
                          component={Link}
                          href={`/study/${syllabusId}/topic/${t.id}`}
                          sx={{
                            color: isActive ? 'primary.main' : 'text.primary',
                            fontWeight: isActive ? 'bold' : 'normal',
                            textDecoration: 'none',
                            display: 'block',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {t.title}
                        </Box>
                        
                        {!isActive && topicProgress > 0 && (
                          <LinearProgress 
                            variant="determinate" 
                            value={topicProgress} 
                            sx={{ 
                              height: 4, 
                              borderRadius: 2, 
                              mt: 0.5,
                              width: '80%'
                            }}
                            color={topicProgress === 100 ? 'success' : 'primary'}
                          />
                        )}
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {t.description || 'No description available'}
                        </Typography>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Update Progress Dialog */}
      <Dialog
        open={isUpdateProgressDialogOpen}
        onClose={() => setIsUpdateProgressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Your Progress</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Track your progress for "{topic.title}". Update your completion percentage or mark the topic as completed.
          </DialogContentText>
          
          <Box sx={{ mb: 3 }}>
            <Typography id="progress-slider" gutterBottom>
              Completion: {progressValue}%
            </Typography>
            <Box sx={{ px: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
                color={progressValue === 100 ? 'success' : 'primary'}
              />
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item>
                <TextField
                  value={progressValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      setProgressValue(val);
                    }
                  }}
                  inputProps={{
                    step: 10,
                    min: 0,
                    max: 100,
                    type: 'number'
                  }}
                  size="small"
                  sx={{ width: 80 }}
                />
              </Grid>
            </Grid>
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={isCompleted} 
                onChange={(e) => {
                  setIsCompleted(e.target.checked);
                  if (e.target.checked) {
                    setProgressValue(100);
                  }
                }} 
              />
            }
            label="Mark topic as completed"
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUpdateProgressDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained">
            Save Progress
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
