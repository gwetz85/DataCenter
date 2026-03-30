import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chat from './Chat';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const location = useLocation();
  const isFullPage = location.pathname === '/cek-halal';

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="page-content-wrapper">
          <div className={`page-content animate-enter ${isFullPage ? 'no-padding' : ''}`}>
            <Outlet />
          </div>
        </div>
        <Chat />
        {/* Overlay for mobile drawer */}
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      </main>
    </div>
  );
}
