import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'react-icons-kit';
import { send } from 'react-icons-kit/feather/send';
import { paperclip } from 'react-icons-kit/feather/paperclip';
import { mic } from 'react-icons-kit/feather/mic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const getCourseIdFromUrl = () => {
    const pathParts = window.location.pathname.split('/');
    const courseIndex = pathParts.indexOf('course');
    return courseIndex !== -1 && pathParts[courseIndex + 1] ? pathParts[courseIndex + 1] : null;
  };

  const prepareHistoryForApi = (messageHistory: Message[]) => {
    return messageHistory.map(({ role, content }) => ({
      role,
      content
    }));
  };

  const handleStream = (query: string, courseId: string | null) => {
    setIsLoading(true);
    setError(null);
    setCurrentResponse('');

    const url = new URL(apiEndpoint);
    url.searchParams.append('query', query);
    url.searchParams.append('user_id', '1');
    if (courseId) {
      url.searchParams.append('course_id', courseId);
    }
    
    const historyToSend = history.length > 0 ? prepareHistoryForApi(history) : [];
    const historyJson = JSON.stringify(historyToSend);
    url.searchParams.append('history', historyJson);

    const source = new EventSource(url.toString());
    eventSourceRef.current = source;

    let fullResponse = '';

    source.onmessage = (event) => {
      const chunk = JSON.parse(event.data);
      
      if (chunk.type === 'text') {
        fullResponse += chunk.content;
        setCurrentResponse(fullResponse);
      } else if (chunk.type === 'end') {
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        };
        
        setHistory((prevHistory) => {
          const newHistory = [...prevHistory, assistantMessage];
          if (onHistoryChange) {
            onHistoryChange(newHistory);
          }
          return newHistory;
        });
        
        if (onMessageAdded) {
          onMessageAdded(assistantMessage);
        }
        
        source.close();
        setIsLoading(false);
        setCurrentResponse('');
      } else if (chunk.type === 'error') {
        setError(chunk.content);
        source.close();
        setIsLoading(false);
      }
    };

    source.onerror = () => {
      setError('An error occurred while streaming the response.');
      source.close();
      setIsLoading(false);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentResponse]);

  useEffect(() => {
    if (history.length === 0) {
      setTimeout(() => {
        setHistory([
          {
            role: 'assistant',
            content: "👋 Hi there! I'm your AI assistant for this course. How can I help you today?",
            timestamp: new Date(),
          },
        ]);
      }, 500);
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory, userMessage];
      if (onHistoryChange) {
        onHistoryChange(newHistory);
      }
      return newHistory;
    });

    if (onMessageAdded) {
      onMessageAdded(userMessage);
    }

    const courseId = getCourseIdFromUrl();
    handleStream(input, courseId);

    setInput('');
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Markdown components with custom styling
  const markdownComponents = {
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold mt-2 mb-1">{children}</h3>,
    p: ({ children }: any) => <p className="mb-2">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
    li: ({ children }: any) => <li className="mb-1">{children}</li>,
    code: ({ inline, children }: any) => 
      inline ? (
        <code className="bg-gray-800/50 px-1.5 py-0.5 rounded text-sm">{children}</code>
      ) : (
        <pre className="bg-gray-800/50 p-3 rounded-lg my-2 overflow-x-auto">
          <code>{children}</code>
        </pre>
      ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic text-gray-300">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: any) => (
      <a href={href} className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}

      <div className="flex-1 overflow-auto p-4" ref={messagesContainerRef}>
        <div className="flex flex-col space-y-4">
          {history.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user' ? 'bg-purple-600 text-white ml-auto' : 'bg-white/10 text-white'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                <div
                  className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl bg-white/10 text-white">
                {currentResponse ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {currentResponse}
                  </ReactMarkdown>
                ) : (
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-red-500 border border-red-300 rounded-lg my-2">
              Error: {error}
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
              onChange={(e) => setInput(e.target.value)}
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