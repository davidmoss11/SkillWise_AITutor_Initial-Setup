// TODO: Implement user profile management and settings
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const { user, updateProfile } = useAuth();

  // Mock data - TODO: Replace with API call
  useEffect(() => {
    const mockProfileData = {
      id: user?.id || 1,
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'john.doe@example.com',
      avatar: '👤',
      bio: 'Passionate full-stack developer with a love for learning new technologies.',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
      joinedDate: '2024-01-01T00:00:00Z',
      level: 6,
      totalPoints: 1850,
      completedChallenges: 28,
      goalsAchieved: 5,
      currentStreak: 12,
      longestStreak: 25,
      badges: [
        {
          id: 1,
          name: 'First Steps',
          icon: '🚀',
          description: 'Completed first challenge',
          earned: true,
        },
        {
          id: 2,
          name: 'Streak Master',
          icon: '🔥',
          description: '7-day learning streak',
          earned: true,
        },
        {
          id: 3,
          name: 'Goal Crusher',
          icon: '🎯',
          description: 'Completed 5 learning goals',
          earned: true,
        },
        {
          id: 4,
          name: 'Code Reviewer',
          icon: '👥',
          description: 'Provided 10 peer reviews',
          earned: false,
        },
        {
          id: 5,
          name: 'Challenge Master',
          icon: '💪',
          description: 'Completed 50 challenges',
          earned: false,
        },
      ],
      skills: [
        { name: 'JavaScript', level: 85, category: 'Programming' },
        { name: 'React', level: 78, category: 'Frontend' },
        { name: 'Node.js', level: 72, category: 'Backend' },
        { name: 'CSS', level: 88, category: 'Frontend' },
        { name: 'Python', level: 65, category: 'Programming' },
        { name: 'SQL', level: 70, category: 'Database' },
      ],
      recentActivity: [
        {
          id: 1,
          type: 'challenge',
          title: 'Completed React Hooks Challenge',
          date: '2024-01-15T14:30:00Z',
          points: 50,
        },
        {
          id: 2,
          type: 'goal',
          title: 'Achieved Frontend Fundamentals Goal',
          date: '2024-01-14T10:15:00Z',
          points: 100,
        },
        {
          id: 3,
          type: 'review',
          title: 'Reviewed peer submission',
          date: '2024-01-13T16:45:00Z',
          points: 25,
        },
      ],
      preferences: {
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        publicProfile: true,
        showProgress: true,
      },
    };

    setTimeout(() => {
      setProfileData(mockProfileData);
      setFormData(mockProfileData);
      setLoading(false);
    }, 1000);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Check if this is a preference setting
    if (
      [
        'emailNotifications',
        'pushNotifications',
        'weeklyDigest',
        'publicProfile',
        'showProgress',
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with actual API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfileData(formData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Call auth context update if needed
      // await updateProfile(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);

    // TODO: Replace with actual API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfileData(formData);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Call auth context update if needed
      // await updateProfile({ preferences: formData.preferences });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSuccessMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      challenge: '🏆',
      goal: '🎯',
      review: '👥',
      streak: '🔥',
    };
    return icons[type] || '📝';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading && !profileData) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      {successMessage && (
        <div className="success-notification">
          <span>✓</span> {successMessage}
        </div>
      )}

      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-info">
            <div className="profile-avatar">
              <span className="avatar-icon">{profileData?.avatar}</span>
              <div className="level-badge">Level {profileData?.level}</div>
            </div>

            <div className="profile-details">
              <h1>
                {profileData?.firstName} {profileData?.lastName}
              </h1>
              <p className="profile-bio">{profileData?.bio}</p>
              <div className="profile-meta">
                <span>📍 {profileData?.location}</span>
                <span>📅 Joined {formatDate(profileData?.joinedDate)}</span>
                {profileData?.website && (
                  <span>
                    🌐{' '}
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profileData.website}
                    </a>
                  </span>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <strong>{profileData?.totalPoints.toLocaleString()}</strong>
                <span>Total Points</span>
              </div>
              <div className="stat-item">
                <strong>{profileData?.completedChallenges}</strong>
                <span>Challenges</span>
              </div>
              <div className="stat-item">
                <strong>{profileData?.currentStreak}</strong>
                <span>Day Streak</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        <button
          className={`tab-button ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="profile-content">
        {isEditing && (
          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {activeTab === 'overview' && !isEditing && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {profileData?.recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="activity-info">
                        <h4>{activity.title}</h4>
                        <div className="activity-meta">
                          <span>{formatTimeAgo(activity.date)}</span>
                          <span className="points">
                            +{activity.points} points
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="achievements-summary">
                <h3>Achievements</h3>
                <div className="achievements-stats">
                  <div className="achievement-stat">
                    <strong>{profileData?.goalsAchieved}</strong>
                    <span>Goals Achieved</span>
                  </div>
                  <div className="achievement-stat">
                    <strong>{profileData?.longestStreak}</strong>
                    <span>Longest Streak</span>
                  </div>
                  <div className="achievement-stat">
                    <strong>
                      {profileData?.badges.filter((b) => b.earned).length}
                    </strong>
                    <span>Badges Earned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && !isEditing && (
          <div className="skills-tab">
            <h3>Skill Progress</h3>
            <div className="skills-grid">
              {profileData?.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-header">
                    <h4>{skill.name}</h4>
                    <span className="skill-category">{skill.category}</span>
                  </div>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    <span className="skill-level">{skill.level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && !isEditing && (
          <div className="badges-tab">
            <h3>Badge Collection</h3>
            <div className="badges-grid">
              {profileData?.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                  {badge.earned ? (
                    <span className="badge-status earned">Earned ✓</span>
                  ) : (
                    <span className="badge-status locked">Locked 🔒</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && !isEditing && (
          <div className="settings-tab">
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <p className="section-description">
                Manage how you receive updates and notifications
              </p>
              <div className="settings-group">
                <label className="setting-item">
                  <div className="setting-info">
                    <span className="setting-title">Email notifications</span>
                    <span className="setting-description">
                      Receive updates about your progress via email
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={
                        formData.preferences?.emailNotifications || false
                      }
                      onChange={handleInputChange}
                      id="emailNotifications"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-info">
                    <span className="setting-title">Push notifications</span>
                    <span className="setting-description">
                      Get real-time notifications in your browser
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={formData.preferences?.pushNotifications || false}
                      onChange={handleInputChange}
                      id="pushNotifications"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-info">
                    <span className="setting-title">
                      Weekly progress digest
                    </span>
                    <span className="setting-description">
                      Weekly summary of your achievements and activity
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="weeklyDigest"
                      checked={formData.preferences?.weeklyDigest || false}
                      onChange={handleInputChange}
                      id="weeklyDigest"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Privacy Settings</h3>
              <p className="section-description">
                Control your profile visibility and data sharing
              </p>
              <div className="settings-group">
                <label className="setting-item">
                  <div className="setting-info">
                    <span className="setting-title">Public profile</span>
                    <span className="setting-description">
                      Allow others to view your profile and achievements
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="publicProfile"
                      checked={formData.preferences?.publicProfile || false}
                      onChange={handleInputChange}
                      id="publicProfile"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-info">
                    <span className="setting-title">
                      Show progress on leaderboard
                    </span>
                    <span className="setting-description">
                      Display your rank and progress publicly
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="showProgress"
                      checked={formData.preferences?.showProgress || false}
                      onChange={handleInputChange}
                      id="showProgress"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button
                className="btn-primary"
                onClick={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
