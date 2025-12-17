import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Cpu } from 'lucide-react';
import { Message, Role } from '../types';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-4xl w-full gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Cpu size={16} />}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${isUser ? 'ml-auto' : ''} text-gray-400`}>
              {isUser ? 'You' : 'Spurify Code'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={`prose prose-invert max-w-none break-words ${
             isUser ? 'bg-blue-600/10 rounded-2xl rounded-tr-sm px-4 py-3 inline-block text-left' : ''
          }`}>
             {/* If it's a model message, render full markdown. If user, just text (mostly). */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  return !inline && match ? (
                    <CodeBlock language={language} value={String(children).replace(/\n$/, '')} />
                  ) : (
                    <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                a: ({ node, ...props }) => (
                  <a target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-4 space-y-1 my-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
            
            {message.isStreaming && (
               <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;