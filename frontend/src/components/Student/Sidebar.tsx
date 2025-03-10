import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'react-icons-kit';

interface SidebarItem {
  icon: any;
  title: string;
  href: string;
}

interface SidebarProps {
  profileImage: string;
  profileTitle: string;
  items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ profileImage, profileTitle, items }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
      <div className="flex flex-col items-center mb-8">
        <img
          src={profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full mb-4"
        />
        <h2 className="text-xl font-bold">{profileTitle}</h2>
        <Link 
          to="/profile" 
          className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          View Profile
        </Link>
      </div>

      <nav className="space-y-2">
        {items.map((item, index) => (
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
  );
};

export default Sidebar;
