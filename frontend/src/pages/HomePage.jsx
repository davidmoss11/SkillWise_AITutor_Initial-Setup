import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🎯',
      title: 'Smart Goal Tracking',
      description: 'Set personalized learning goals and track your progress with intelligent milestones and real-time updates.'
    },
    {
      icon: '🚀',
      title: 'Interactive Challenges',
      description: 'Engage with curated coding challenges designed to match your skill level and learning objectives.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Feedback',
      description: 'Receive instant, personalized feedback on your submissions powered by advanced AI technology.'
    },
    {
      icon: '👥',
      title: 'Peer Collaboration',
      description: 'Learn from your peers through collaborative reviews and constructive feedback exchanges.'
    },
    {
      icon: '📈',
      title: 'Progress Analytics',
      description: 'Visualize your learning journey with comprehensive analytics and detailed progress reports.'
    },
    {
      icon: '🏆',
      title: 'Gamified Learning',
      description: 'Stay motivated with achievements, leaderboards, and rewards as you complete challenges.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Learners' },
    { value: '500+', label: 'Coding Challenges' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'AI Support' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>AI-Powered Learning Platform</span>
            </div>
            <h1 className="hero-title">
              Master New Skills with <span className="highlight">SkillWise</span>
            </h1>
            <p className="hero-description">
              Your personalized learning companion that combines AI-powered feedback, 
              interactive challenges, and peer collaboration to accelerate your skill development journey.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                <span>Get Started Free</span>
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                <span>Sign In</span>
              </button>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-title">Track Progress</div>
                <div className="progress-bar-demo">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-title">Complete Challenges</div>
                <div className="card-text">5 challenges completed today!</div>
              </div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">🎓</div>
              <div className="card-content">
                <div className="card-title">Learn & Grow</div>
                <div className="card-text">Level 12 - Expert</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-description">
              Comprehensive tools and features designed to make learning effective, engaging, and enjoyable
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">Get started in three simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Create Your Account</h3>
                <p className="step-description">
                  Sign up for free and set up your personalized learning profile in minutes
                </p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Set Learning Goals</h3>
                <p className="step-description">
                  Define your objectives and let our AI recommend the perfect learning path
                </p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Start Learning</h3>
                <p className="step-description">
                  Complete challenges, get feedback, and track your progress in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Learning Journey?</h2>
            <p className="cta-description">
              Join thousands of learners who are already mastering new skills with SkillWise
            </p>
            <div className="cta-actions">
              <button className="btn-primary btn-large" onClick={() => navigate('/signup')}>
                <span>Create Free Account</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
            <p className="cta-note">No credit card required • Start learning immediately</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
