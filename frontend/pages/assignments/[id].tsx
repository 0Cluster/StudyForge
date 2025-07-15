import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Paper, CircularProgress, 
  Stepper, Step, StepLabel, Radio, RadioGroup, FormControlLabel, 
  FormControl, FormLabel, TextField, Card, CardContent, Divider,
  Rating, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Chip, Grid
} from '@mui/material';
import { 
  ArrowBack, ArrowForward, Send, Check, Close, 
  EmojiEvents, School, CheckCircle
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { assignmentService } from '@/services/assignment';
import { Assignment, Question, QuestionOption } from '@/types';

export default function AssignmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const assignmentId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  
  // We'll fetch assignment data from the API

  useEffect(() => {
    if (!assignmentId) return;
    
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        // Get assignment data from API
        const data = await assignmentService.getById(assignmentId);
        setAssignment(data);
        setSubmitted(data.isCompleted);
        setShowResults(data.isCompleted);
        
        // If assignment is completed, pre-fill answers
        if (data.isCompleted) {
          // Get submission details if available
          try {
            const submissions = await assignmentService.getSubmissions(assignmentId);
            if (submissions && submissions.length > 0) {
              // Use the most recent submission
              const latestSubmission = submissions[submissions.length - 1];
              
              // Create answer map from submission
              const answerMap: Record<number, string> = {};
              if (latestSubmission.answers) {
                latestSubmission.answers.forEach(answer => {
                  answerMap[answer.questionId] = answer.userAnswer;
                });
              }
              setAnswers(answerMap);
            } else if (data.questions) {
              // Fallback to data from the assignment if it has user answers
              const answerMap: Record<number, string> = {};
              data.questions.forEach(q => {
                if (q.userAnswer) {
                  answerMap[q.id] = q.userAnswer;
                }
              });
              setAnswers(answerMap);
            }
          } catch (submissionErr) {
            console.error('Error fetching submission details:', submissionErr);
          }
        }
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Failed to load assignment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignment();
  }, [assignmentId]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleOptionSelect = (questionId: number, optionText: string) => {
    handleAnswerChange(questionId, optionText);
  };

  const handleSubmit = async () => {
    if (!assignment?.questions) return;
    
    setSubmitting(true);
    
    try {
      // Prepare submission data
      const questionIds = Object.keys(answers).map(id => parseInt(id));
      const userAnswers = Object.values(answers);
      
      // Submit answers to the API
      const result = await assignmentService.submitAnswers(assignmentId, questionIds, userAnswers);
      
      // Set score from API response
      setScore(result.score || 0);
      
      setSubmitted(true);
      setShowResults(true);
      
      // Update local state with the results
      setAssignment(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          isCompleted: true,
          earnedPoints: result.score || 0
        };
      });
      
      setCompleteDialogOpen(true);
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Failed to submit assignment. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get the current question
  const getCurrentQuestion = (): Question | undefined => {
    if (!assignment?.questions) return undefined;
    return assignment.questions[activeStep];
  };

  // Format difficulty
  const formatDifficulty = (level: string): string => {
    return level.charAt(0) + level.slice(1).toLowerCase();
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

  // Calculate score percentage
  const getScorePercentage = (): number => {
    if (!assignment?.maxPoints || !score) return 0;
    return Math.round((score / assignment.maxPoints) * 100);
  };

  // Get feedback based on score percentage
  const getScoreFeedback = (): { text: string, color: string } => {
    const percentage = getScorePercentage();
    
    if (percentage >= 90) return { text: 'Excellent!', color: 'success.main' };
    if (percentage >= 75) return { text: 'Great job!', color: 'success.main' };
    if (percentage >= 60) return { text: 'Good effort!', color: 'primary.main' };
    if (percentage >= 40) return { text: 'Keep practicing!', color: 'warning.main' };
    return { text: 'Needs improvement', color: 'error.main' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !assignment) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Assignment not found'}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <>
      <Head>
        <title>{assignment.title} - StudyForge</title>
        <meta name="description" content={`Complete the ${assignment.title} assignment`} />
      </Head>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => router.push(`/topics/${assignment.topicId}`)}
              sx={{ mb: 1 }}
            >
              Back to Topic
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {assignment.title}
              {assignment.isCompleted && (
                <CheckCircle color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />
              )}
            </Typography>
          </Box>
          
          <Chip 
            label={formatDifficulty(assignment.difficultyLevel)} 
            color={getDifficultyColor(assignment.difficultyLevel) as any}
          />
        </Box>
        
        <Typography variant="body1" paragraph>
          {assignment.content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Total Points:</strong> {assignment.maxPoints}
          </Typography>
          {assignment.isCompleted && (
            <Typography variant="body2" color="text.secondary">
              <strong>Your Score:</strong> {assignment.earnedPoints}/{assignment.maxPoints} ({Math.round((assignment.earnedPoints / assignment.maxPoints) * 100)}%)
            </Typography>
          )}
        </Box>
      </Box>

      {submitted && showResults ? (
        // Results view
        <Box>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Assignment Results
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <EmojiEvents sx={{ fontSize: 40, color: getScoreFeedback().color }} />
                <Typography variant="h4" sx={{ color: getScoreFeedback().color }}>
                  {score}/{assignment.maxPoints} Points ({getScorePercentage()}%)
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: getScoreFeedback().color, mt: 1 }}>
                {getScoreFeedback().text}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Question Review
            </Typography>
            
            {assignment.questions?.map((question, index) => (
              <Card key={question.id} sx={{ mb: 3, border: '1px solid', borderColor: question.isCorrect ? 'success.light' : 'error.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6">
                      Question {index + 1}
                    </Typography>
                    <Box>
                      {question.isCorrect ? (
                        <Chip icon={<Check />} label="Correct" color="success" size="small" />
                      ) : (
                        <Chip icon={<Close />} label="Incorrect" color="error" size="small" />
                      )}
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
                        {question.isCorrect ? question.points : 0}/{question.points} points
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                    {question.text}
                  </Typography>
                  
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your Answer:
                    </Typography>
                    <Typography variant="body1">
                      {answers[question.id] || 'No answer provided'}
                    </Typography>
                  </Box>
                  
                  {!question.isCorrect && (
                    <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Correct Answer:
                      </Typography>
                      <Typography variant="body1">
                        {question.correctAnswer}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => router.push(`/topics/${assignment.topicId}`)}
                endIcon={<ArrowForward />}
              >
                Return to Topic
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        // Assignment taking view
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {assignment.questions?.map((question, index) => (
              <Step key={question.id}>
                <StepLabel>Question {index + 1}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {currentQuestion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Question {activeStep + 1} of {assignment.questions?.length}
              </Typography>
              <Typography variant="body1" paragraph>
                {currentQuestion.text}
              </Typography>
              
              <Box sx={{ my: 4 }}>
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                    >
                      {currentQuestion.options?.map((option) => (
                        <FormControlLabel
                          key={option.id}
                          value={option.text}
                          control={<Radio />}
                          label={option.text}
                          disabled={submitted}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
                
                {currentQuestion.type === 'TRUE_FALSE' && (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                    >
                      <FormControlLabel value="True" control={<Radio />} label="True" disabled={submitted} />
                      <FormControlLabel value="False" control={<Radio />} label="False" disabled={submitted} />
                    </RadioGroup>
                  </FormControl>
                )}
                
                {currentQuestion.type === 'SHORT_ANSWER' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Your Answer"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    disabled={submitted}
                  />
                )}
                
                {currentQuestion.type === 'ESSAY' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Your Answer"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    disabled={submitted}
                    placeholder="Write your detailed answer here..."
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                <Box>
                  {activeStep === assignment.questions.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={submitting || submitted}
                      startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                    >
                      {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Completion Dialog */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          Assignment Complete!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              You scored {score}/{assignment.maxPoints}
            </Typography>
            <Typography variant="h6" color={getScoreFeedback().color}>
              {getScoreFeedback().text}
            </Typography>
          </Box>
          <DialogContentText sx={{ textAlign: 'center', mt: 2 }}>
            You can now review your answers and see the correct solutions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)} variant="contained" fullWidth>
            View Results
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
