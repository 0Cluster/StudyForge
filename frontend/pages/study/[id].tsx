import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Paper, CircularProgress, 
  Stepper, Step, StepLabel, Chip, Grid, Card, CardContent,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, TextField, LinearProgress
} from '@mui/material';
import { 
  NavigateNext, NavigateBefore, CheckCircle, AccessTime, 
  CalendarToday, Assignment, MenuBook, Close, Check, QuestionAnswer,
  EmojiEvents, Save
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
// import { syllabusService } from '@/services/syllabus';
// import { topicService } from '@/services/topic';
import { Syllabus, Topic, Progress } from '@/types';
import { useTheme } from '@mui/material/styles';

export default function StudyMode() {
  const router = useRouter();
  const theme = useTheme();
  const { syllabusId } = router.query;
  const syllabusIdNum = typeof syllabusId === 'string' ? parseInt(syllabusId) : undefined;
  
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
  // Sample data (replace with API calls when services are uncommented)
  const sampleSyllabus: Syllabus = {
    id: 1,
    title: 'Introduction to Computer Science',
    description: 'A comprehensive introduction to computer science fundamentals',
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
        content: `# Introduction to Programming

Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++.

## Basic Concepts

### Variables
Variables are used to store information to be referenced and manipulated in a computer program.

\`\`\`python
# Example of variables in Python
name = "John"
age = 25
height = 1.75
is_student = True
\`\`\`

### Data Types
Common data types include:
- **Strings**: Text values
- **Numbers**: Integers, floating-point numbers
- **Booleans**: True/False values
- **Arrays/Lists**: Collections of items
- **Objects/Dictionaries**: Key-value pairs

### Control Structures
Control structures determine the flow of execution:
- **Conditionals** (if/else statements)
- **Loops** (for, while)
- **Functions** (reusable blocks of code)

\`\`\`python
# Example of a function in Python
def greet(name):
    return f"Hello, {name}!"

# Example of a conditional
if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")

# Example of a loop
for i in range(5):
    print(i)
\`\`\`

## Programming Paradigms

### Procedural Programming
Focuses on procedure calls (functions) and how to complete a task step-by-step.

### Object-Oriented Programming (OOP)
Based on the concept of "objects" which contain data and methods.

### Functional Programming
Treats computation as the evaluation of mathematical functions and avoids changing state and mutable data.

## Getting Started

To start programming, you need:
1. Choose a programming language
2. Set up a development environment
3. Learn the syntax and basic concepts
4. Practice with small projects
5. Expand your knowledge with more complex applications`,
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
- Simulation`,
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
        content: `# Algorithms

An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. In computer science, algorithms are precise instructions that specify how to perform a computation or solve a problem.

## Characteristics of Good Algorithms

- **Correctness**: Produces the correct output for all valid inputs
- **Efficiency**: Uses computational resources optimally
- **Simplicity**: Easy to understand and implement
- **Optimality**: Achieves the best possible solution

## Common Algorithms

### Sorting Algorithms
- **Bubble Sort**: Simple but inefficient, O(n²)
- **Selection Sort**: Simple selection algorithm, O(n²)
- **Insertion Sort**: Builds sorted array one item at a time, O(n²)
- **Merge Sort**: Divide and conquer approach, O(n log n)
- **Quick Sort**: Divide and conquer, typically O(n log n)
- **Heap Sort**: Uses heap data structure, O(n log n)

### Searching Algorithms
- **Linear Search**: Check each element, O(n)
- **Binary Search**: For sorted arrays, O(log n)
- **Depth-First Search (DFS)**: Graph traversal
- **Breadth-First Search (BFS)**: Graph traversal

### Graph Algorithms
- **Dijkstra's Algorithm**: Shortest path
- **Bellman-Ford**: Shortest path with negative weights
- **Kruskal's Algorithm**: Minimum spanning tree
- **Prim's Algorithm**: Minimum spanning tree

## Algorithm Analysis

Algorithms are analyzed using:

- **Time Complexity**: How running time increases with input size
- **Space Complexity**: How memory usage increases with input size

### Big O Notation
Describes the upper bound of time/space complexity:

- O(1): Constant time
- O(log n): Logarithmic time
- O(n): Linear time
- O(n log n): Linearithmic time
- O(n²): Quadratic time
- O(2^n): Exponential time

## Algorithm Design Techniques

- **Divide and Conquer**: Break problem into subproblems
- **Dynamic Programming**: Solve complex problems by breaking them into simpler overlapping subproblems
- **Greedy Algorithms**: Make locally optimal choices
- **Backtracking**: Build solutions incrementally`,
        estimatedDurationMinutes: 150,
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
    if (!syllabusIdNum) return;
    
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        // Replace with actual API call when service is uncommented
        // const data = await syllabusService.getById(syllabusId);
        // setSyllabus(data);
        
        // Using sample data
        setSyllabus(sampleSyllabus);
        
        // Find the first incomplete topic or use the first topic
        const incompleteIndex = sampleSyllabus.topics?.findIndex(
          topic => !topic.progress?.completed
        );
        
        if (incompleteIndex !== undefined && incompleteIndex >= 0) {
          setActiveTopicIndex(incompleteIndex);
        }
        
        // Initialize progress value for current topic
        if (sampleSyllabus.topics && sampleSyllabus.topics.length > 0) {
          const currentTopic = sampleSyllabus.topics[incompleteIndex !== undefined && incompleteIndex >= 0 ? incompleteIndex : 0];
          setProgressValue(currentTopic.progress?.completionPercentage || 0);
        }
        
        // Start session timer
        setSessionStartTime(new Date());
      } catch (err) {
        console.error('Error fetching syllabus:', err);
        setError('Failed to load syllabus. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabus();
    
    // Set up session timer
    const intervalId = setInterval(() => {
      if (sessionStartTime) {
        const now = new Date();
        const diffInMs = now.getTime() - sessionStartTime.getTime();
        setSessionTime(Math.floor(diffInMs / 1000));
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [syllabusIdNum]);

  const handlePreviousTopic = () => {
    if (activeTopicIndex > 0) {
      setActiveTopicIndex(activeTopicIndex - 1);
      
      // Update progress value
      const prevTopic = syllabus?.topics?.[activeTopicIndex - 1];
      if (prevTopic) {
        setProgressValue(prevTopic.progress?.completionPercentage || 0);
      }
    }
  };

  const handleNextTopic = () => {
    if (syllabus?.topics && activeTopicIndex < syllabus.topics.length - 1) {
      setActiveTopicIndex(activeTopicIndex + 1);
      
      // Update progress value
      const nextTopic = syllabus.topics[activeTopicIndex + 1];
      if (nextTopic) {
        setProgressValue(nextTopic.progress?.completionPercentage || 0);
      }
    } else {
      // Last topic completed
      setCompletionDialogOpen(true);
    }
  };

  const handleNotesChange = (topicId: number, value: string) => {
    setNotes({
      ...notes,
      [topicId]: value
    });
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    setProgressValue(newValue as number);
  };

  const handleSaveProgress = async () => {
    if (!syllabus?.topics) return;
    
    const currentTopic = syllabus.topics[activeTopicIndex];
    if (!currentTopic) return;
    
    try {
      // Replace with actual API call when service is uncommented
      // await topicService.trackProgress(currentTopic.id, progressValue);
      
      // Update local state
      setSyllabus(prev => {
        if (!prev || !prev.topics) return prev;
        
        const updatedTopics = [...prev.topics];
        const isCompleted = progressValue === 100;
        
        updatedTopics[activeTopicIndex] = {
          ...updatedTopics[activeTopicIndex],
          progress: {
            ...(updatedTopics[activeTopicIndex].progress || {
              id: 0,
              completed: false,
              completionPercentage: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              topicId: currentTopic.id
            }),
            completed: isCompleted,
            completionPercentage: progressValue,
            startedAt: updatedTopics[activeTopicIndex].progress?.startedAt || new Date().toISOString(),
            completedAt: isCompleted ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          }
        };
        
        return {
          ...prev,
          topics: updatedTopics
        };
      });
      
      setProgressDialogOpen(false);
      
      // If completed, move to next topic
      if (progressValue === 100) {
        // Wait a bit to show completion
        setTimeout(() => {
          handleNextTopic();
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress. Please try again later.');
    }
  };

  // Format date string
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Format duration for timer display
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Get the current topic
  const getCurrentTopic = (): Topic | undefined => {
    if (!syllabus?.topics) return undefined;
    return syllabus.topics[activeTopicIndex];
  };

  const currentTopic = getCurrentTopic();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !syllabus || !syllabus.topics || syllabus.topics.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'No topics available to study'}
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
        <title>Study Mode: {syllabus.title} - StudyForge</title>
        <meta name="description" content={`Study ${syllabus.title}`} />
      </Head>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => router.push(`/syllabi/${syllabus.id}`)}
        >
          Exit Study Mode
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime fontSize="small" />
          <Typography variant="body2">
            Session time: {formatDuration(sessionTime)}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {syllabus.title}
          </Typography>
          <Box>
            <Button 
              variant="outlined"
              size="small"
              onClick={() => setNotesDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Notes
            </Button>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => setProgressDialogOpen(true)}
              endIcon={<Save />}
            >
              Save Progress
            </Button>
          </Box>
        </Box>
        
        <Stepper activeStep={activeTopicIndex} alternativeLabel sx={{ mb: 3 }}>
          {syllabus.topics.map((topic, index) => (
            <Step key={topic.id} completed={topic.progress?.completed}>
              <StepLabel>{topic.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              Topic {activeTopicIndex + 1}: {currentTopic?.title}
            </Typography>
            {currentTopic?.progress?.completed && (
              <CheckCircle color="success" sx={{ ml: 1 }} />
            )}
          </Box>
          <Chip 
            label={`${currentTopic?.progress?.completionPercentage || 0}% Complete`}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime fontSize="small" color="primary" />
              <Typography variant="body2">
                Est. Time: {Math.round((currentTopic?.estimatedDurationMinutes || 0) / 60)} hours {(currentTopic?.estimatedDurationMinutes || 0) % 60} min
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="primary" />
              <Typography variant="body2">
                Due: {formatDate(currentTopic?.deadline)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment fontSize="small" color="primary" />
              <Typography variant="body2">
                Assignments: {currentTopic?.assignments?.length || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<Assignment />}
              component={Link}
              href={`/topics/${currentTopic?.id}`}
            >
              View Assignments
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Content
            </Typography>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
              {/* This would ideally be a markdown renderer */}
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {currentTopic?.content}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePreviousTopic}
          disabled={activeTopicIndex === 0}
        >
          Previous Topic
        </Button>
        <Button
          variant="contained"
          endIcon={<NavigateNext />}
          onClick={handleNextTopic}
        >
          {activeTopicIndex === syllabus.topics.length - 1 ? 'Complete Syllabus' : 'Next Topic'}
        </Button>
      </Box>
      
      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onClose={() => setNotesDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Notes: {currentTopic?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={15}
            variant="outlined"
            placeholder="Enter your notes here..."
            value={notes[currentTopic?.id || 0] || ''}
            onChange={(e) => handleNotesChange(currentTopic?.id || 0, e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => setNotesDialogOpen(false)}>
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Progress Dialog */}
      <Dialog open={progressDialogOpen} onClose={() => setProgressDialogOpen(false)}>
        <DialogTitle>Update Progress</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Update your progress for "{currentTopic?.title}". Mark as 100% when you have completed this topic.
          </DialogContentText>
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography gutterBottom>
              Progress: {progressValue}%
            </Typography>
            <Box sx={{ px: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressValue}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
            </Box>
            <Box sx={{ px: 2 }}>
              <Typography id="progress-slider" gutterBottom>
                Adjust Progress:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">0%</Typography>
                <Box sx={{ width: '100%', mx: 2 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progressValue}
                    onChange={(e) => setProgressValue(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">100%</Typography>
              </Box>
            </Box>
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
      
      {/* Completion Dialog */}
      <Dialog open={completionDialogOpen} onClose={() => setCompletionDialogOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          Congratulations!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <EmojiEvents sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              You've completed this syllabus!
            </Typography>
            <Typography variant="body1" align="center">
              You've reached the end of "{syllabus.title}". Your overall progress is {calculateOverallProgress()}%.
            </Typography>
            <Box sx={{ mt: 3, mb: 2, width: '100%' }}>
              <Typography variant="body2" gutterBottom>
                Overall Completion:
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={calculateOverallProgress()} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
                {calculateOverallProgress()}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Study session time: {formatDuration(sessionTime)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 3 }}>
            <Button 
              startIcon={<Assignment />}
              variant="outlined"
              component={Link}
              href={`/syllabi/${syllabus.id}`}
            >
              View All Topics
            </Button>
            <Button 
              startIcon={<QuestionAnswer />}
              variant="outlined"
              component={Link}
              href={`/assignments?syllabusId=${syllabus.id}`}
            >
              Practice with Assignments
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCompletionDialogOpen(false);
              router.push('/dashboard');
            }} 
            variant="contained"
            fullWidth
          >
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
