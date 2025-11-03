import React, { useState, useEffect } from 'react';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import goalService from '../services/goals';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  // Load goals on component mount
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await goalService.getGoals();
      setGoals(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      const response = await goalService.createGoal(goalData);
      setGoals(prev => [response.data, ...prev]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw so form can handle it
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalService.deleteGoal(goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (!filter) return true;
    return goal.type === filter;
  });

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>My Learning Goals</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create New Goal
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn-link">Dismiss</button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Goal</h2>
              <button 
                className="btn-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <GoalForm 
              onSubmit={handleCreateGoal}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="goals-filters">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="form-select"
        >
          <option value="">All Types</option>
          <option value="skill">Skill Development</option>
          <option value="project">Project Completion</option>
          <option value="time">Time-based Learning</option>
          <option value="habit">Learning Habit</option>
        </select>
      </div>

      <div className="goals-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading goals...</p>
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="goals-grid">
            {filteredGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No goals yet</h3>
            <p>Create your first learning goal to start tracking your progress!</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;