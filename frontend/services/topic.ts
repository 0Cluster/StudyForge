import api from './api';
import { Topic, Progress, Assignment, CreateTopicRequest } from '@/types';

export const topicService = {
  // Get all topics for a syllabus
  getAllBySyllabus: async (syllabusId: number): Promise<Topic[]> => {
    const response = await api.get(`/topics/syllabus/${syllabusId}`);
    return response.data;
  },
  
  // Get a single topic by ID
  getById: async (id: number): Promise<Topic> => {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },
  
  // Create a new topic
  create: async (topicRequest: CreateTopicRequest): Promise<Topic> => {
    const response = await api.post(`/topics`, topicRequest);
    return response.data;
  },
  
  // Update a topic
  update: async (id: number, topicDetails: Partial<Topic>): Promise<Topic> => {
    const response = await api.put(`/topics/${id}`, topicDetails);
    return response.data;
  },
  
  // Delete a topic
  delete: async (id: number): Promise<void> => {
    await api.delete(`/topics/${id}`);
  },
  
  // Track progress on a topic
  trackProgress: async (topicId: number, completionPercentage: number): Promise<Progress> => {
    const response = await api.post(`/topics/${topicId}/progress?completionPercentage=${completionPercentage}`);
    return response.data;
  },
  
  // Get progress for a topic
  getProgress: async (topicId: number): Promise<Progress> => {
    const response = await api.get(`/progress/topic/${topicId}`);
    return response.data;
  },
  
  // Get all progress for a syllabus
  getSyllabusProgress: async (syllabusId: number): Promise<Progress[]> => {
    const response = await api.get(`/progress/syllabus/${syllabusId}`);
    return response.data;
  },
  
  // Update progress on a topic
  updateProgress: async (topicId: number, completionPercentage: number, completed: boolean): Promise<Progress> => {
    const response = await api.put(`/progress/topic/${topicId}`, {
      completionPercentage,
      completed
    });
    return response.data;
  },
};
