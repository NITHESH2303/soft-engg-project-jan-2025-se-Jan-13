import React, { useState, useEffect, useRef } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Icon } from 'react-icons-kit';
import { send } from 'react-icons-kit/feather/send';
import { paperclip } from 'react-icons-kit/feather/paperclip';
import { mic } from 'react-icons-kit/feather/mic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatComponentProps {
  apiEndpoint?: string;
  title?: string;
  initialHistory?: Message[];
  onMessageAdded?: (message: Message) => void;
  className?: string;
  onHistoryChange?: (history: Message[]) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  apiEndpoint = 'http://127.0.0.1:8000/api/agent/host_agent',
  title = 'AI Assistant',
  initialHistory = [],
  onMessageAdded,
  className = '',
  onHistoryChange,
}) => {
  const [history, setHistory] = useState<Message[]>(initialHistory);
  const [cleanedCompletion, setCleanedCompletion] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<Message | null>(null);
  const rawCompletionRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    completion: rawCompletion,
    input,
    setInput,
    handleInputChange,
    isLoading,
    error,
    complete
  } = useCompletion({
    api: apiEndpoint,
    streamProtocol: 'text',
    onFinish: (prompt, completion) => {
      const cleanedFinalCompletion = cleanStreamOutput(completion);
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: cleanedFinalCompletion, 
        timestamp: new Date() 
      };
      
      setHistory(prevHistory => {
        const newHistory = [...prevHistory, assistantMessage];
        if (onHistoryChange) {
          onHistoryChange(newHistory);
        }
        return newHistory;
      });
      
      if (onMessageAdded) {
        onMessageAdded(assistantMessage);
      }
      
      setPendingUserMessage(null);
      setCleanedCompletion('');
      rawCompletionRef.current = '';
    },
    onError: (error) => {
      console.error('Error during completion:', error);
    }
  });

  const cleanStreamOutput = (text: string): string => {
    return text
      .replace(/^data:\s*/gm, '')
      .replace(/\n/g, ' ')
      .trim();
  };

  useEffect(() => {
    if (rawCompletion !== rawCompletionRef.current) {
      rawCompletionRef.current = rawCompletion;
      setCleanedCompletion(cleanStreamOutput(rawCompletion));
    }
  }, [rawCompletion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, cleanedCompletion, pendingUserMessage]);

  useEffect(() => {
    if (history.length === 0) {
      setTimeout(() => {
        setHistory([
          {
            role: 'assistant',
            content: "👋 Hi there! I'm your AI assistant for this course. How can I help you today?",
            timestamp: new Date()
          }
        ]);
      }, 500);
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    
    setHistory(prevHistory => {
      const newHistory = [...prevHistory, userMessage];
      if (onHistoryChange) {
        onHistoryChange(newHistory);
      }
      return newHistory;
    });
    
    if (onMessageAdded) {
      onMessageAdded(userMessage);
    }
    
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    complete(input, {
      body: {
        message: input,
        history: formattedHistory
      }
    });
    
    setInput('');
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      
      <div className="flex-1 overflow-auto p-4" ref={messagesContainerRef}>
        <div className="flex flex-col space-y-4">
          {history.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-purple-600 text-white ml-auto' 
                  : 'bg-white/10 text-white'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl bg-white/10 text-white">
                <div className="whitespace-pre-wrap">
                  {cleanedCompletion || (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 text-red-500 border border-red-300 rounded-lg my-2">
              Error: {error.message}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-white/20">
        <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[50px] max-h-[150px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
              style={{ overflowY: 'auto' }}
            />
            <div className="absolute bottom-3 right-3 flex space-x-2">
              <button
                type="button"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Icon icon={paperclip} size={18} />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Icon icon={mic} size={18} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors duration-200 flex items-center justify-center disabled:bg-purple-800 disabled:opacity-50"
          >
            <Icon icon={send} size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;