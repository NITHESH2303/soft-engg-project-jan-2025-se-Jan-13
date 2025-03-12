import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { messageSquare } from 'react-icons-kit/feather/messageSquare';
import { plus } from 'react-icons-kit/feather/plus';
import { send } from 'react-icons-kit/feather/send';
import { home } from 'react-icons-kit/feather/home';
import { activity } from 'react-icons-kit/feather/activity';
import { Link, useLocation } from 'react-router-dom';
import ChatComponent from '../ChatComponent';

interface RecentChat {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function Chat() {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([
    {
      id: 1,
      title: "Course Assistant",
      lastMessage: "How can I help with your course?",
      timestamp: new Date(2025, 0, 15)
    },
    {
      id: 2,
      title: "Assignment Helper",
      lastMessage: "Need help with your assignment?",
      timestamp: new Date(2025, 0, 14)
    }
  ]);
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const location = useLocation();
  const initialHistory = location.state?.chatHistory || [];

  const handleCreateNewChat = () => {
    if (showNewChatInput) {
      if (newChatTitle.trim()) {
        const newChat: RecentChat = {
          id: recentChats.length + 1,
          title: newChatTitle,
          lastMessage: "Start a new conversation",
          timestamp: new Date()
        };
        setRecentChats([newChat, ...recentChats]);
        setSelectedChat(newChat.id);
        setNewChatTitle('');
      }
      setShowNewChatInput(false);
    } else {
      setShowNewChatInput(true);
    }
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId);
  };

  const handleMessageAdded = (message: any) => {
    if (selectedChat && message.role === 'assistant') {
      setRecentChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat 
            ? { ...chat, lastMessage: message.content.substring(0, 30) + (message.content.length > 30 ? '...' : ''), timestamp: new Date() }
            : chat
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Chats</h2>
              <button 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={handleCreateNewChat}
              >
                <Icon icon={plus} size={20} className="text-purple-400" />
              </button>
            </div>

            {/* New Chat Input */}
            {showNewChatInput && (
              <div className="mb-4 p-3 bg-white/10 rounded-xl">
                <input
                  type="text"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  placeholder="Enter chat title..."
                  className="w-full bg-transparent border border-white/20 rounded-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCreateNewChat}
                    className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            {/* Recent Chats */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-200 group ${
                    selectedChat === chat.id ? 'bg-white/20' : ''
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-200">
                      <Icon icon={messageSquare} size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{chat.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {chat.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Links */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <Icon icon={home} size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link 
                to="/performance" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <Icon icon={activity} size={20} />
                <span className="font-medium">Performance</span>
              </Link>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            {selectedChat ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/20">
                  <h3 className="text-xl font-semibold text-white">
                    {recentChats.find(chat => chat.id === selectedChat)?.title || 'Chat'}
                  </h3>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatComponent 
                    title="" 
                    className="h-full"
                    onMessageAdded={handleMessageAdded}
                    initialHistory={initialHistory}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white/70">
                  <Icon icon={messageSquare} size={48} className="mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
                  <p>Choose an existing conversation or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}