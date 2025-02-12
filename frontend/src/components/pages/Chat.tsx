import { useState, useEffect } from 'react';
import { Icon } from 'react-icons-kit';
import { messageSquare } from 'react-icons-kit/feather/messageSquare';
import { plus } from 'react-icons-kit/feather/plus';
import { send } from 'react-icons-kit/feather/send';

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface RecentChat {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [recentChats, setRecentChats] = useState<RecentChat[]>([
    {
      id: 1,
      title: "Project Discussion",
      lastMessage: "Let's discuss the new features",
      timestamp: new Date(2024, 0, 15)
    },
    {
      id: 2,
      title: "Technical Support",
      lastMessage: "How can I help you today?",
      timestamp: new Date(2024, 0, 14)
    }
  ]);

  useEffect(() => {
    // Add welcome message when component mounts
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          text: "👋 Hi there! I'm your AI assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date()
        }
      ]);
    }, 500);
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        text: inputMessage,
        isBot: false,
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Chats</h2>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <Icon icon={plus} size={20} className="text-purple-400" />
              </button>
            </div>

            {/* Recent Chats */}
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-200">
                      <Icon icon={messageSquare} size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{chat.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.isBot
                        ? 'bg-purple-500/20 text-white'
                        : 'bg-white/20 text-white ml-auto'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/20">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors duration-200 flex items-center justify-center"
                >
                  <Icon icon={send} size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}