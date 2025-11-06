import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, Database, Clipboard, Heart, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Upload', path: '/upload', icon: Upload },
  { name: 'Manual Entry', path: '/manual', icon: Database },
  { name: 'Recommendations', path: '/recommendations', icon: Clipboard },
  { name: 'AI Chat', path: '/chat', icon: MessageSquare },
  { name: 'Lifestyle Plan', path: '/lifestyle', icon: Heart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-surface/80 backdrop-blur-xl shadow-card border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <svg
                className="w-10 h-10 relative transition-transform group-hover:scale-110 group-hover:rotate-12"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M8 4C8 4 12 8 16 8C20 8 24 4 24 4"
                  stroke="#4A90E2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 16C8 16 12 12 16 12C20 12 24 16 24 16"
                  stroke="#6C63FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 28C8 28 12 24 16 24C20 24 24 28 24 28"
                  stroke="#00D9A3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line x1="10" y1="6" x2="22" y2="14" stroke="#10B981" strokeWidth="2" />
                <line x1="10" y1="14" x2="22" y2="22" stroke="#10B981" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SERA AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow'
                      : 'text-text-secondary hover:bg-surface-light hover:text-primary transform hover:scale-105'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Hidden by default, can be toggled */}
      <div className="md:hidden border-t border-gray-200 hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

