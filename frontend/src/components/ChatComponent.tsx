// ChatComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useCompletion } from '@ai-sdk/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatComponentProps {
  apiEndpoint?: string;
  title?: string;
  initialHistory?: Message[];
  onMessageAdded?: (message: Message) => void;
  className?: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  apiEndpoint = 'http://127.0.0.1:8000/api/agent/host_agent',
  title = 'AI Assistant',
  initialHistory = [],
  onMessageAdded,
  className = '',
}) => {
  const [history, setHistory] = useState<Message[]>(initialHistory);
  const [cleanedCompletion, setCleanedCompletion] = useState('');
  const rawCompletionRef = useRef('');

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
      // Clean up the final completion before adding to history
      const cleanedFinalCompletion = cleanStreamOutput(completion);
      
      // Create the new message
      const userMessage: Message = { role: 'user', content: prompt };
      const assistantMessage: Message = { role: 'assistant', content: cleanedFinalCompletion };
      
      // Update history
      setHistory(prevHistory => [
        ...prevHistory,
        userMessage,
        assistantMessage
      ]);
      
      // Call the callback if provided
      if (onMessageAdded) {
        onMessageAdded(userMessage);
        onMessageAdded(assistantMessage);
      }
      
      // Reset the cleaned completion
      setCleanedCompletion('');
      rawCompletionRef.current = '';
    },
    onError: (error) => {
      console.error('Error during completion:', error);
    }
  });

  // Function to clean the stream output
  const cleanStreamOutput = (text: string): string => {
    return text
      .replace(/^data:\s*/gm, '') // Remove "data: " prefix
      .replace(/\n/g, ' ')        // Replace newlines with spaces
      .trim();                    // Trim extra spaces
  };

  // Update cleaned completion whenever raw completion changes
  useEffect(() => {
    if (rawCompletion !== rawCompletionRef.current) {
      rawCompletionRef.current = rawCompletion;
      setCleanedCompletion(cleanStreamOutput(rawCompletion));
    }
  }, [rawCompletion]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Format history to match the expected API format
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Call complete manually with the correctly structured request body
    complete(input, {
      body: {
        message: input,
        history: formattedHistory
      }
    });
    
    // Reset input after submitting
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      
      <div className="flex-1 overflow-auto mb-4 p-4 border rounded-lg">
        {history.map((message, index) => (
          <div key={index} className={`mb-3 p-3 rounded-lg ${
            message.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-gray-100 mr-auto max-w-[80%]'
          }`}>
            <div className="font-semibold mb-1">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="mb-3 p-3 rounded-lg bg-gray-100 mr-auto max-w-[80%]">
            <div className="font-semibold mb-1">Assistant</div>
            <div className="whitespace-pre-wrap">{cleanedCompletion}</div>
          </div>
        )}
        
        {error && (
          <div className="p-3 text-red-500 border border-red-300 rounded-lg my-2">
            Error: {error.message}
          </div>
        )}
      </div>
      
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;