import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/challenges/ChallengeCard';
import challengeService from '../services/challenges';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  // Load challenges and categories on mount
  useEffect(() => {
    loadChallenges();
    loadCategories();
  }, []);

  // Load challenges from API
  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengeService.getChallenges(filters);
      setChallenges(response.data || []);
      setFilteredChallenges(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading challenges:', err);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const response = await challengeService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Fallback categories
      setCategories([
        'Programming',
        'Web Development', 
        'Mobile Development',
        'Data Science',
        'DevOps',
        'Design',
        'Database'
      ]);
    }
  };

  // Fallback mock data
  const loadMockData = () => {
    const mockChallenges = [
      {
        id: 1,
        title: 'Build a React Component',
        description: 'Create a reusable React component with props and state management.',
        category: 'Programming',
        difficulty: 'medium',
        points: 50,
        estimated_time: 45,
        tags: ['React', 'JavaScript', 'Frontend'],
        status: 'active'
      },
      {
        id: 2,
        title: 'API Integration Challenge',
        description: 'Build a REST API client that handles authentication and error cases.',
        category: 'Web Development',
        difficulty: 'hard',
        points: 75,
        estimated_time: 90,
        tags: ['API', 'HTTP', 'Authentication'],
        status: 'active'
      },
      {
        id: 3,
        title: 'Database Query Optimization',
        description: 'Optimize a slow database query and improve performance metrics.',
        category: 'Database',
        difficulty: 'hard',
        points: 100,
        estimated_time: 120,
        tags: ['SQL', 'Database', 'Performance'],
        status: 'active'
      },
      {
        id: 4,
        title: 'CSS Flexbox Layout',
        description: 'Create a responsive layout using CSS Flexbox properties.',
        category: 'Web Development',
        difficulty: 'easy',
        points: 25,
        estimated_time: 30,
        tags: ['CSS', 'Layout', 'Responsive'],
        status: 'active'
      }
    ];
    
    setChallenges(mockChallenges);
    setFilteredChallenges(mockChallenges);
  };

  // Filter challenges based on current filters
  useEffect(() => {
    let filtered = challenges;

    if (filters.category) {
      filtered = filtered.filter(challenge => 
        challenge.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(challenge => 
        challenge.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchLower) ||
        challenge.description.toLowerCase().includes(searchLower) ||
        (challenge.tags && challenge.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      );
    }

    setFilteredChallenges(filtered);
  }, [challenges, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      search: ''
    });
  };

  const handleStartChallenge = async (challengeId) => {
    try {
      await challengeService.startChallenge(challengeId);
      // Could redirect to challenge detail page or show success message
      alert('Challenge started! Good luck!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>Coding Challenges</h1>
        <p>Test your skills and earn points with our curated challenges</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn-link">Dismiss</button>
        </div>
      )}

      <div className="challenges-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search challenges..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="filter-select"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button onClick={clearFilters} className="btn-secondary">
          Clear Filters
        </button>
      </div>

      <div className="challenges-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading challenges...</p>
          </div>
        ) : filteredChallenges.length > 0 ? (
          <>
            <div className="challenges-stats">
              <p>Showing {filteredChallenges.length} of {challenges.length} challenges</p>
            </div>
            <div className="challenges-grid">
              {filteredChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  onStart={handleStartChallenge}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No challenges found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;