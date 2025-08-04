import api from './api';
import { Syllabus, Topic, UploadSyllabusRequest } from '@/types';

export const syllabusService = {
  // Get all syllabi for a user
  getAllByUser: async (userId: number): Promise<Syllabus[]> => {
    const response = await api.get(`/syllabi/user/${userId}`);
    return response.data;
  },
  
  // Get a single syllabus by ID
  getById: async (id: number): Promise<Syllabus> => {
    const response = await api.get(`/syllabi/${id}`);
    return response.data;
  },
  
  // Create a new syllabus
  create: async (syllabus: Omit<Syllabus, 'id' | 'createdAt' | 'updatedAt'>, userId: number): Promise<Syllabus> => {
    const response = await api.post(`/syllabi?userId=${userId}`, syllabus);
    return response.data;
  },
  
  // Upload a syllabus document
  upload: async (file: File, title: string, description: string | undefined, userId: number): Promise<Syllabus> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    formData.append('userId', userId.toString());
    
    const response = await api.post('/syllabi/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Upload a syllabus document with start and end dates
  uploadWithDates: async (request: UploadSyllabusRequest): Promise<Syllabus> => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('title', request.title);
    if (request.description) {
      formData.append('description', request.description);
    }
    formData.append('userId', request.userId.toString());
    
    // Format dates to YYYY-MM-DD
    if (request.startDate) {
      // If already a string in YYYY-MM-DD format, use as is
      if (typeof request.startDate === 'string') {
        formData.append('startDate', request.startDate);
      } else {
        // If it's a Date object, format it
        const date = new Date(request.startDate);
        const formattedDate = date.toISOString().split('T')[0]; // Gets YYYY-MM-DD
        formData.append('startDate', formattedDate);
      }
    }
    
    if (request.endDate) {
      // If already a string in YYYY-MM-DD format, use as is
      if (typeof request.endDate === 'string') {
        formData.append('endDate', request.endDate);
      } else {
        // If it's a Date object, format it
        const date = new Date(request.endDate);
        const formattedDate = date.toISOString().split('T')[0]; // Gets YYYY-MM-DD
        formData.append('endDate', formattedDate);
      }
    }
    
    const response = await api.post('/syllabi/upload-with-dates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Process a document using the new API endpoint
  processDocument: async (request: UploadSyllabusRequest): Promise<Syllabus> => {
    const formData = new FormData();
    formData.append('file', request.file);
    
    // Format dates as strings in YYYY-MM-DD format
    let startDateStr = undefined;
    let endDateStr = undefined;
    
    if (request.startDate) {
      if (typeof request.startDate === 'string') {
        startDateStr = request.startDate;
      } else {
        const date = new Date(request.startDate);
        startDateStr = date.toISOString().split('T')[0];
      }
    }
    
    if (request.endDate) {
      if (typeof request.endDate === 'string') {
        endDateStr = request.endDate;
      } else {
        const date = new Date(request.endDate);
        endDateStr = date.toISOString().split('T')[0];
      }
    }
    
    // Create JSON request object for the structured request
    const documentRequest = {
      title: request.title,
      description: request.description,
      userId: request.userId,
      startDate: startDateStr,
      endDate: endDateStr
    };
    
    // Convert to JSON string and append to form data
    formData.append('request', new Blob([JSON.stringify(documentRequest)], { 
      type: 'application/json' 
    }));
    
    const response = await api.post('/syllabi/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Generate topics from syllabus
  generateTopics: async (syllabusId: number): Promise<Topic[]> => {
    const response = await api.post(`/syllabi/${syllabusId}/generate-topics`);
    return response.data;
  },
  
  // Update a syllabus
  update: async (id: number, syllabusDetails: Partial<Syllabus>): Promise<Syllabus> => {
    const response = await api.put(`/syllabi/${id}`, syllabusDetails);
    return response.data;
  },
  
  // Delete a syllabus
  delete: async (id: number): Promise<void> => {
    await api.delete(`/syllabi/${id}`);
  },
};
