// import api from './api';
// import { Topic, Progress, Assignment } from '@/types';

// export const topicService = {
//   // Get all topics for a syllabus
//   getAllBySyllabus: async (syllabusId: number): Promise<Topic[]> => {
//     const response = await api.get(`/topics/syllabus/${syllabusId}`);
//     return response.data;
//   },
  
//   // Get a single topic by ID
//   getById: async (id: number): Promise<Topic> => {
//     const response = await api.get(`/topics/${id}`);
//     return response.data;
//   },
  
//   // Create a new topic
//   create: async (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>, syllabusId: number): Promise<Topic> => {
//     const response = await api.post(`/topics?syllabusId=${syllabusId}`, topic);
//     return response.data;
//   },
  
//   // Update a topic
//   update: async (id: number, topicDetails: Partial<Topic>): Promise<Topic> => {
//     const response = await api.put(`/topics/${id}`, topicDetails);
//     return response.data;
//   },
  
//   // Delete a topic
//   delete: async (id: number): Promise<void> => {
//     await api.delete(`/topics/${id}`);
//   },
  
//   // Track progress on a topic
//   trackProgress: async (topicId: number, completionPercentage: number): Promise<Progress> => {
//     const response = await api.post(`/topics/${topicId}/progress`, { completionPercentage });
//     return response.data;
//   },
  
//   // Generate assignments for a topic
//   generateAssignments: async (topicId: number): Promise<Assignment[]> => {
//     const response = await api.post(`/topics/${topicId}/generate-assignments`);
//     return response.data;
//   },
// };
