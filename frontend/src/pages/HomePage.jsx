import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "SkillWise transformed my coding journey! The AI feedback is incredibly insightful.",
      author: "Sarah Chen",
      role: "Software Engineer at Google",
      avatar: "👩‍💻"
    },
    {
      text: "The personalized learning paths helped me land my dream job in just 6 months!",
      author: "Marcus Johnson",
      role: "Full Stack Developer",
      avatar: "👨‍💼"
    },
    {
      text: "Best investment in my career. The peer review system is game-changing!",
      author: "Elena Rodriguez",
      role: "DevOps Engineer",
      avatar: "👩‍🔬"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const stats = [
    { number: "10K+", label: "Active Learners", icon: "👥" },
    { number: "50K+", label: "Challenges Solved", icon: "💻" },
    { number: "95%", label: "Success Rate", icon: "🎯" },
    { number: "24/7", label: "AI Support", icon: "🤖" }
  ];

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Learning",
      description: "Get personalized feedback and recommendations tailored to your learning style and pace.",
      highlight: "Smart & Adaptive"
    },
    {
      icon: "🎯",
      title: "Goal-Oriented Progress",
      description: "Set clear learning objectives and track your progress with detailed analytics and milestones.",
      highlight: "Results-Driven"
    },
    {
      icon: "👥",
      title: "Peer Collaboration",
      description: "Learn together with a community of motivated learners through code reviews and discussions.",
      highlight: "Community-Based"
    },
    {
      icon: "🏆",
      title: "Achievement System",
      description: "Earn badges, climb leaderboards, and celebrate your learning victories along the way.",
      highlight: "Gamified Experience"
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Detailed insights into your learning patterns, strengths, and areas for improvement.",
      highlight: "Data-Driven"
    },
    {
      icon: "⚡",
      title: "Real-Time Feedback",
      description: "Instant feedback on your code submissions with explanations and improvement suggestions.",
      highlight: "Immediate Impact"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="floating-elements">
            <span className="float-icon" style={{animationDelay: '0s'}}>💡</span>
            <span className="float-icon" style={{animationDelay: '1s'}}>🚀</span>
            <span className="float-icon" style={{animationDelay: '2s'}}>⭐</span>
            <span className="float-icon" style={{animationDelay: '0.5s'}}>🎯</span>
            <span className="float-icon" style={{animationDelay: '1.5s'}}>🔥</span>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>🎉 Trusted by 10,000+ developers worldwide</span>
          </div>
          
          <h1 className="hero-title">
            Master Your Skills with 
            <span className="gradient-text"> AI-Powered Learning</span>
            <span className="title-emoji">🎓</span>
          </h1>
          
          <p className="hero-subtitle">
            Transform your coding journey with personalized feedback, interactive challenges, 
            and a supportive community. Learn faster, code better, achieve more! 
            <span className="subtitle-emoji">✨</span>
          </p>
          
          <div className="hero-actions">
            <button className="btn-primary hero-cta" onClick={handleGetStarted}>
              <span>🚀 Start Learning Free</span>
              <small>No credit card required</small>
            </button>
            <button className="btn-secondary" onClick={handleSignIn}>
              <span>🚪 Sign In</span>
            </button>
          </div>
          
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>
              <span className="section-emoji">🌟</span>
              Why Developers Choose SkillWise
            </h2>
            <p>Everything you need to accelerate your learning journey</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-badge">{feature.highlight}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>
              <span className="section-emoji">⚡</span>
              Get Started in Minutes
            </h2>
            <p>Your learning journey is just three steps away</p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">📝</div>
              <h3>Create Your Profile</h3>
              <p>Tell us about your goals and current skill level</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">🎯</div>
              <h3>Get Your Learning Path</h3>
              <p>AI creates a personalized curriculum just for you</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">🚀</div>
              <h3>Start Learning & Growing</h3>
              <p>Code, get feedback, track progress, and level up!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>
              <span className="section-emoji">💬</span>
              What Our Learners Say
            </h2>
            <p>Real stories from real developers</p>
          </div>
          
          <div className="testimonial-carousel">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p>{testimonials[currentTestimonial].text}</p>
                <div className="testimonial-author">
                  <span className="author-avatar">{testimonials[currentTestimonial].avatar}</span>
                  <div>
                    <strong>{testimonials[currentTestimonial].author}</strong>
                    <span>{testimonials[currentTestimonial].role}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>
              Ready to Transform Your Skills?
              <span className="cta-emoji">🚀</span>
            </h2>
            <p>
              Join thousands of developers who are already learning smarter, not harder. 
              Your future self will thank you! 
            </p>
            <div className="cta-actions">
              <button className="btn-primary large" onClick={handleGetStarted}>
                <span>🎯 Start Your Journey Today</span>
                <small>Free forever plan available</small>
              </button>
            </div>
            <div className="cta-features">
              <span>✅ No credit card required</span>
              <span>✅ 30-day free trial</span>
              <span>✅ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;