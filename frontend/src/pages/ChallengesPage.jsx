import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import ChallengeCard from '../components/challenges/ChallengeCard';
import './ChallengesPage.css';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    is_active: 'true',
    goal_id: '',
    search: ''
  });

  // Fetch challenges on component mount and when filters change
  useEffect(() => {
    fetchChallenges();
  }, [filters]);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.is_active) params.is_active = filters.is_active;
      if (filters.goal_id) params.goal_id = filters.goal_id;
      if (filters.search) params.search = filters.search;

      const response = await apiService.challenges.getAll(params);
      setChallenges(response.data.challenges || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setFilters({
        ...filters,
        search: value
      });
    }, 500);
  };

  const handleViewChallenge = (challenge) => {
    // TODO: Implement view challenge modal or navigate to detail page
    console.log('View challenge:', challenge);
    alert(`View challenge: ${challenge.title}\n\nInstructions: ${challenge.instructions}`);
  };

  const handleEditChallenge = (challenge) => {
    // TODO: Implement edit challenge modal
    console.log('Edit challenge:', challenge);
    alert('Edit functionality coming soon!');
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      await apiService.challenges.delete(challengeId);
      setChallenges(challenges.filter(challenge => challenge.id !== challengeId));
      setSuccessMessage('Challenge deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting challenge:', err);
      setError('Failed to delete challenge. Please try again.');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      is_active: 'true',
      goal_id: '',
      search: ''
    });
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.search || filters.goal_id || filters.is_active !== 'true';

  return (
    <div className="challenges-page">
      <div className="page-header">
        <div>
          <h1>Learning Challenges</h1>
          <p className="page-subtitle">Browse and complete challenges to improve your skills</p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="challenges-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search challenges..."
            onChange={handleSearchChange}
            defaultValue={filters.search}
          />
        </div>

        <select 
          value={filters.category} 
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="programming">Programming</option>
          <option value="web-development">Web Development</option>
          <option value="mobile-development">Mobile Development</option>
          <option value="data-science">Data Science</option>
          <option value="machine-learning">Machine Learning</option>
          <option value="devops">DevOps</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="other">Other</option>
        </select>

        <select 
          value={filters.difficulty} 
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>

        <select 
          value={filters.is_active} 
          onChange={(e) => handleFilterChange('is_active', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {hasActiveFilters && (
          <button 
            className="btn-clear-filters" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="challenges-stats">
        <div className="stat-item">
          <span className="stat-number">{challenges.length}</span>
          <span className="stat-label">Challenges</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {challenges.filter(c => c.difficulty_level === 'easy').length}
          </span>
          <span className="stat-label">Easy</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {challenges.filter(c => c.difficulty_level === 'medium').length}
          </span>
          <span className="stat-label">Medium</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {challenges.filter(c => c.difficulty_level === 'hard').length}
          </span>
          <span className="stat-label">Hard</span>
        </div>
      </div>

      <div className="challenges-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading challenges...</p>
          </div>
        ) : challenges.length > 0 ? (
          <div className="challenges-grid">
            {challenges.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                onView={handleViewChallenge}
                onEdit={handleEditChallenge}
                onDelete={handleDeleteChallenge}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No challenges found</h3>
            <p>
              {hasActiveFilters
                ? 'No challenges match your filters. Try adjusting your search.'
                : 'There are no challenges available yet.'}
            </p>
            {hasActiveFilters && (
              <button 
                className="btn-primary" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;