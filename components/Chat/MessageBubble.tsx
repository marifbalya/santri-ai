
import React from 'react';
import { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Spinner from '../ui/Spinner';
import type { Options } from 'react-markdown'; 

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
  const isUser = message.sender === 'user';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  interface CodeProps {
    node?: any;
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any; 
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl p-3 rounded-xl shadow ${
          isUser
            ? 'bg-primary text-white ml-auto rounded-br-none'
            : 'bg-gray-100 text-gray-800 dark:bg-bgDarkLighter dark:text-textDark rounded-bl-none'
        }`}
      >
        {message.imagePreview && (
            <img src={message.imagePreview} alt="User upload preview" className="max-w-full h-auto rounded-md mb-2 max-h-64 object-contain" />
        )}
        {isLoading ? (
            <div className="flex items-center space-x-2">
                <Spinner size="sm" color={isUser ? "text-white" : "text-primary"} />
                <span>{message.text}</span>
            </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: CodeProps) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${className || ''} bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}
        <div className={`text-xs mt-1.5 ${isUser ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'} text-right`}>
          {formatTime(message.timestamp)} 
          {message.provider && !isUser && ` (${message.provider}${message.model ? ` - ${message.model.substring(0,20)}${message.model.length > 20 ? '...' : ''}` : ''})`}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;