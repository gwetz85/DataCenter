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
        <div className="page-content-wrapper">
          <div className="page-content animate-enter">
            <Outlet />
          </div>
        </div>
        {/* Overlay for mobile drawer */}
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      </main>
    </div>
  );
}
