import api from './api';

const challengeService = {
  // Get all challenges with optional filtering
  getChallenges: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags.join(','));
      
      const response = await api.get(`/challenges?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenges');
    }
  },

  // Get a specific challenge by ID
  getChallengeById: async (id) => {
    try {
      const response = await api.get(`/challenges/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge');
    }
  },

  // Start a challenge (create a submission)
  startChallenge: async (challengeId) => {
    try {
      const response = await api.post(`/challenges/${challengeId}/start`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start challenge');
    }
  },

  // Submit a challenge solution
  submitChallenge: async (challengeId, submissionData) => {
    try {
      const response = await api.post(`/challenges/${challengeId}/submit`, submissionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit challenge');
    }
  },

  // Get user's submissions for a challenge
  getChallengeSubmissions: async (challengeId) => {
    try {
      const response = await api.get(`/challenges/${challengeId}/submissions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
    }
  },

  // Get challenge categories
  getCategories: async () => {
    try {
      const response = await api.get('/challenges/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
};

export default challengeService;