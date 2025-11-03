import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link 
      to={to} 
      className={`nav-link ${isActivePage(to) ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );

  if (!isAuthenticated) {
    return (
      <header className="header header-guest">
        <div className="container">
          <Link to="/" className="nav-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">SkillWise</span>
          </Link>
          
          <nav className="nav-menu">
            <NavLink to="/login">Sign In</NavLink>
            <NavLink to="/signup">
              <span className="signup-btn">Get Started 🚀</span>
            </NavLink>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="header header-authenticated">
      <div className="container">
        <Link to="/dashboard" className="nav-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">SkillWise</span>
        </Link>
        
        <nav className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/goals" onClick={() => setIsMenuOpen(false)}>
            🎯 Goals
          </NavLink>
          <NavLink to="/challenges" onClick={() => setIsMenuOpen(false)}>
            💻 Challenges
          </NavLink>
          <NavLink to="/progress" onClick={() => setIsMenuOpen(false)}>
            📊 Progress
          </NavLink>
          <NavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)}>
            🏆 Leaderboard
          </NavLink>
        </nav>

        <div className="nav-actions">
          {/* Notifications */}
          <button className="nav-notification">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="nav-profile">
            <button 
              className="profile-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span className="profile-avatar">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '👤'}
              </span>
              <span className="profile-name">
                {user?.firstName ? `Hi, ${user.firstName}!` : 'Profile'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <span className="profile-greeting">
                    👋 Hey {user?.firstName || 'there'}!
                  </span>
                  <span className="profile-email">{user?.email}</span>
                </div>
                
                <div className="profile-links">
                  <Link 
                    to="/profile" 
                    className="profile-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    ⚙️ Profile Settings
                  </Link>
                  <Link 
                    to="/achievements" 
                    className="profile-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    🏅 Achievements
                  </Link>
                  <Link 
                    to="/help" 
                    className="profile-link"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    ❓ Help & Support
                  </Link>
                </div>
                
                <div className="profile-actions">
                  <button 
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="hamburger"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;