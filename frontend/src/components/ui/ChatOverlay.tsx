import React from 'react';
import { Icon } from 'react-icons-kit';
import { x } from 'react-icons-kit/feather/x';
import ChatComponent from '../ChatComponent';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-in-right z-50">
      <div className="flex justify-between items-center p-4 border-b border-white/20">
        <h3 className="text-lg font-semibold text-white">Chat Assistant</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
        >
          <Icon icon={x} size={20} />
        </button>
      </div>
      <div className="h-[calc(100%-64px)] overflow-hidden">
        <ChatComponent title="" className="h-full" />
      </div>
    </div>
  );
};

export default ChatOverlay;