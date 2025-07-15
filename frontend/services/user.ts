import api from './api';
import { User } from '@/types';

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  // Update current user profile
  updateProfile: async (userDetails: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/me`, userDetails);
    return response.data;
  },
};
