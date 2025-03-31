import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { logOut } from 'react-icons-kit/feather/logOut';

interface SidebarItem {
  icon: any;
  title: string;
  href: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const sidebarItems: SidebarItem[] = [
    { icon: home, title: 'Home', href: '/student/dashboard' },
    { icon: activity, title: 'Performance', href: '/student/performance' },
  ];

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing local storage, calling an API)
    navigate('/login'); // Navigate to login page after logout
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col items-center mb-8">
          <img
            src="/iitm_avatar.png"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">{localStorage.getItem('username')}</h2>
          <Link 
            to="/student/profile" 
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <Link 
              key={index}
              to={item.href} 
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                index === 0 ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50 text-gray-700'
              } transition-colors`}
            >
              <Icon icon={item.icon} size={20} />
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        className="flex items-center justify-center space-x-3 p-3 mt-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        <Icon icon={logOut} size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
