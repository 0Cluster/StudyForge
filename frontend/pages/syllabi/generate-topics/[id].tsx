import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Paper, CircularProgress, 
  List, ListItem, ListItemText, Divider, TextField, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Alert, Card, CardContent, Grid, Chip
} from '@mui/material';
import { 
  ArrowBack, Add, Edit, Delete, Save, AutoAwesome,
  Cancel, CalendarToday, AccessTime
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { Syllabus, Topic, CreateTopicRequest } from '@/types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function TopicGenerator() {
  const router = useRouter();
  const { id } = router.query;
  const syllabusId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [generatedTopics, setGeneratedTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedDuration, setEditedDuration] = useState<number | ''>('');
  const [editedDeadline, setEditedDeadline] = useState('');

  useEffect(() => {
    const fetchSyllabusAndTopics = async () => {
      if (!syllabusId) return;
      
      try {
        setLoading(true);
        
        // Fetch the syllabus
        const syllabusData = await syllabusService.getById(syllabusId);
        setSyllabus(syllabusData);
        
        // Fetch existing topics
        const topicsData = await topicService.getAllBySyllabus(syllabusId);
        setTopics(topicsData);
        
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load syllabus data');
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabusAndTopics();
  }, [syllabusId]);

  const handleGenerateTopics = async () => {
    if (!syllabusId) return;
    
    try {
      setGenerating(true);
      setError(null);
      
      // Call the API to generate topics
      const generatedTopics = await syllabusService.generateTopics(syllabusId);
      setGeneratedTopics(generatedTopics);
      setSuccess('Topics generated successfully! Review and save them below.');
      
    } catch (err: any) {
      console.error('Failed to generate topics:', err);
      setError(err.message || 'Failed to generate topics');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTopics = async () => {
    if (!syllabusId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // For each generated topic, create it in the database
      for (const topic of generatedTopics) {
        const topicRequest: CreateTopicRequest = {
          title: topic.title,
          content: topic.content || '',
          estimatedDurationMinutes: topic.estimatedDurationMinutes,
          deadline: topic.deadline,
          orderIndex: topic.orderIndex,
          syllabusId: syllabusId
        };
        
        await topicService.create(topicRequest);
      }
      
      // Fetch the updated topics
      const updatedTopics = await topicService.getAllBySyllabus(syllabusId);
      setTopics(updatedTopics);
      
      // Clear generated topics
      setGeneratedTopics([]);
      
      setSuccess('Topics saved successfully!');
      
      // Redirect to syllabus detail page
      router.push(`/syllabi/${syllabusId}`);
      
    } catch (err: any) {
      console.error('Failed to save topics:', err);
      setError(err.message || 'Failed to save topics');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setEditedTitle(topic.title);
    setEditedContent(topic.content || '');
    setEditedDuration(topic.estimatedDurationMinutes || '');
    setEditedDeadline(topic.deadline || '');
  };

  const handleSaveEdit = () => {
    if (!editingTopic) return;
    
    const updatedTopic: Topic = {
      ...editingTopic,
      title: editedTitle,
      content: editedContent,
      estimatedDurationMinutes: typeof editedDuration === 'number' ? editedDuration : undefined,
      deadline: editedDeadline || undefined
    };
    
    // Update in the correct array
    if (generatedTopics.find(t => t.id === editingTopic.id)) {
      setGeneratedTopics(generatedTopics.map(t => 
        t.id === editingTopic.id ? updatedTopic : t
      ));
    } else {
      setTopics(topics.map(t => 
        t.id === editingTopic.id ? updatedTopic : t
      ));
    }
    
    setEditingTopic(null);
  };

  const handleCancelEdit = () => {
    setEditingTopic(null);
  };

  const handleDeleteGeneratedTopic = (topicIndex: number) => {
    setGeneratedTopics(generatedTopics.filter((_, index) => index !== topicIndex));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reorderedTopics = Array.from(generatedTopics);
    const [removed] = reorderedTopics.splice(result.source.index, 1);
    reorderedTopics.splice(result.destination.index, 0, removed);
    
    // Update order indexes
    const updatedTopics = reorderedTopics.map((topic, index) => ({
      ...topic,
      orderIndex: index + 1
    }));
    
    setGeneratedTopics(updatedTopics);
  };

  if (loading && !generating) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Topic Generator | StudyForge</title>
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={Link}
            href={`/syllabi/${syllabusId}`}
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Back to Syllabus
          </Button>
          <Typography variant="h4" component="h1">
            Topic Generator
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {syllabus && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              {syllabus.title}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {syllabus.description || 'No description provided.'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Chip 
                label={`Document Type: ${syllabus.documentType}`} 
                variant="outlined" 
              />
              
              {syllabus.startDate && (
                <Chip 
                  icon={<CalendarToday fontSize="small" />}
                  label={`Start: ${new Date(syllabus.startDate).toLocaleDateString()}`} 
                  variant="outlined" 
                />
              )}
              
              {syllabus.endDate && (
                <Chip 
                  icon={<CalendarToday fontSize="small" />}
                  label={`End: ${new Date(syllabus.endDate).toLocaleDateString()}`} 
                  variant="outlined" 
                />
              )}
              
              {syllabus.originalDocumentUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudDownload />}
                  component="a"
                  href={syllabus.originalDocumentUrl}
                  target="_blank"
                >
                  Original Document
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generate Topics
              </Typography>
              
              <Typography variant="body1" paragraph>
                Use AI to automatically extract and generate topics from your syllabus document.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateTopics}
                disabled={generating}
              >
                {generating ? 'Generating Topics...' : 'Generate Topics'}
              </Button>
              {generating && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
          </Paper>
        )}
        
        {/* Display existing topics */}
        {topics.length > 0 && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Existing Topics
            </Typography>
            
            <List>
              {topics.map((topic, index) => (
                <React.Fragment key={topic.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleEditTopic(topic)}>
                        <Edit />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={topic.title}
                      secondary={
                        <>
                          {topic.estimatedDurationMinutes && (
                            <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                              <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              Estimated duration: {topic.estimatedDurationMinutes} minutes
                            </Typography>
                          )}
                          
                          {topic.deadline && (
                            <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                              <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              Deadline: {new Date(topic.deadline).toLocaleDateString()}
                            </Typography>
                          )}
                          
                          {topic.content && (
                            <Typography component="span" variant="body2" sx={{ display: 'block', mt: 0.5 }}>
                              {topic.content.substring(0, 100)}{topic.content.length > 100 ? '...' : ''}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
        
        {/* Display generated topics */}
        {generatedTopics.length > 0 && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Generated Topics
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveTopics}
              >
                Save All Topics
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Drag and drop to reorder topics. Edit or delete topics as needed before saving.
            </Typography>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="topicsList">
                {(provided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {generatedTopics.map((topic, index) => (
                      <Draggable key={`generated-${index}`} draggableId={`generated-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {topic.title}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                    {topic.estimatedDurationMinutes && (
                                      <Chip
                                        size="small"
                                        icon={<AccessTime fontSize="small" />}
                                        label={`${topic.estimatedDurationMinutes} min`}
                                        variant="outlined"
                                      />
                                    )}
                                    
                                    {topic.deadline && (
                                      <Chip
                                        size="small"
                                        icon={<CalendarToday fontSize="small" />}
                                        label={new Date(topic.deadline).toLocaleDateString()}
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                  
                                  {topic.content && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      {topic.content}
                                    </Typography>
                                  )}
                                </Box>
                                
                                <Box>
                                  <IconButton onClick={() => handleEditTopic(topic)} size="small">
                                    <Edit />
                                  </IconButton>
                                  <IconButton onClick={() => handleDeleteGeneratedTopic(index)} size="small">
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        )}
        
        {/* Edit Topic Dialog */}
        <Dialog open={!!editingTopic} onClose={handleCancelEdit} maxWidth="md" fullWidth>
          <DialogTitle>Edit Topic</DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Estimated Duration (minutes)"
                value={editedDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setEditedDuration('');
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setEditedDuration(numValue);
                    }
                  }
                }}
                type="number"
                inputProps={{ min: 0 }}
                sx={{ flexGrow: 1 }}
              />
              
              <TextField
                label="Deadline"
                value={editedDeadline}
                onChange={(e) => setEditedDeadline(e.target.value)}
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit} color="inherit" startIcon={<Cancel />}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} color="primary" startIcon={<Save />}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
