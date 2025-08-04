import { useState } from 'react';
import { 
  Box, Typography, Button, Container, Paper, TextField, 
  FormControl, InputLabel, MenuItem, Select, 
  CircularProgress, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { syllabusService } from '@/services/syllabus';
import { authService } from '@/services/api';

export default function UploadSyllabus() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<'PDF' | 'WORD' | 'TEXT' | 'OTHER'>('PDF');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Stepper steps
  const steps = ['Document Information', 'Upload File', 'Process Document'];

  // Check if user is authenticated
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Auto-detect document type from file extension
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') {
        setDocumentType('PDF');
      } else if (extension === 'doc' || extension === 'docx') {
        setDocumentType('WORD');
      } else if (extension === 'txt') {
        setDocumentType('TEXT');
      } else {
        setDocumentType('OTHER');
      }
    }
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!title.trim()) {
        setError('Please enter a title');
        return;
      }
      // Optional: validate dates if provided
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setError('End date must be after start date');
        return;
      }
    } else if (activeStep === 1) {
      if (!file) {
        setError('Please upload a file');
        return;
      }
    }

    setError(null);
    if (activeStep === steps.length - 1) {
      handleUpload();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setError('Please provide all required information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the request object
      const uploadRequest = {
        file,
        title,
        description,
        userId: currentUser.id,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      // Use the syllabusService to upload the file with dates if provided
      const uploadedSyllabus = startDate || endDate 
        ? await syllabusService.uploadWithDates(uploadRequest)
        : await syllabusService.upload(file, title, description, currentUser.id);
      
      setSuccess('Syllabus uploaded successfully!');
      
      // Redirect after a short delay to the generate-topics page for this syllabus
      setTimeout(() => {
        router.push(`/syllabi/generate-topics/${uploadedSyllabus.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload syllabus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
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
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                label="Document Type"
                onChange={(e) => setDocumentType(e.target.value as any)}
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="WORD">Word Document</MenuItem>
                <MenuItem value="TEXT">Text File</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Select File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            
            {file && (
              <Alert severity="success" sx={{ mt: 2 }}>
                File selected: {file.name}
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supported file types: PDF, Word (.doc, .docx), Text (.txt)
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Please review your submission before uploading:
            </Typography>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body1"><strong>Title:</strong> {title}</Typography>
              <Typography variant="body1"><strong>Description:</strong> {description || 'Not provided'}</Typography>
              <Typography variant="body1"><strong>Document Type:</strong> {documentType}</Typography>
              <Typography variant="body1"><strong>Start Date:</strong> {startDate || 'Not provided'}</Typography>
              <Typography variant="body1"><strong>End Date:</strong> {endDate || 'Not provided'}</Typography>
              <Typography variant="body1"><strong>File:</strong> {file?.name}</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              After uploading, our AI will analyze your document and suggest topics and a study schedule.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Head>
        <title>Upload Syllabus - StudyForge</title>
        <meta name="description" content="Upload your syllabus document for AI analysis" />
      </Head>

      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Upload Study Material
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
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
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Processing...
                </>
              ) : activeStep === steps.length - 1 ? (
                'Upload'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
