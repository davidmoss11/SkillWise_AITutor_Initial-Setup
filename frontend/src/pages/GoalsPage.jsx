import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import CreateGoalForm from '../components/goals/CreateGoalForm';
import GoalCard from '../components/goals/GoalCard';
import EditGoalModal from '../components/goals/EditGoalModal';
import './GoalsPage.css';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    is_completed: ''
  });

  // Fetch goals on component mount and when filters change
  useEffect(() => {
    fetchGoals();
  }, [filters]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.is_completed) params.is_completed = filters.is_completed;

      const response = await apiService.goals.getAll(params);
      setGoals(response.data.goals || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      setIsCreating(true);
      setError('');
      
      const response = await apiService.goals.create(goalData);
      
      // Add the new goal to the list
      setGoals([response.data.goal, ...goals]);
      
      // Show success message
      setSuccessMessage('Goal created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close the form
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err.response?.data?.error || 'Failed to create goal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await apiService.goals.delete(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
      setSuccessMessage('Goal deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal. Please try again.');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  const handleUpdateGoal = async (updatedData) => {
    try {
      setIsUpdating(true);
      setError('');
      
      const response = await apiService.goals.update(editingGoal.id, updatedData);
      
      // Update the goal in the list
      setGoals(goals.map(goal => 
        goal.id === editingGoal.id ? response.data.goal : goal
      ));
      
      // Show success message
      setSuccessMessage('Goal updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close the modal
      setEditingGoal(null);
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err.response?.data?.error || 'Failed to update goal. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <div>
          <h1>My Learning Goals</h1>
          <p className="page-subtitle">Track your progress and achieve your learning objectives</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Goal'}
        </button>
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

      {showCreateForm && (
        <div className="create-goal-section">
          <CreateGoalForm
            onSubmit={handleCreateGoal}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isCreating}
          />
        </div>
      )}

      <div className="goals-filters">
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
          value={filters.is_completed} 
          onChange={(e) => handleFilterChange('is_completed', e.target.value)}
        >
          <option value="">All Goals</option>
          <option value="false">Active</option>
          <option value="true">Completed</option>
        </select>
      </div>

      <div className="goals-content">
        {isLoading ? (
          <div className="loading-state">
            <p>Loading goals...</p>
          </div>
        ) : goals.length > 0 ? (
          <div className="goals-grid">
            {goals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onDelete={handleDeleteGoal}
                onEdit={handleEditGoal}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No goals yet</h3>
            <p>
              {filters.category || filters.difficulty || filters.is_completed
                ? 'No goals match your filters. Try adjusting your search.'
                : 'Start your learning journey by creating your first goal!'}
            </p>
            {!showCreateForm && !filters.category && !filters.difficulty && !filters.is_completed && (
              <button 
                className="btn-primary" 
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Goal
              </button>
            )}
          </div>
        )}
      </div>

      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          onSave={handleUpdateGoal}
          onClose={() => setEditingGoal(null)}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default GoalsPage;