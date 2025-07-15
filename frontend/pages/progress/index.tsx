import { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Grid, Card, CardContent, 
  CircularProgress, LinearProgress, Divider, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Chip, IconButton, Tooltip, Alert
} from '@mui/material';
import { 
  TrendingUp, CalendarToday, CheckCircle, Today, 
  Schedule, OpenInNew, FilterList, Sort
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { topicService } from '@/services/topic';
import { syllabusService } from '@/services/syllabus';
import { Syllabus, Topic, Progress } from '@/types';

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
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProgressDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [progressData, setProgressData] = useState<Record<number, Progress[]>>({});
  const [tabValue, setTabValue] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalSyllabi: 0,
    completedSyllabi: 0, 
    inProgressSyllabi: 0,
    completedTopics: 0,
    totalTopics: 0,
    averageCompletion: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you'd get the user ID from auth context
        const userId = 1; // placeholder
        const syllabiData = await syllabusService.getAllByUser(userId);
        setSyllabi(syllabiData);
        
        // Fetch progress for each syllabus
        const progressDataMap: Record<number, Progress[]> = {};
        let completedTopics = 0;
        let totalTopics = 0;
        
        for (const syllabus of syllabiData) {
          if (syllabus.id) {
            const syllabusProgress = await topicService.getSyllabusProgress(syllabus.id);
            progressDataMap[syllabus.id] = syllabusProgress;
            
            // Count completed topics
            completedTopics += syllabusProgress.filter(p => p.completed).length;
            totalTopics += syllabusProgress.length;
          }
        }
        
        setProgressData(progressDataMap);
        
        // Calculate stats
        const completedSyllabi = syllabiData.filter(s => {
          const syllabusProgress = progressDataMap[s.id];
          if (!syllabusProgress || syllabusProgress.length === 0) return false;
          return syllabusProgress.every(p => p.completed);
        }).length;
        
        const inProgressSyllabi = syllabiData.filter(s => {
          const syllabusProgress = progressDataMap[s.id];
          if (!syllabusProgress || syllabusProgress.length === 0) return false;
          return syllabusProgress.some(p => p.completed) && 
                 !syllabusProgress.every(p => p.completed);
        }).length;
        
        const averageCompletion = totalTopics > 0 
          ? Math.round((completedTopics / totalTopics) * 100) 
          : 0;
        
        setStats({
          totalSyllabi: syllabiData.length,
          completedSyllabi,
          inProgressSyllabi,
          completedTopics,
          totalTopics,
          averageCompletion
        });
        
      } catch (err: any) {
        console.error('Error fetching progress data:', err);
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const getCompletionStatus = (progress: Progress[]) => {
    if (!progress || progress.length === 0) return 'Not Started';
    if (progress.every(p => p.completed)) return 'Completed';
    if (progress.some(p => p.completed)) return 'In Progress';
    return 'Not Started';
  };
  
  const getOverallProgress = (progress: Progress[]) => {
    if (!progress || progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.completionPercentage, 0);
    return Math.round(total / progress.length);
  };
  
  const getSyllabusTimeline = (syllabus: Syllabus) => {
    if (!syllabus.startDate && !syllabus.endDate) return 'No dates set';
    if (syllabus.startDate && syllabus.endDate) {
      return `${new Date(syllabus.startDate).toLocaleDateString()} - ${new Date(syllabus.endDate).toLocaleDateString()}`;
    }
    if (syllabus.startDate) return `Started: ${new Date(syllabus.startDate).toLocaleDateString()}`;
    if (syllabus.endDate) return `Due: ${new Date(syllabus.endDate).toLocaleDateString()}`;
    return '';
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <>
      <Head>
        <title>Progress Dashboard | StudyForge</title>
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Progress Dashboard
        </Typography>
        
        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Overall Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={stats.averageCompletion} 
                      size={60}
                      color="success"
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary">
                        {`${stats.averageCompletion}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5" component="div">
                    {stats.completedTopics} / {stats.totalTopics}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Topics completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Syllabi
                </Typography>
                <Typography variant="h5" component="div">
                  {stats.totalSyllabi}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    size="small" 
                    label={`${stats.completedSyllabi} Completed`} 
                    color="success" 
                    icon={<CheckCircle />} 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                  <Chip 
                    size="small" 
                    label={`${stats.inProgressSyllabi} In Progress`} 
                    color="warning" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Recent Activity
                </Typography>
                {progressData && Object.values(progressData).flat().length > 0 ? (
                  <Box>
                    {Object.values(progressData)
                      .flat()
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 3)
                      .map((progress, index) => (
                        <Box key={progress.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {progress.completed ? 
                            <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                            <Schedule color="warning" sx={{ mr: 1 }} />
                          }
                          <Typography variant="body2">
                            {progress.completed ? 'Completed' : 'Updated'} topic {progress.topicId} - {new Date(progress.updatedAt).toLocaleString()}
                          </Typography>
                        </Box>
                      ))
                    }
                  </Box>
                ) : (
                  <Typography variant="body2">No recent activity</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for different views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="progress tabs">
            <Tab label="By Syllabus" />
            <Tab label="Timeline" />
            <Tab label="Detailed Progress" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {syllabi.map((syllabus) => (
              <Grid item xs={12} md={6} key={syllabus.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {syllabus.title}
                      </Typography>
                      <Tooltip title="Open Syllabus">
                        <IconButton 
                          component={Link} 
                          href={`/syllabi/${syllabus.id}`} 
                          size="small"
                        >
                          <OpenInNew />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                      <CalendarToday fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {getSyllabusTimeline(syllabus)}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getOverallProgress(progressData[syllabus.id] || [])}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getOverallProgress(progressData[syllabus.id] || [])}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={getCompletionStatus(progressData[syllabus.id] || [])} 
                        color={
                          getCompletionStatus(progressData[syllabus.id] || []) === 'Completed' ? 'success' :
                          getCompletionStatus(progressData[syllabus.id] || []) === 'In Progress' ? 'warning' : 
                          'default'
                        }
                        size="small"
                      />
                      <Button
                        component={Link}
                        href={`/study/${syllabus.id}`}
                        variant="contained"
                        size="small"
                      >
                        Continue Study
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Syllabus</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell align="right">Progress</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(progressData).flatMap(([syllabusId, progresses]) => {
                  const syllabus = syllabi.find(s => s.id === Number(syllabusId));
                  
                  return progresses.map(progress => {
                    // Find the topic from the syllabus
                    const topic = syllabus?.topics?.find(t => t.id === progress.topicId);
                    
                    return (
                      <TableRow key={progress.id}>
                        <TableCell>
                          {progress.updatedAt ? new Date(progress.updatedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/syllabi/${syllabusId}`}>
                            {syllabus?.title || `Syllabus #${syllabusId}`}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/study/${syllabusId}/topic/${progress.topicId}`}>
                            {topic?.title || `Topic #${progress.topicId}`}
                          </Link>
                        </TableCell>
                        <TableCell align="right">
                          {progress.completionPercentage}%
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={progress.completed ? "Completed" : "In Progress"} 
                            color={progress.completed ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {syllabi.map((syllabus) => {
            const syllabusProgress = progressData[syllabus.id] || [];
            
            return (
              <Box key={syllabus.id} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {syllabus.title}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Topic</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Progress</TableCell>
                        <TableCell align="right">Started</TableCell>
                        <TableCell align="right">Completed</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {syllabus.topics?.map((topic) => {
                        const topicProgress = syllabusProgress.find(p => p.topicId === topic.id);
                        
                        return (
                          <TableRow key={topic.id}>
                            <TableCell>{topic.title}</TableCell>
                            <TableCell align="center">
                              {topicProgress ? (
                                <Chip 
                                  label={topicProgress.completed ? "Completed" : "In Progress"} 
                                  color={topicProgress.completed ? "success" : "warning"}
                                  size="small"
                                />
                              ) : (
                                <Chip label="Not Started" size="small" />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {topicProgress ? `${topicProgress.completionPercentage}%` : '0%'}
                            </TableCell>
                            <TableCell align="right">
                              {topicProgress?.startedAt ? new Date(topicProgress.startedAt).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {topicProgress?.completedAt ? new Date(topicProgress.completedAt).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                component={Link}
                                href={`/study/${syllabus.id}/topic/${topic.id}`}
                                size="small"
                              >
                                Study
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </TabPanel>
      </Container>
    </>
  );
}
