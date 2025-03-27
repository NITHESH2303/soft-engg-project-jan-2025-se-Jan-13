import React, { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { x } from 'react-icons-kit/feather/x';
import { maximize2 } from 'react-icons-kit/feather/maximize2';
import { minimize2 } from 'react-icons-kit/feather/minimize2';
import { messageSquare } from 'react-icons-kit/feather/messageSquare';
import { plus } from 'react-icons-kit/feather/plus';
import ChatComponent from '../ChatComponent';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentChat {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
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

  if (!isOpen) return null;

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

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
    <div className={`fixed ${isMaximized 
        ? 'inset-0 m-4' 
        : 'bottom-4 right-4 w-96 h-[600px]'
      } bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 z-50 flex`}>
      {/* Sidebar */}
      {isMaximized && (
        <div className="w-72 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">Chats</h2>
            <button 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              onClick={handleCreateNewChat}
            >
              <Icon icon={plus} size={20} className="text-purple-400" />
            </button>
          </div>

          {/* New Chat Input */}
          {showNewChatInput && (
            <div className="p-3 bg-white/10">
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
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
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
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">
            {isMaximized && selectedChat 
              ? recentChats.find(chat => chat.id === selectedChat)?.title || 'Chat'
              : 'Chat Assistant'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleMaximize}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title={isMaximized ? "Minimize chat" : "Maximize chat"}
            >
              <Icon icon={isMaximized ? minimize2 : maximize2} size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Close chat"
            >
              <Icon icon={x} size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatComponent 
            title="" 
            className="h-full" 
            onHistoryChange={setChatHistory}
            onMessageAdded={handleMessageAdded}
            initialHistory={chatHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatOverlay;