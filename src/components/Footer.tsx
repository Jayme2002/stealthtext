import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { MessageSquare, Book, Shield, Sparkles, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-section">
        <div className="footer-logo">
          <img 
            src="icons/noun-ninja.svg"
            className="w-6 h-6"
            alt="StealthText Logo"
          />
          <span>StealthText</span>
        </div>
        <p className="footer-description">
          Transform AI-generated content into natural, human-like text that bypasses AI detection.
        </p>
      </div>
      
      <div className="footer-section">
        <h2>Product</h2>
        <ul>
          <li>
            <Link to="/humanizer">
              <Sparkles className="w-4 h-4" />
              Humanizer
            </Link>
          </li>
          <li>
            <Link to="/pricing">
              <Shield className="w-4 h-4" />
              Pricing
            </Link>
          </li>
          <li>
            <Link to="/faq">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </Link>
          </li>
          <li>
            <Link to="/login">
              Sign in
            </Link>
          </li>
          <li>
            <Link to="/signup">
              Register
            </Link>
          </li>
        </ul>
      </div>

      <div className="footer-section">
        <h2>Resources</h2>
        <ul>
          <li>
            <Link to="/blog">
              <Book className="w-4 h-4" />
              Blog
            </Link>
          </li>
          <li>
            <Link to="/docs">
              Documentation
            </Link>
          </li>
          <li>
            <Link to="/terms">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link to="/privacy">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </div>

      <div className="footer-section">
        <h2>Contact</h2>
        <ul>
          <li>
            <Link to="/contact">
              <MessageSquare className="w-4 h-4" />
              Get in touch
            </Link>
          </li>
          <li>
            <a href="mailto:support@stealthtext.ai">
              support@stealthtext.ai
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;