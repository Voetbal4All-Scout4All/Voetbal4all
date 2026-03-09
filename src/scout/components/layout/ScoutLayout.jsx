import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../assets/css/scout-tokens.css';

const ScoutLayout = () => {
  return (
    <div className="s4a-root" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--s4a-sidebar-width)' }}>
        <Topbar />
        <main
          style={{
            marginTop: 'var(--s4a-navbar-height)',
            padding: 'var(--s4a-space-6)',
            minHeight: 'calc(100vh - var(--s4a-navbar-height))',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ScoutLayout;
