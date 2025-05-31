import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div style={{
      width: '200px',
      background: '#f0f0f0',
      padding: '20px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <h3>Navigation</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '10px' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'blue' }}>Dashboard</Link>
        </li>
        <li>
          <Link to="/settings" style={{ textDecoration: 'none', color: 'blue' }}>Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;