import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import { chatService } from './services/geminiService';
import { Message, Role, ModelType } from './types';
import { DEFAULT_MODEL } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { Content } from '@google/genai';
import { extractCodeFromMessages, triggerDownload } from './utils/downloadUtils';

const STORAGE_KEY_MESSAGES = 'spurify_chat_messages';
const STORAGE_KEY_MODEL = 'spurify_chat_model';

const App: React.FC = () => {
  // Initialize state from local storage or defaults
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load messages from storage", e);
      return [];
    }
  });

  const [model, setModel] = useState<ModelType>(() => {
    return (localStorage.getItem(STORAGE_KEY_MODEL) as ModelType) || DEFAULT_MODEL;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Initialize Chat Service on mount (with history)
  useEffect(() => {
    if (!initialized.current) {
      try {
        // Convert existing messages to GenAI History format
        const history: Content[] = messages
            .filter(m => !m.isStreaming && m.text.trim() !== '')
            .map(m => ({
                role: m.role === Role.USER ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));
            
        chatService.initChat(model, history);

        // Optional: Add a welcome message if strictly empty and no history
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
      initialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to LocalStorage effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
  }, [model]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleModelChange = (newModel: ModelType) => {
    if (newModel === model) return;
    setModel(newModel);
    setMessages([]); // Clear chat for new model context
    chatService.initChat(newModel, []); // Init new session without history
    setIsSidebarOpen(false); 
  };

  const handleClearChat = () => {
    setMessages([]);
    chatService.initChat(model, []);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
  };

  const handleDownloadCode = async () => {
    if (messages.length === 0) return;
    
    try {
        const blob = await extractCodeFromMessages(messages);
        if (blob) {
            triggerDownload(blob, `spurify-code-${Date.now()}.zip`);
        } else {
            alert("No code blocks found to extract!");
        }
    } catch (e) {
        console.error("Error zipping files", e);
        alert("Failed to create zip file.");
    }
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
        onDownload={handleDownloadCode}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative h-full w-full">
        <div className="md:hidden flex items-center p-4 border-b border-gray-800 bg-[#0d1117]">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold ml-2">Spurify Code</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="bg-[#0d1117]">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;