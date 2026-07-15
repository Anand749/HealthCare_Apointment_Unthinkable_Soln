import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, Search, LogOut, Bell, Menu, X,
  Stethoscope, Heart, TrendingUp, History, FileText, Clock, Plus, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'patient':
        return [
          { label: 'Overview', path: '/patient', icon: LayoutDashboard },
          { label: 'Find Doctors', path: '/patient/doctors', icon: Search },
          { label: 'Health Timeline', path: '/patient/timeline', icon: History },
          { label: 'Health Insights', path: '/patient/insights', icon: TrendingUp },
          { label: 'Medications', path: '/patient/medications', icon: Clock },
        ];
      case 'doctor':
        return [
          { label: 'Consultation Room', path: '/doctor', icon: Stethoscope },
          { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { label: 'Patient Records', path: '/doctor/patients', icon: FileText },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
          { label: 'Schedules', path: '/admin/schedules', icon: Calendar },
          { label: 'Specializations', path: '/admin/specializations', icon: Plus },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const pageName = location.pathname.split('/').filter(Boolean).pop() || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
          <Heart className="h-5 w-5 text-blue-600 fill-blue-100" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-blue-600">HealSync</span>
          <span className="block text-[9px] font-bold text-slate-400 tracking-widest uppercase">SaaS Portal</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/patient' && item.path !== '/doctor' && item.path !== '/admin' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
              {item.label}
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-slate-200 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 p-5 fixed h-full z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────── */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-slate-800 capitalize">
              {pageName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Role badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Role:</span>
              <span className="text-xs font-bold text-blue-600 capitalize">{user?.role}</span>
            </div>

            {/* Notification bell */}
            <button className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <Bell className="h-4 w-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white p-5 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left">
            <div className="flex justify-end mb-2">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
