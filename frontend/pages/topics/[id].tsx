import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Card, CardContent, 
  CircularProgress, Divider, Grid, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails, Slider, 
  Paper, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions
} from '@mui/material';
import { 
  ExpandMore, AccessTime, CalendarToday, Edit,
  Delete, Assignment, CheckCircle, Check, Add
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
// import { topicService } from '@/services/topic';
import { Topic, Progress, Assignment } from '@/types';

export default function TopicDetail() {
  const router = useRouter();
  const { id } = router.query;
  const topicId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [generatingAssignments, setGeneratingAssignments] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  
  // Sample data (replace with API calls when services are uncommented)
  const sampleTopic: Topic = {
    id: 2,
    title: 'Data Structures',
    content: `# Data Structures

Data structures are specialized formats for organizing, processing, retrieving, and storing data in a computer system. They provide a way to manage large amounts of data efficiently for uses such as large databases and internet indexing services.

## Key Concepts

- **Arrays**: Fixed-size, contiguous collection of items of the same type.
- **Linked Lists**: Linear collection of nodes, each containing data and a reference to the next node.
- **Stacks**: Last-In-First-Out (LIFO) data structure.
- **Queues**: First-In-First-Out (FIFO) data structure.
- **Trees**: Hierarchical data structure with a root node and branches/children.
- **Graphs**: Networks of nodes connected by edges.
- **Hash Tables**: Data structure that implements an associative array using a hash function.

## Complexity Analysis

When analyzing data structures, we consider time and space complexity:

- **Time Complexity**: How the running time of operations scales with input size.
- **Space Complexity**: How much memory is required to perform operations.

## Common Operations

Most data structures support these operations:

- **Insert**: Add an element
- **Delete**: Remove an element
- **Search**: Find an element
- **Traverse**: Visit all elements

## Applications

Different data structures are suited for different applications:

- Databases
- Compiler design
- Operating systems
- Graphics
- Artificial intelligence
- Simulation
`,
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
    },
    assignments: [
      {
        id: 1,
        title: 'Arrays and Linked Lists Basics',
        content: 'Implement a singly linked list and perform basic operations.',
        difficultyLevel: 'EASY',
        maxPoints: 10,
        isCompleted: true,
        earnedPoints: 9,
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-15T10:00:00Z',
        topicId: 2,
        questions: [
          {
            id: 1,
            text: 'Implement a function to reverse a singly linked list.',
            type: 'SHORT_ANSWER',
            points: 5,
            createdAt: '2023-07-15T10:00:00Z',
            updatedAt: '2023-07-15T10:00:00Z',
            assignmentId: 1,
            isCorrect: true,
            correctAnswer: 'Solution with pointer reversal',
            userAnswer: 'Solution with pointer reversal'
          }
        ]
      },
      {
        id: 2,
        title: 'Trees and Graphs',
        content: 'Implement tree traversal algorithms and solve graph problems.',
        difficultyLevel: 'MEDIUM',
        maxPoints: 20,
        isCompleted: false,
        earnedPoints: 0,
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-15T10:00:00Z',
        topicId: 2,
        questions: []
      },
      {
        id: 3,
        title: 'Advanced Data Structures',
        content: 'Implement a hash table with collision resolution strategies.',
        difficultyLevel: 'HARD',
        maxPoints: 30,
        isCompleted: false,
        earnedPoints: 0,
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-15T10:00:00Z',
        topicId: 2,
        questions: []
      }
    ]
  };

  useEffect(() => {
    if (!topicId) return;
    
    const fetchTopic = async () => {
      setLoading(true);
      try {
        // Replace with actual API call when service is uncommented
        // const data = await topicService.getById(topicId);
        // setTopic(data);
        
        // Using sample data
        setTopic(sampleTopic);
        setProgressValue(sampleTopic.progress?.completionPercentage || 0);
      } catch (err) {
        console.error('Error fetching topic:', err);
        setError('Failed to load topic details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopic();
  }, [topicId]);

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    setProgressValue(newValue as number);
  };

  const handleSaveProgress = async () => {
    if (!topicId) return;
    
    try {
      // Replace with actual API call when service is uncommented
      // await topicService.trackProgress(topicId, progressValue);
      
      // Update local state
      setTopic(prev => {
        if (!prev) return prev;
        
        const isCompleted = progressValue === 100;
        return {
          ...prev,
          progress: {
            ...(prev.progress || {
              id: 0,
              completed: false,
              completionPercentage: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              topicId: topicId
            }),
            completed: isCompleted,
            completionPercentage: progressValue,
            completedAt: isCompleted ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          }
        };
      });
      
      setProgressDialogOpen(false);
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress. Please try again later.');
    }
  };

  const handleGenerateAssignments = async () => {
    if (!topicId) return;
    
    setGeneratingAssignments(true);
    try {
      // Replace with actual API call when service is uncommented
      // const assignments = await topicService.generateAssignments(topicId);
      // setTopic(prev => prev ? { ...prev, assignments } : null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo, just show it was successful
      alert('Assignments generated successfully!');
    } catch (err) {
      console.error('Error generating assignments:', err);
      setError('Failed to generate assignments. Please try again later.');
    } finally {
      setGeneratingAssignments(false);
    }
  };

  const handleDelete = async () => {
    if (!topicId) return;
    
    try {
      // Replace with actual API call when service is uncommented
      // await topicService.delete(topicId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/syllabi/${topic?.syllabusId}`);
    } catch (err) {
      console.error('Error deleting topic:', err);
      setError('Failed to delete topic. Please try again later.');
    } finally {
      setDeleteDialogOpen(false);
    }
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

  // Get color based on difficulty level
  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'EASY': return 'success';
      case 'MEDIUM': return 'primary';
      case 'HARD': return 'warning';
      case 'GOD': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !topic) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Topic not found'}
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
        <title>{topic.title} - StudyForge</title>
        <meta name="description" content={`Learn about ${topic.title}`} />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => router.push(`/syllabi/${topic.syllabusId}`)}
              sx={{ mb: 1 }}
            >
              Back to Syllabus
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {topic.title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Edit />}
              component={Link}
              href={`/topics/edit/${topic.id}`}
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
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={topic.progress?.completionPercentage || 0} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {topic.progress?.completionPercentage || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setProgressDialogOpen(true)}
                >
                  Update Progress
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Timeline
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="body1">
                    Due: {formatDate(topic.deadline)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="primary" />
                  <Typography variant="body1">
                    Estimated time: {formatDuration(topic.estimatedDurationMinutes)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Assignments
                </Typography>
                <Typography variant="body1">
                  {topic.assignments?.length || 0} total assignments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topic.assignments?.filter(a => a.isCompleted).length || 0} completed
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button 
                    variant="contained"
                    fullWidth
                    startIcon={<Assignment />}
                    onClick={handleGenerateAssignments}
                    disabled={generatingAssignments}
                  >
                    {generatingAssignments ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                        Generating...
                      </>
                    ) : (
                      'Generate Assignments'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Content
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {/* This would ideally be a markdown renderer */}
            <Box sx={{ whiteSpace: 'pre-wrap' }}>
              {topic.content}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Assignments
              </Typography>
              <Button 
                startIcon={<Add />}
                component={Link}
                href={`/topics/${topic.id}/assignments/create`}
                size="small"
              >
                Add
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {topic.assignments?.length === 0 ? (
              <Typography variant="body1">
                No assignments available. Click "Generate Assignments" to create assignments for this topic.
              </Typography>
            ) : (
              topic.assignments?.map((assignment) => (
                <Accordion key={assignment.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {assignment.isCompleted && (
                          <CheckCircle color="success" sx={{ mr: 1, fontSize: 20 }} />
                        )}
                        <Typography variant="subtitle1">
                          {assignment.title}
                        </Typography>
                      </Box>
                      <Chip 
                        label={assignment.difficultyLevel} 
                        color={getDifficultyColor(assignment.difficultyLevel) as any}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      {assignment.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Points: {assignment.earnedPoints || 0}/{assignment.maxPoints || 0}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        component={Link}
                        href={`/assignments/${assignment.id}`}
                      >
                        {assignment.isCompleted ? 'View Results' : 'Start Assignment'}
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Related Resources
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Additional learning resources will appear here as you progress through the topic.
            </Typography>
            <Button variant="outlined" fullWidth>
              Suggest Resources
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Progress Update Dialog */}
      <Dialog open={progressDialogOpen} onClose={() => setProgressDialogOpen(false)}>
        <DialogTitle>Update Progress</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Update your progress for this topic. Mark as 100% when you have completed all materials.
          </DialogContentText>
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography gutterBottom>
              Progress: {progressValue}%
            </Typography>
            <Slider
              value={progressValue}
              onChange={handleProgressChange}
              aria-labelledby="progress-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
            />
            {progressValue === 100 && (
              <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Check sx={{ mr: 1 }} />
                Topic will be marked as completed
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProgress} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{topic.title}"? This action cannot be undone.
            All associated progress data and assignments will be permanently deleted.
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
