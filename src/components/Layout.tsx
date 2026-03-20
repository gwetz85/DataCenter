import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chat from './Chat';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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
        <Chat />
        {/* Overlay for mobile drawer */}
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      </main>
    </div>
  );
}
