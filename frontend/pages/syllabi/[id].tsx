import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Card, CardContent, 
  CircularProgress, Tabs, Tab, LinearProgress, Divider,
  Grid, List, ListItem, ListItemText, ListItemIcon, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  CloudDownload, Edit, Delete, PlayArrow, CheckCircle, 
  Assignment, Schedule, CalendarToday
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { Syllabus, Topic } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`syllabus-tabpanel-${index}`}
      aria-labelledby={`syllabus-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SyllabusDetail() {
  const router = useRouter();
  const { id } = router.query;
  const syllabusId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generatingTopics, setGeneratingTopics] = useState(false);
  
  // Sample data (replace with API calls when services are uncommented)
  const sampleSyllabus: Syllabus = {
    id: 1,
    title: 'Introduction to Computer Science',
    description: 'Fundamentals of computer science, algorithms and data structures',
    documentType: 'PDF',
    originalDocumentUrl: '/documents/cs101.pdf',
    startDate: '2023-08-01',
    endDate: '2023-12-15',
    createdAt: '2023-07-15T10:00:00Z',
    updatedAt: '2023-07-15T10:00:00Z',
    topics: [
      {
        id: 1,
        title: 'Introduction to Programming',
        content: 'Basic programming concepts and syntax',
        estimatedDurationMinutes: 120,
        deadline: '2023-08-15',
        orderIndex: 1,
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-15T10:00:00Z',
        syllabusId: 1,
        progress: {
          id: 1,
          completed: true,
          completionPercentage: 100,
          startedAt: '2023-08-01T09:00:00Z',
          completedAt: '2023-08-10T14:00:00Z',
          createdAt: '2023-08-01T09:00:00Z',
          updatedAt: '2023-08-10T14:00:00Z',
          topicId: 1
        }
      },
      {
        id: 2,
        title: 'Data Structures',
        content: 'Arrays, linked lists, trees, and graphs',
        estimatedDurationMinutes: 180,
        deadline: '2023-09-01',
        orderIndex: 2,
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-15T10:00:00Z',
        syllabusId: 1,
        progress: {
          id: 2,
          completed: false,
          completionPercentage: 40,
          startedAt: '2023-08-20T10:00:00Z',
          completedAt: null,
          createdAt: '2023-08-20T10:00:00Z',
          updatedAt: '2023-08-25T11:30:00Z',
          topicId: 2
        }
      },
      {
        id: 3,
        title: 'Algorithms',
        content: 'Searching, sorting, and algorithm complexity',
        estimatedDurationMinutes: 240,
        deadline: '2023-09-15',
        orderIndex: 3,
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-15T10:00:00Z',
        syllabusId: 1,
        progress: {
          id: 3,
          completed: false,
          completionPercentage: 0,
          startedAt: null,
          completedAt: null,
          createdAt: '2023-07-15T10:00:00Z',
          updatedAt: '2023-07-15T10:00:00Z',
          topicId: 3
        }
      }
    ]
  };

  useEffect(() => {
    if (!syllabusId) return;
    
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        // Get syllabus data from the API
        const data = await syllabusService.getById(syllabusId);
        setSyllabus(data);
      } catch (err) {
        console.error('Error fetching syllabus:', err);
        setError('Failed to load syllabus details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabus();
  }, [syllabusId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDelete = async () => {
    if (!syllabusId) return;
    
    try {
      // Call the API to delete the syllabus
      await syllabusService.delete(syllabusId);
      
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting syllabus:', err);
      setError('Failed to delete syllabus. Please try again later.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleGenerateTopics = async () => {
    if (!syllabusId) return;
    
    setGeneratingTopics(true);
    try {
      // Call the API to generate topics
      const topics = await syllabusService.generateTopics(syllabusId);
      setSyllabus(prev => prev ? { ...prev, topics } : null);
      
      // Show success message
      setError(null);
      alert('Topics generated successfully!');
      
      // Refresh the page to show the new topics
      router.replace(`/syllabi/${syllabusId}`);
    } catch (err) {
      console.error('Error generating topics:', err);
      setError('Failed to generate topics. Please try again later.');
    } finally {
      setGeneratingTopics(false);
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (!syllabus?.topics || syllabus.topics.length === 0) return 0;
    
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

  // Format duration
  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return 'Not set';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hours`;
    return `${hours} hours, ${mins} minutes`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !syllabus) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Syllabus not found'}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{syllabus.title} - StudyForge</title>
        <meta name="description" content={`Details for ${syllabus.title}`} />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {syllabus.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Edit />}
              component={Link}
              href={`/syllabi/edit/${syllabus.id}`}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" paragraph>
          {syllabus.description || 'No description provided.'}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Document Type:</strong> {syllabus.documentType}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Start Date:</strong> {formatDate(syllabus.startDate)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>End Date:</strong> {formatDate(syllabus.endDate)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong> {new Date(syllabus.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="div">
                Overall Progress
              </Typography>
              <Typography variant="h6" component="div">
                {calculateOverallProgress()}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculateOverallProgress()} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="syllabus tabs">
            <Tab label="Topics" />
            <Tab label="Schedule" />
            <Tab label="Original Document" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2">
              {syllabus.topics?.length || 0} Topics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined"
                startIcon={<Assignment />}
                component={Link}
                href={`/syllabi/${syllabus.id}/topics/create`}
              >
                Add Topic
              </Button>
              <Button 
                variant="contained"
                startIcon={<CloudDownload />}
                onClick={handleGenerateTopics}
                disabled={generatingTopics}
              >
                {generatingTopics ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    Generating...
                  </>
                ) : (
                  'Generate Topics'
                )}
              </Button>
            </Box>
          </Box>
          
          {syllabus.topics?.length === 0 ? (
            <Typography variant="body1">
              No topics available. Click "Generate Topics" to extract topics from your document automatically.
            </Typography>
          ) : (
            <List>
              {syllabus.topics?.map((topic, index) => (
                <ListItem 
                  key={topic.id}
                  sx={{ 
                    mb: 2, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  component={Link}
                  href={`/topics/${topic.id}`}
                  alignItems="flex-start"
                >
                  <ListItemIcon sx={{ mt: 1 }}>
                    {topic.progress?.completed ? (
                      <CheckCircle color="success" />
                    ) : topic.progress?.completionPercentage ? (
                      <PlayArrow color="primary" />
                    ) : (
                      <Schedule color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="span">
                          {index + 1}. {topic.title}
                        </Typography>
                        <Chip 
                          label={`${topic.progress?.completionPercentage || 0}%`}
                          color={topic.progress?.completed ? 'success' : 'primary'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {topic.content ? topic.content.substring(0, 100) + '...' : 'No content available'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <CalendarToday fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', verticalAlign: 'middle' }} />
                            Due: {formatDate(topic.deadline)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Schedule fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', verticalAlign: 'middle' }} />
                            {formatDuration(topic.estimatedDurationMinutes)}
                          </Typography>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" component="h2" gutterBottom>
            Study Schedule
          </Typography>
          
          {syllabus.topics?.length === 0 ? (
            <Typography variant="body1">
              No schedule available. Generate topics first to create a schedule.
            </Typography>
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Course Timeline: {formatDate(syllabus.startDate)} - {formatDate(syllabus.endDate)}
              </Typography>
              
              {syllabus.topics?.map((topic) => (
                <Card key={topic.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {topic.title}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Deadline:</strong> {formatDate(topic.deadline)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Estimated Time:</strong> {formatDuration(topic.estimatedDurationMinutes)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress 
                          variant="determinate" 
                          value={topic.progress?.completionPercentage || 0} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" component="h2" gutterBottom>
            Original Document
          </Typography>
          
          {syllabus.originalDocumentUrl ? (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<CloudDownload />}
                href={syllabus.originalDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Original Document
              </Button>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                Document Type: {syllabus.documentType}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1">
              No original document available.
            </Typography>
          )}
        </TabPanel>
      </Box>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Syllabus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{syllabus.title}"? This action cannot be undone.
            All associated topics, progress data, and assignments will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
