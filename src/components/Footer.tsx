import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-section">
        <h2>StealthText</h2>
        <ul>
          <li><Link to= "/">Home</Link></li>
          <li><Link to= "/pricing">Pricing</Link></li>
          <li><Link to= "/login">Sign in</Link></li>
          <li><Link to= "/signup">Register</Link></li>
          <li><Link to= "/contact">Contact</Link></li>
        </ul>
      </div>
      <div className="footer-section">
        <h2>Company</h2>
        <ul>
          <li><Link to= "/terms">Terms & Conditions</Link></li>
          <li><Link to= "/privacy">Privacy Policy</Link></li>
        </ul>
      </div>
      <div className="footer-section">
        <h2>Solutions</h2>
        <ul>
          <li><Link to= "/humanizer">Humanizer</Link></li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer; 