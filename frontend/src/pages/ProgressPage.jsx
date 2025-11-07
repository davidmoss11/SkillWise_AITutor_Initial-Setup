import React from 'react';
import ProgressOverview from '../components/progress/ProgressOverview';
import './ProgressPage.css';

const ProgressPage = () => {
  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>Progress Tracking</h1>
        <p className="page-subtitle">Monitor your learning journey and achievements</p>
      </div>

      <ProgressOverview />
    </div>
  );
};

export default ProgressPage;
