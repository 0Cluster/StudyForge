import { useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { CloudUpload, Timeline, Assignment, TrendingUp } from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authService } from '@/services/api';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  // Features for the landing page
  const features = [
    {
      title: 'Upload Any Document',
      description: 'Upload PDF, Word documents, or plain text files of your syllabus or study material.',
      icon: <CloudUpload fontSize="large" color="primary" />,
    },
    {
      title: 'AI-Generated Study Plan',
      description: 'Our AI will analyze your syllabus and create an optimal study plan with deadlines.',
      icon: <Timeline fontSize="large" color="primary" />,
    },
    {
      title: 'Adaptive Assessments',
      description: 'Test your knowledge with AI-generated questions at various difficulty levels.',
      icon: <Assignment fontSize="large" color="primary" />,
    },
    {
      title: 'Track Your Progress',
      description: 'Monitor your learning progress and get insights into your performance.',
      icon: <TrendingUp fontSize="large" color="primary" />,
    },
  ];

  const handleGetStarted = () => {
    setLoading(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <>
      <Head>
        <title>StudyForge - AI-Powered Study Planning</title>
        <meta name="description" content="StudyForge helps you organize your study materials, plan schedules, and track progress with AI assistance." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          pt: 8,
          pb: 6,
          background: 'linear-gradient(to right, #1976d2, #64b5f6)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
          >
            Master Your Study Material with AI
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Upload your syllabus, and our AI will create a personalized study plan, 
            generate assessments, and help you track your progress.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              disabled={loading}
              sx={{ px: 4, py: 1, fontSize: '1.1rem' }}
            >
              {loading ? 'Loading...' : 'Get Started'}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align="center">
                    {feature.title}
                  </Typography>
                  <Typography align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="section">
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to improve your study efficiency?
          </Typography>
          <Typography variant="subtitle1" align="center" paragraph>
            Join thousands of students who have optimized their learning with StudyForge.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href="/signup"
              sx={{ mx: 1 }}
            >
              Sign Up Free
            </Button>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/login"
              sx={{ mx: 1 }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
