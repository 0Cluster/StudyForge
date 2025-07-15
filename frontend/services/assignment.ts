import api from './api';
import { Assignment, SubmissionResponse, CreateAssignmentRequest } from '@/types';

export const assignmentService = {
  // Get all assignments for a user
  getAllForUser: async (): Promise<Assignment[]> => {
    const response = await api.get('/assignments');
    return response.data;
  },
  
  // Get all assignments for a topic
  getAllByTopic: async (topicId: number): Promise<Assignment[]> => {
    const response = await api.get(`/assignments/topic/${topicId}`);
    return response.data;
  },
  
  // Get assignments by difficulty level for a topic
  getByDifficultyLevel: async (topicId: number, difficultyLevel: string): Promise<Assignment[]> => {
    const response = await api.get(`/assignments/topic/${topicId}/difficulty/${difficultyLevel}`);
    return response.data;
  },
  
  // Get a single assignment by ID
  getById: async (id: number): Promise<Assignment> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  
  // Create a new assignment
  create: async (assignmentRequest: CreateAssignmentRequest): Promise<Assignment> => {
    const response = await api.post(`/assignments`, assignmentRequest);
    return response.data;
  },
  
  // Generate assignments for a topic
  generateForTopic: async (topicId: number, count: number): Promise<Assignment[]> => {
    const response = await api.post(`/assignments/generate?topicId=${topicId}&count=${count}`);
    return response.data;
  },
  
  // Update an assignment
  update: async (id: number, assignmentDetails: Partial<Assignment>): Promise<Assignment> => {
    const response = await api.put(`/assignments/${id}`, assignmentDetails);
    return response.data;
  },
  
  // Delete an assignment
  delete: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
  
  // Submit answers for an assignment
  submitAnswers: async (assignmentId: number, questionIds: number[], userAnswers: string[]): Promise<SubmissionResponse> => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, { questionIds, userAnswers });
    return response.data;
  },
  
  // Get all submissions for an assignment
  getSubmissions: async (assignmentId: number): Promise<SubmissionResponse[]> => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },
  
  // Get a specific submission
  getSubmission: async (submissionId: number): Promise<SubmissionResponse> => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  },
};
