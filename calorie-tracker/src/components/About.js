import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="content-wrapper">
        <div className="logo-text">
          EatSmart<span className="logo-dot">.</span>
        </div>
        
        <div className="auth-links">
          <Link to="/login" className="auth-btn login">Login</Link>
          <Link to="/signup" className="auth-btn signup">Sign Up</Link>
        </div>

        <div className="hero-content">
          <h1>Smart Nutrition Tracking</h1>
          <p>Your personal guide to healthier eating habits</p>
        </div>

        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <h3>Track Meals</h3>
            <p>Log your daily meals with detailed nutritional information</p>
          </div>

          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <h3>Monitor Progress</h3>
            <p>Visualize your nutrition journey with detailed analytics</p>
          </div>

          <div className="feature-item">
            <span className="feature-icon">💧</span>
            <h3>Water Tracking</h3>
            <p>Stay hydrated with daily water intake monitoring</p>
          </div>
        </div>
        <section className="benefits-section">
  <h2>Why Choose EatSmart?</h2>
  <div className="benefits-grid">
    <div className="benefit-item">
      <h4>Easy to Use</h4>
      <p>Intuitive interface for effortless meal tracking</p>
    </div>
    <div className="benefit-item">
      <h4>Data Insights</h4>
      <p>Detailed nutrition analytics and trends</p>
    </div>
    <div className="benefit-item">
      <h4>Personalized</h4>
      <p>Custom recommendations based on your goals</p>
    </div>
  </div>
</section>

      </div>
    </div>
  );
};

export default About;

