import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import { chatService } from './services/geminiService';
import { Message, Role, ModelType } from './types';
import { DEFAULT_MODEL } from './constants';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<ModelType>(DEFAULT_MODEL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Service on mount or model change
  useEffect(() => {
    try {
      chatService.initChat(model);
      // Optional: Add a welcome message if empty
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: Role.MODEL,
            text: `## Hello, Developer! 🚀\nI'm **Spurify Code**. I can help you with:\n\n- Writing and Refactoring Code\n- Debugging Errors\n- Explaining Complex Concepts\n\nI am currently running on **${model}**. How can I assist you today?`,
            timestamp: Date.now(),
          }
        ]);
      }
    } catch (e) {
      console.error("Failed to initialize chat", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleModelChange = (newModel: ModelType) => {
    if (newModel === model) return;
    setModel(newModel);
    setMessages([]); // Clear chat for new model context
    chatService.reset();
    setIsSidebarOpen(false); // Close sidebar on mobile on selection
  };

  const handleClearChat = () => {
    setMessages([]);
    chatService.initChat(model);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const botMsgId = uuidv4();
    // Placeholder for bot message
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        role: Role.MODEL,
        text: '',
        isStreaming: true,
        timestamp: Date.now(),
      },
    ]);

    try {
      let fullText = '';
      const stream = chatService.sendMessageStream(text);

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMsgId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }

      // Finalize message
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMsgId 
            ? { ...msg, text: fullText, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Error in chat loop:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: Role.MODEL,
          text: "**Error:** Something went wrong communicating with the API. Please ensure your API Key is valid.",
          timestamp: Date.now(),
        }
      ]);
      // Remove the stuck empty loading message if it exists and is empty
      setMessages((prev) => prev.filter(m => !(m.id === botMsgId && m.text === '')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-gray-200 overflow-hidden font-sans">
      <Sidebar 
        currentModel={model} 
        onModelChange={handleModelChange} 
        onClear={handleClearChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative h-full w-full">
        {/* Header (Mobile Only mostly) */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-800 bg-[#0d1117]">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold ml-2">Spurify Code</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#0d1117]">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;