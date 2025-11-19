import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/challenges/ChallengeCard';
import GenerateChallengeModal from '../components/challenges/GenerateChallengeModal';
import SubmissionForm from '../components/challenges/SubmissionForm';
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
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Load challenges and categories on mount
  useEffect(() => {
    console.log('🚀 ChallengesPage mounted - Sprint 3 features enabled!');
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
      const challenge = challenges.find(c => c.id === challengeId);
      setSelectedChallenge(challenge);
      setShowSubmissionForm(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChallengeGenerated = (generatedChallenge) => {
    // Add the AI-generated challenge to the list
    const newChallenge = {
      id: Date.now(), // Temporary ID
      title: generatedChallenge.title,
      description: generatedChallenge.description,
      difficulty: generatedChallenge.difficulty,
      points: generatedChallenge.difficulty === 'beginner' ? 25 : 
              generatedChallenge.difficulty === 'intermediate' ? 50 : 75,
      estimated_time: generatedChallenge.estimatedTime || 60,
      tags: ['AI Generated'],
      status: 'active',
      aiGenerated: true,
      requirements: generatedChallenge.requirements,
      testCases: generatedChallenge.testCases,
      starterCode: generatedChallenge.starterCode
    };
    setChallenges([newChallenge, ...challenges]);
    setFilteredChallenges([newChallenge, ...filteredChallenges]);
    setShowGenerateModal(false);
  };

  return (
    <div className="challenges-page">
      <div className="page-header">
        <h1>Coding Challenges</h1>
        <p>Test your skills and earn points with our curated challenges</p>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setShowGenerateModal(true)} 
            className="btn-primary"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🤖 Generate AI Challenge
          </button>
        </div>
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

      {/* Sprint 3: AI Challenge Generation Modal */}
      <GenerateChallengeModal 
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onChallengeGenerated={handleChallengeGenerated}
      />

      {/* Sprint 3: Code Submission Form */}
      {showSubmissionForm && selectedChallenge && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowSubmissionForm(false);
                setSelectedChallenge(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              ✕
            </button>
            <div style={{ padding: '30px' }}>
              <h2 style={{ marginBottom: '10px' }}>{selectedChallenge.title}</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>{selectedChallenge.description}</p>
              {selectedChallenge.requirements && (
                <div style={{ marginBottom: '20px' }}>
                  <h3>Requirements:</h3>
                  <ul>
                    {selectedChallenge.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedChallenge.starterCode && (
                <div style={{ marginBottom: '20px' }}>
                  <h3>Starter Code:</h3>
                  <pre style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    overflow: 'auto'
                  }}>
                    {selectedChallenge.starterCode}
                  </pre>
                </div>
              )}
              <SubmissionForm challengeId={selectedChallenge.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesPage;