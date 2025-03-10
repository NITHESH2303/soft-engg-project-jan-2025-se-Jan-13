// Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { book } from 'react-icons-kit/feather/book';
import { calendar } from 'react-icons-kit/feather/calendar';
import { award } from 'react-icons-kit/feather/award';
import { settings } from 'react-icons-kit/feather/settings';
import { helpCircle } from 'react-icons-kit/feather/helpCircle';
import { logOut } from 'react-icons-kit/feather/logOut';

interface NavItem {
  path: string;
  label: string;
  icon: object;
}

interface SidebarProps {
  studentName?: string;
  studentId?: string;
  courseId?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  studentName = "Student Name", 
  studentId = "21f3001255", 
  courseId 
}) => {
  const location = useLocation();
  
  // Define navigation items
  const topNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: home },
    { path: "/progress", label: "My Progress", icon: activity },
    { path: `/course/${courseId}`, label: "Current Course", icon: book },
    { path: "/schedule", label: "Schedule", icon: calendar },
    { path: "/certificates", label: "Certificates", icon: award },
  ];
  
  const bottomNavItems: NavItem[] = [
    { path: "/settings", label: "Settings", icon: settings },
    { path: "/help", label: "Help & Support", icon: helpCircle },
    { path: "/logout", label: "Log Out", icon: logOut },
  ];

  // Helper function to determine if a link is active
  const isActive = (path: string): boolean => {
    // Special case for course path to match any course URL
    if (path.includes('/course/') && location.pathname.includes('/course/')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-md flex flex-col">
      {/* Logo and branding */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-purple-700">LearnHub</h1>
        <p className="text-sm text-gray-500 mt-1">Online Learning Platform</p>
      </div>
      
      {/* User info */}
      <div className="p-4 border-b flex items-center">
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">
          {studentName.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-800 truncate max-w-[160px]">{studentName}</p>
          <p className="text-xs text-gray-500">ID: {studentId}</p>
        </div>
      </div>
      
      {/* Top navigation items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {topNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon icon={item.icon} size={18} />
              <span className="ml-3">{item.label}</span>
              {item.label === "Current Course" && isActive(item.path) && (
                <span className="ml-auto h-2 w-2 rounded-full bg-purple-500"></span>
              )}
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Course progress if on a course page */}
      {location.pathname.includes('/course/') && (
        <div className="px-4 py-3 border-t border-b">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Course Progress</p>
            <span className="text-xs font-semibold text-purple-700">45%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      )}
      
      {/* Bottom navigation items */}
      <div className="p-4 border-t">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon icon={item.icon} size={16} />
              <span className="ml-3 text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};