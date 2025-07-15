import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Paper, CircularProgress, 
  Card, CardContent, Divider, Grid, Rating, Chip, List, 
  ListItem, ListItemText, Alert
} from '@mui/material';
import { 
  ArrowBack, CheckCircle, Cancel, EmojiEvents, School
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { assignmentService } from '@/services/assignment';
import { SubmissionResponse, QuestionResponse, Assignment } from '@/types';

export default function SubmissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const submissionId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) return;
      
      try {
        setLoading(true);
        const submissionData = await assignmentService.getSubmission(submissionId);
        setSubmission(submissionData);
        
        // Fetch the original assignment
        if (submissionData.assignmentId) {
          const assignmentData = await assignmentService.getById(submissionData.assignmentId);
          setAssignment(assignmentData);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch submission:', err);
        setError(err.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
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
        <Button
          component={Link}
          href="/dashboard"
          variant="outlined"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Submission Review | StudyForge</title>
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={Link}
            href={`/assignments/${submission?.assignmentId}`}
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Back to Assignment
          </Button>
          <Typography variant="h4" component="h1">
            Submission Review
          </Typography>
        </Box>

        {submission && (
          <>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {assignment?.title || 'Assignment'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Submitted on {new Date(submission.submittedAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" component="div">
                      Score
                    </Typography>
                    <Chip 
                      label={`${submission.score}%`} 
                      color={getScoreColor(submission.score) as "success" | "warning" | "error"}
                      icon={submission.score >= 60 ? <CheckCircle /> : <Cancel />}
                      sx={{ fontSize: '1.25rem', py: 2, px: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Feedback
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                <Typography variant="body1">
                  {submission.feedback || 'No detailed feedback provided.'}
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Your Submission
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1">
                  {submission.submission || 'No submission content available.'}
                </Typography>
              </Paper>
            </Paper>

            {submission.questionResponses && submission.questionResponses.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question Responses
                  </Typography>
                  <List>
                    {submission.questionResponses.map((response, index) => {
                      // Find the original question if available
                      const question = assignment?.questions?.find(q => q.id === response.questionId);
                      
                      return (
                        <ListItem key={response.id} divider={index < submission.questionResponses!.length - 1}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1">
                                  Question {index + 1}: {question?.text || 'Question'}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={response.isCorrect ? 'Correct' : 'Incorrect'}
                                  color={response.isCorrect ? 'success' : 'error'}
                                  icon={response.isCorrect ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Your answer: {response.userAnswer}
                                </Typography>
                                {question?.correctAnswer && (
                                  <Typography variant="body2" color="text.secondary">
                                    Correct answer: {question.correctAnswer}
                                  </Typography>
                                )}
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  Points: {response.points} / {question?.points || '?'}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </>
  );
}
