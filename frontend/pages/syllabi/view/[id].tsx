import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  CircularProgress, Divider, Chip, LinearProgress, Dialog, 
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  List, ListItem, ListItemText, ListItemIcon, ListItemButton,
  Paper, IconButton, Menu, MenuItem
} from '@mui/material';
import { 
  CalendarToday, Description, PictureAsPdf, InsertDriveFile, 
  MoreVert, Delete, Edit, Download, ArrowForward, Add, PlayArrow
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { assignmentService } from '@/services/assignment';
import { authService } from '@/services/api';
import { Syllabus, Topic } from '@/types';

export default function SyllabusDetail() {
  const router = useRouter();
  const { id } = router.query;
  const syllabusId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generatingTopics, setGeneratingTopics] = useState(false);
  
  // For menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  


  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (!syllabusId) return;
    
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        // Get syllabus details
        const syllabusData = await syllabusService.getById(syllabusId);
        
        // If topics are not included in the response, fetch them separately
        if (!syllabusData.topics || syllabusData.topics.length === 0) {
          const topics = await topicService.getAllBySyllabus(syllabusId);
          
          // For each topic, fetch its progress
          const topicsWithProgress = await Promise.all(
            topics.map(async (topic) => {
              let topicWithProgress = { ...topic };
              
              try {
                const progress = await topicService.getProgress(topic.id);
                topicWithProgress.progress = progress;
              } catch (err) {
                console.error(`Error fetching progress for topic ${topic.id}:`, err);
                // Set default progress
                topicWithProgress.progress = {
                  id: 0,
                  completed: false,
                  completionPercentage: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  topicId: topic.id
                };
              }
              
              return topicWithProgress;
            })
          );
          
          syllabusData.topics = topicsWithProgress;
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
  }, [syllabusId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!syllabusId) return;
    
    try {
      // Delete the syllabus using the API
      await syllabusService.delete(syllabusId);
      
      // Redirect to dashboard after successful deletion
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
      // Generate topics using the API
      const topics = await syllabusService.generateTopics(syllabusId);
      
      // Update the syllabus with the new topics
      setSyllabus(prev => prev ? { ...prev, topics } : null);
      
      // Notify user of success
      alert('Topics generated successfully!');
    } catch (err) {
      console.error('Error generating topics:', err);
      setError('Failed to generate topics. Please try again later.');
    } finally {
      setGeneratingTopics(false);
    }
  };

  // Calculate overall progress for the syllabus
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

  // Get document type icon
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <PictureAsPdf />;
      case 'WORD': return <Description />;
      case 'TEXT': return <InsertDriveFile />;
      default: return <InsertDriveFile />;
    }
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
        <meta name="description" content={syllabus.description} />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => router.push('/dashboard')}
              sx={{ mb: 1 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {syllabus.title}
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="contained" 
              startIcon={<PlayArrow />}
              onClick={() => router.push(`/study/${syllabus.id}`)}
              sx={{ mr: 1 }}
            >
              Start Studying
            </Button>
            <IconButton 
              aria-label="more"
              onClick={handleMenuOpen}
              size="large"
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  router.push(`/syllabi/edit/${syllabus.id}`);
                }}
              >
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  // This would be replaced with actual download functionality
                  if (syllabus.originalDocumentUrl) {
                    window.open(syllabus.originalDocumentUrl, '_blank');
                  } else {
                    alert('Document not available for download');
                  }
                }}
              >
                <ListItemIcon>
                  <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Download Original</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  setDeleteDialogOpen(true);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Typography variant="body1" paragraph>
          {syllabus.description}
        </Typography>
        
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
                      value={calculateOverallProgress()} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {calculateOverallProgress()}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Topics:</strong> {syllabus.topics?.length || 0} total
                  </Typography>
                  <Typography variant="body2">
                    <strong>Completed:</strong> {syllabus.topics?.filter(t => t.progress?.completed).length || 0} topics
                  </Typography>
                </Box>
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
                  <CalendarToday color="primary" fontSize="small" />
                  <Typography variant="body1">
                    Start: {formatDate(syllabus.startDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" fontSize="small" />
                  <Typography variant="body1">
                    End: {formatDate(syllabus.endDate)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Document
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getDocumentTypeIcon(syllabus.documentType)}
                  <Typography variant="body1">
                    Type: {syllabus.documentType}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {syllabus.originalDocumentUrl ? (
                    <Button 
                      variant="outlined"
                      startIcon={<Download />}
                      size="small"
                      fullWidth
                      onClick={() => window.open(syllabus.originalDocumentUrl!, '_blank')}
                    >
                      Download Original
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Original document not available
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Topics
          </Typography>
          <Box>
            <Button 
              startIcon={<Add />}
              variant="outlined"
              component={Link}
              href={`/topics/create?syllabusId=${syllabus.id}`}
              sx={{ mr: 1 }}
            >
              Add Topic
            </Button>
            <Button 
              variant="contained"
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
        
        <Paper>
          <List sx={{ width: '100%' }}>
            {syllabus.topics?.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No topics available"
                  secondary="Click 'Generate Topics' to automatically create topics from your syllabus content."
                />
              </ListItem>
            ) : (
              syllabus.topics?.map((topic, index) => (
                <div key={topic.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItemButton 
                    component={Link} 
                    href={`/topics/${topic.id}`}
                    sx={{
                      bgcolor: topic.progress?.completed ? 'success.50' : 'inherit'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {index + 1}. {topic.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {topic.progress?.completionPercentage || 0}% Complete
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={topic.progress?.completionPercentage || 0} 
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" component="span">
                              Due: {formatDate(topic.deadline)}
                            </Typography>
                            <Chip 
                              label={topic.progress?.completed ? 'Completed' : 'In Progress'} 
                              color={topic.progress?.completed ? 'success' : 'primary'} 
                              size="small"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ArrowForward color="action" />
                  </ListItemButton>
                </div>
              ))
            )}
          </List>
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
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
