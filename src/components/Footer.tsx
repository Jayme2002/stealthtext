import React from 'react';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-section">
        <h2>StealthText</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/signin">Sign in</a></li>
          <li><a href="/register">Register</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h2>Company</h2>
        <ul>
          <li><a href="/terms">Terms & Conditions</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h2>Solutions</h2>
        <ul>
          <li><a href="/humanizer">Humanizer</a></li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer; 