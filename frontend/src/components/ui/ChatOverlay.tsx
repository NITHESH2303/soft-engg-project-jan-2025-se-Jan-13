import React, { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { x } from 'react-icons-kit/feather/x';
import { maximize2 } from 'react-icons-kit/feather/maximize2';
import { minimize2 } from 'react-icons-kit/feather/minimize2';
import { messageSquare } from 'react-icons-kit/feather/messageSquare';
import { plus } from 'react-icons-kit/feather/plus';
import ChatComponent from '../ChatComponent';
import { useNavigate } from 'react-router-dom';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentChat {
  id: number;
  conversationId: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ConversationMetadata {
  conversationId: string | null;
  title: string | null;
  createdAt: string | null;
  modifiedAt: string | null;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const navigate  = useNavigate();
  const userId = localStorage.getItem("sub");

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId]);

  const welcomeMessage: Message = {
    role: 'assistant',
    content: "👋 Hi there! I'm your AI assistant for this course. How can I help you today?",
    timestamp: new Date(),
  };

  const fetchUserConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://65.0.106.97:8000/api/conversation/user/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();

      const conversations = Array.isArray(data) ? data : [data];
      
      const chats: RecentChat[] = conversations.map((conv: any, index: number) => {
        const lastMessage = conv.conversations.length > 0
          ? conv.conversations[conv.conversations.length - 1].content.substring(0, 30) +
            (conv.conversations[conv.conversations.length - 1].content.length > 30 ? '...' : '')
          : "No messages yet";
        
        return {
          id: index + 1,
          conversationId: conv.id,
          title: conv.title || "Untitled Chat",
          lastMessage,
          timestamp: new Date(conv.modified_at || conv.created_at || Date.now()),
        };
      });

      setRecentChats(chats);
      // Don’t auto-select a chat here; let the minimized view start fresh
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Start with a new chat (welcome message) every time the overlay opens
      setChatHistory([welcomeMessage]);
      setSelectedChat(null);
      setSelectedConversationId(null);
      setIsMaximized(false); // Ensure it starts minimized
      fetchUserConversations(); // Fetch chats for sidebar, but don’t select one
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleCreateNewChat = () => {
    setChatHistory([welcomeMessage]); // Start new chat with welcome message
    setSelectedChat(null);
    setSelectedConversationId(null);
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId);
    const selected = recentChats.find(chat => chat.id === chatId);
    if (selected) {
      setSelectedConversationId(selected.conversationId);
      fetch(`http://65.0.106.97:8000/api/conversation/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          const conversations = Array.isArray(data) ? data : [data];
          const conv = conversations.find((c: any) => c.id === selected.conversationId);
          if (conv) {
            setChatHistory(conv.conversations.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              timestamp: new Date(conv.modified_at || conv.created_at || Date.now()),
            })));
          }
        })
        .catch(error => console.error('Error fetching conversation:', error));
    }
  };

  const handleMessageAdded = (message: Message) => {
    if (selectedChat && message.role === 'assistant') {
      setRecentChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat
            ? {
                ...chat,
                lastMessage: message.content.substring(0, 30) + (message.content.length > 30 ? '...' : ''),
                timestamp: new Date(),
              }
            : chat
        )
      );
    }
  };

  const handleMetadataChange = (metadata: ConversationMetadata) => {
    if (metadata.conversationId && metadata.title) {
      setRecentChats(prevChats => {
        const existingChatIndex = prevChats.findIndex(chat => chat.conversationId === metadata.conversationId);
        if (existingChatIndex !== -1) {
          return prevChats.map(chat =>
            chat.conversationId === metadata.conversationId
              ? { ...chat, title: metadata.title, timestamp: new Date(metadata.modifiedAt || Date.now()) }
              : chat
          );
        }
        const newChat: RecentChat = {
          id: prevChats.length + 1,
          conversationId: metadata.conversationId,
          title: metadata.title,
          lastMessage: "Start a new conversation",
          timestamp: new Date(metadata.createdAt || Date.now()),
        };
        setSelectedChat(newChat.id);
        setSelectedConversationId(newChat.conversationId);
        return [newChat, ...prevChats];
      });
    }
  };

  return (
    <div
      className={`fixed ${
        isMaximized ? 'inset-0 m-4' : 'bottom-4 right-4 w-96 h-[600px]'
      } bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 z-50 flex`}
    >
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

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <div className="text-white text-center">Loading chats...</div>
            ) : recentChats.length === 0 ? (
              <div className="text-white text-center">No chats yet</div>
            ) : (
              recentChats.map((chat) => (
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
              ))
            )}
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
              title={isMaximized ? 'Minimize chat' : 'Maximize chat'}
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
            onMetadataChange={handleMetadataChange}
            conversationId={selectedConversationId}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatOverlay;