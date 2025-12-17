import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, onStop }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="relative flex items-end bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-blue-600/50 focus-within:border-blue-500 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Spurify for code, debugging, or explanation..."
          className="w-full bg-transparent text-gray-200 placeholder-gray-500 p-4 min-h-[56px] max-h-[200px] resize-none focus:outline-none rounded-xl font-sans"
          rows={1}
          disabled={isLoading}
        />
        <div className="pb-3 pr-3">
            {isLoading ? (
                 /* This is purely visual as we don't have abort controller hooked up in this simple version, 
                    but good UX to show busy state clearly */
                <button 
                    disabled
                    className="p-2 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                >
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                </button>
            ) : (
                <button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                    input.trim() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-900/20' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Send size={18} />
                </button>
            )}
        </div>
      </div>
      <div className="text-center mt-2">
         <p className="text-[10px] text-gray-600">
            Spurify Code can make mistakes. Verify critical code.
         </p>
      </div>
    </div>
  );
};

export default ChatInput;