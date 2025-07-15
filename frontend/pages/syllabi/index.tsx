import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  CardActions, CircularProgress, TextField, InputAdornment,
  LinearProgress, Divider, MenuItem, FormControl, 
  InputLabel, Select, SelectChangeEvent, IconButton,
  Menu, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Chip
} from '@mui/material';
import { 
  Add, Search, FilterList, Sort, CalendarToday, 
  DeleteOutline, EditOutlined, MoreVert, PictureAsPdf, 
  Description, InsertDriveFile, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { syllabusService } from '@/services/syllabus';
import { topicService } from '@/services/topic';
import { authService } from '@/services/api';
import { Syllabus } from '@/types';

// Sort and Filter Options
type SortOption = 'title' | 'createdAt' | 'progress';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'completed' | 'in_progress' | 'not_started';

export default function SyllabiList() {
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [syllabusToDelete, setSyllabusToDelete] = useState<Syllabus | null>(null);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: number]: HTMLElement | null }>({});
  
  // Sample data (replace with API calls when services are uncommented)
  const sampleSyllabi: Syllabus[] = [
    {
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
        }
      ]
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning concepts and algorithms',
      documentType: 'PDF',
      originalDocumentUrl: '/documents/ml101.pdf',
      startDate: '2023-09-01',
      endDate: '2024-01-15',
      createdAt: '2023-08-15T14:30:00Z',
      updatedAt: '2023-08-15T14:30:00Z',
      topics: [
        {
          id: 3,
          title: 'Supervised Learning',
          content: 'Regression and classification techniques',
          estimatedDurationMinutes: 150,
          deadline: '2023-09-20',
          orderIndex: 1,
          createdAt: '2023-08-15T14:30:00Z',
          updatedAt: '2023-08-15T14:30:00Z',
          syllabusId: 2,
          progress: {
            id: 3,
            completed: false,
            completionPercentage: 0,
            startedAt: null,
            completedAt: null,
            createdAt: '2023-08-15T14:30:00Z',
            updatedAt: '2023-08-15T14:30:00Z',
            topicId: 3
          }
        }
      ]
    },
    {
      id: 3,
      title: 'Advanced Database Systems',
      description: 'Deep dive into database architecture, optimization and distributed systems',
      documentType: 'WORD',
      originalDocumentUrl: '/documents/db_advanced.docx',
      startDate: '2023-10-01',
      endDate: '2024-02-28',
      createdAt: '2023-09-05T09:15:00Z',
      updatedAt: '2023-09-05T09:15:00Z',
      topics: [
        {
          id: 4,
          title: 'Database Normalization',
          content: 'First, second, and third normal forms',
          estimatedDurationMinutes: 120,
          deadline: '2023-10-15',
          orderIndex: 1,
          createdAt: '2023-09-05T09:15:00Z',
          updatedAt: '2023-09-05T09:15:00Z',
          syllabusId: 3,
          progress: {
            id: 4,
            completed: true,
            completionPercentage: 100,
            startedAt: '2023-10-05T10:00:00Z',
            completedAt: '2023-10-12T15:30:00Z',
            createdAt: '2023-10-05T10:00:00Z',
            updatedAt: '2023-10-12T15:30:00Z',
            topicId: 4
          }
        },
        {
          id: 5,
          title: 'Query Optimization',
          content: 'Execution plans and query tuning techniques',
          estimatedDurationMinutes: 180,
          deadline: '2023-11-01',
          orderIndex: 2,
          createdAt: '2023-09-05T09:15:00Z',
          updatedAt: '2023-09-05T09:15:00Z',
          syllabusId: 3,
          progress: {
            id: 5,
            completed: true,
            completionPercentage: 100,
            startedAt: '2023-10-20T09:00:00Z',
            completedAt: '2023-10-28T14:45:00Z',
            createdAt: '2023-10-20T09:00:00Z',
            updatedAt: '2023-10-28T14:45:00Z',
            topicId: 5
          }
        },
        {
          id: 6,
          title: 'Distributed Databases',
          content: 'Sharding, replication and consistency models',
          estimatedDurationMinutes: 210,
          deadline: '2023-11-15',
          orderIndex: 3,
          createdAt: '2023-09-05T09:15:00Z',
          updatedAt: '2023-09-05T09:15:00Z',
          syllabusId: 3,
          progress: {
            id: 6,
            completed: true,
            completionPercentage: 100,
            startedAt: '2023-11-02T08:30:00Z',
            completedAt: '2023-11-12T16:20:00Z',
            createdAt: '2023-11-02T08:30:00Z',
            updatedAt: '2023-11-12T16:20:00Z',
            topicId: 6
          }
        }
      ]
    }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const fetchSyllabi = async () => {
      setLoading(true);
      try {
        // Fetch all syllabi for the current user
        const data = await syllabusService.getAllByUser(currentUser.id);
        
        // For each syllabus, fetch additional details (progress)
        const syllabiWithDetails = await Promise.all(
          data.map(async (syllabus) => {
            // If topics are not already included, fetch them
            if (!syllabus.topics || syllabus.topics.length === 0) {
              try {
                const topics = await topicService.getAllBySyllabus(syllabus.id);
                
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
                
                syllabus.topics = topicsWithProgress;
              } catch (err) {
                console.error(`Error fetching topics for syllabus ${syllabus.id}:`, err);
                syllabus.topics = [];
              }
            }
            
            return syllabus;
          })
        );
        
        setSyllabi(syllabiWithDetails);
      } catch (err) {
        console.error('Error fetching syllabi:', err);
        setError('Failed to load syllabi. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabi();
  }, [router]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, syllabusId: number) => {
    setMenuAnchorEl({
      ...menuAnchorEl,
      [syllabusId]: event.currentTarget
    });
  };

  const handleMenuClose = (syllabusId: number) => {
    setMenuAnchorEl({
      ...menuAnchorEl,
      [syllabusId]: null
    });
  };

  const handleDeleteConfirm = (syllabus: Syllabus) => {
    setSyllabusToDelete(syllabus);
    setDeleteDialogOpen(true);
    // Close the menu
    handleMenuClose(syllabus.id);
  };

  const handleDelete = async () => {
    if (!syllabusToDelete) return;
    
    try {
      // Delete syllabus via API
      await syllabusService.delete(syllabusToDelete.id);
      
      // Update local state
      setSyllabi(syllabi.filter(s => s.id !== syllabusToDelete.id));
      
      // Close dialog
      setDeleteDialogOpen(false);
      setSyllabusToDelete(null);
    } catch (err) {
      console.error('Error deleting syllabus:', err);
      setError('Failed to delete syllabus. Please try again later.');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortOption);
  };

  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterBy(event.target.value as FilterOption);
  };

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

  // Get document type icon
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <PictureAsPdf fontSize="small" />;
      case 'WORD': return <Description fontSize="small" />;
      case 'TEXT': return <InsertDriveFile fontSize="small" />;
      default: return <InsertDriveFile fontSize="small" />;
    }
  };

  // Filter syllabi
  const filteredSyllabi = syllabi.filter(syllabus => {
    // Apply search filter
    if (searchQuery && !syllabus.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    const progress = calculateOverallProgress(syllabus);
    if (filterBy === 'completed' && progress < 100) return false;
    if (filterBy === 'in_progress' && (progress === 0 || progress === 100)) return false;
    if (filterBy === 'not_started' && progress > 0) return false;
    
    return true;
  });

  // Sort syllabi
  const sortedSyllabi = [...filteredSyllabi].sort((a, b) => {
    if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === 'createdAt') {
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'progress') {
      const progressA = calculateOverallProgress(a);
      const progressB = calculateOverallProgress(b);
      return sortDirection === 'asc'
        ? progressA - progressB
        : progressB - progressA;
    }
    return 0;
  });

  // Get status label and color for a syllabus
  const getSyllabusStatus = (syllabus: Syllabus): { label: string, color: string } => {
    const progress = calculateOverallProgress(syllabus);
    if (progress === 100) return { label: 'Completed', color: 'success.main' };
    if (progress > 0) return { label: 'In Progress', color: 'primary.main' };
    return { label: 'Not Started', color: 'text.secondary' };
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
        <title>My Syllabi - StudyForge</title>
        <meta name="description" content="Manage your study materials and syllabi" />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Study Materials
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            component={Link}
            href="/syllabi/upload"
          >
            Upload New Material
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search syllabi..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <Sort fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="createdAt">Date Added</MenuItem>
                  <MenuItem value="progress">Progress</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}>
                <IconButton 
                  onClick={handleSortDirectionToggle}
                  size="small"
                  sx={{ alignSelf: 'center' }}
                >
                  {sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                </IconButton>
              </Tooltip>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="filter-label">Filter By</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filterBy}
                  label="Filter By"
                  onChange={handleFilterChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Materials</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="not_started">Not Started</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
        
        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {sortedSyllabi.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  No study materials found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {searchQuery || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first syllabus to get started'}
                </Typography>
                {!searchQuery && filterBy === 'all' && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    component={Link}
                    href="/syllabi/upload"
                  >
                    Upload New Material
                  </Button>
                )}
              </Box>
            </Grid>
          ) : (
            sortedSyllabi.map((syllabus) => {
              const progress = calculateOverallProgress(syllabus);
              const status = getSyllabusStatus(syllabus);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={syllabus.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {syllabus.title}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuOpen(e, syllabus.id)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchorEl[syllabus.id]}
                            open={Boolean(menuAnchorEl[syllabus.id])}
                            onClose={() => handleMenuClose(syllabus.id)}
                          >
                            <MenuItem 
                              component={Link} 
                              href={`/syllabi/view/${syllabus.id}`}
                              onClick={() => handleMenuClose(syllabus.id)}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem 
                              component={Link} 
                              href={`/syllabi/edit/${syllabus.id}`}
                              onClick={() => handleMenuClose(syllabus.id)}
                            >
                              <EditOutlined fontSize="small" sx={{ mr: 1 }} />
                              Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={() => handleDeleteConfirm(syllabus)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getDocumentTypeIcon(syllabus.documentType)}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {syllabus.documentType}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2, minHeight: '40px' }}>
                        {syllabus.description?.length > 100
                          ? `${syllabus.description.substring(0, 100)}...`
                          : syllabus.description || 'No description available'}
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2">
                            <strong>Progress:</strong>
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ color: status.color }}
                          >
                            {progress}% - {status.label}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ height: 8, borderRadius: 4 }}
                          color={progress === 100 ? 'success' : 'primary'}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Due: {formatDate(syllabus.endDate)}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${syllabus.topics?.length || 0} Topics`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        component={Link} 
                        href={`/syllabi/view/${syllabus.id}`}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        component={Link}
                        href={`/study/${syllabus.id}`}
                      >
                        Study Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Syllabus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{syllabusToDelete?.title}"? This action cannot be undone.
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
