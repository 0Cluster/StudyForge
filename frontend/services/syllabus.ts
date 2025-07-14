// import api from './api';
// import { Syllabus, Topic } from '@/types';

// export const syllabusService = {
//   // Get all syllabi for a user
//   getAllByUser: async (userId: number): Promise<Syllabus[]> => {
//     const response = await api.get(`/syllabi/user/${userId}`);
//     return response.data;
//   },
  
//   // Get a single syllabus by ID
//   getById: async (id: number): Promise<Syllabus> => {
//     const response = await api.get(`/syllabi/${id}`);
//     return response.data;
//   },
  
//   // Create a new syllabus
//   create: async (syllabus: Omit<Syllabus, 'id' | 'createdAt' | 'updatedAt'>, userId: number): Promise<Syllabus> => {
//     const response = await api.post(`/syllabi?userId=${userId}`, syllabus);
//     return response.data;
//   },
  
//   // Upload a syllabus document
//   upload: async (file: File, title: string, description: string, userId: number): Promise<Syllabus> => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('title', title);
//     formData.append('description', description);
//     formData.append('userId', userId.toString());
    
//     const response = await api.post('/syllabi/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },
  
//   // Generate topics from syllabus
//   generateTopics: async (syllabusId: number): Promise<Topic[]> => {
//     const response = await api.post(`/syllabi/${syllabusId}/generate-topics`);
//     return response.data;
//   },
  
//   // Update a syllabus
//   update: async (id: number, syllabusDetails: Partial<Syllabus>): Promise<Syllabus> => {
//     const response = await api.put(`/syllabi/${id}`, syllabusDetails);
//     return response.data;
//   },
  
//   // Delete a syllabus
//   delete: async (id: number): Promise<void> => {
//     await api.delete(`/syllabi/${id}`);
//   },
// };
