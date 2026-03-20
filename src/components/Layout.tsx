import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="page-content glass-panel" style={{ margin: '1.5rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
          <div className="animate-enter" style={{ height: '100%' }}>
            <Outlet />
          </div>
        </div>
        {/* Overlay for mobile drawer */}
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      </main>
    </div>
  );
}
