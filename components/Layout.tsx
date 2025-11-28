
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bug, History, Settings, Info, Menu, X, ShieldCheck, Database } from 'lucide-react';
import { getSettings } from '../services/storageService';
import { UserRole } from '../types';

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1
        ${isActive ? 'bg-brand-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<UserRole>('Admin');
  const location = useLocation();

  useEffect(() => {
    // Poll for settings changes to update role in UI (simple implementation)
    const interval = setInterval(() => {
       const s = getSettings();
       if (s.userRole !== role) setRole(s.userRole);
    }, 1000);
    return () => clearInterval(interval);
  }, [role]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Incident Analyzer';
      case '/history': return 'Analysis History';
      case '/settings': return 'System Settings';
      case '/about': return 'About UDAI';
      default: return 'UDAI';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-500 p-1.5 rounded-lg">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">UDAI</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="mb-4 px-4">
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</p>
            </div>
            <SidebarItem to="/" icon={<Bug size={20} />} label="Analyzer & Live" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/history" icon={<History size={20} />} label="History & Audit" onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="mt-8 mb-4 px-4">
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Configuration</p>
            </div>
            <SidebarItem to="/settings" icon={<Settings size={20} />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem to="/about" icon={<Info size={20} />} label="About" onClick={() => setIsMobileMenuOpen(false)} />
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between mb-2">
               <span className="text-xs text-slate-400">Current Role</span>
               <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700">{role}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-xs font-medium text-slate-300">System Operational</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 lg:hidden text-slate-500 hover:text-slate-700"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200 text-xs font-medium">
               <Database size={14} className="mr-1.5" />
               Connectors Active
             </div>
             <div className="hidden md:flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-medium">
               <ShieldCheck size={14} className="mr-1.5" />
               Gemini Connected
             </div>
             <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-brand-200">
               {role.charAt(0)}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
