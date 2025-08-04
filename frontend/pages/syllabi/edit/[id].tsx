import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Paper, CircularProgress, 
  TextField, FormControl, InputLabel, MenuItem, Select, 
  Alert, Grid, Divider
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { syllabusService } from '@/services/syllabus';
import { authService } from '@/services/api';
import { Syllabus } from '@/types';

export default function EditSyllabus() {
  const router = useRouter();
  const { id } = router.query;
  const syllabusId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Check if user is authenticated
  const currentUser = authService.getCurrentUser();
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    const fetchSyllabus = async () => {
      if (!syllabusId) return;
      
      try {
        setLoading(true);
        const syllabusData = await syllabusService.getById(syllabusId);
        
        // Format dates for input fields
        const formatDateForInput = (dateString: string | undefined) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setTitle(syllabusData.title);
        setDescription(syllabusData.description || '');
        setStartDate(formatDateForInput(syllabusData.startDate));
        setEndDate(formatDateForInput(syllabusData.endDate));
        
      } catch (err: any) {
        console.error('Failed to fetch syllabus:', err);
        setError(err.message || 'Failed to load syllabus data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabus();
  }, [syllabusId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }
    
    if (!syllabusId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedSyllabus = await syllabusService.update(syllabusId, {
        title,
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      
      setSuccess('Syllabus updated successfully');
      
      // Redirect back to syllabus view after short delay
      setTimeout(() => {
        router.push(`/syllabi/view/${syllabusId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to update syllabus:', err);
      setError(err.message || 'Failed to update syllabus');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <>
      <Head>
        <title>Edit Syllabus | StudyForge</title>
      </Head>
      
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Syllabus
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push(`/syllabi/view/${syllabusId}`)}
            >
              Back
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
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
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="startDate"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="endDate"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={saving}
                sx={{ minWidth: 120 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
