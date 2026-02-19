import React from 'react';
import '../styles/components.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          <h1>TTI Funding</h1>
          <p className="tti-full-name">Technology Transfer & Innovation</p>
        </div>
        <p className="tagline">Application Management System</p>
      </div>
    </header>
  );
};

export default Header;
