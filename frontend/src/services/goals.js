import api from './api';

const goalService = {
  // Get all goals for the current user
  getGoals: async () => {
    try {
      const response = await api.get('/goals');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch goals');
    }
  },

  // Get a specific goal by ID
  getGoalById: async (id) => {
    try {
      const response = await api.get(`/goals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch goal');
    }
  },

  // Create a new goal
  createGoal: async (goalData) => {
    try {
      const response = await api.post('/goals', goalData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create goal');
    }
  },

  // Update an existing goal
  updateGoal: async (id, goalData) => {
    try {
      const response = await api.put(`/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update goal');
    }
  },

  // Delete a goal
  deleteGoal: async (id) => {
    try {
      const response = await api.delete(`/goals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete goal');
    }
  },

  // Update goal progress
  updateProgress: async (id, progress) => {
    try {
      const response = await api.put(`/goals/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update progress');
    }
  },

  // Get goal progress details
  getProgress: async (id) => {
    try {
      const response = await api.get(`/goals/${id}/progress`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
};

export default goalService;