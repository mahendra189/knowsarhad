'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot, Plus, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatGPTInterface() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        type: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        type: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startNewChat = (): void => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 flex flex-col">
        <div className="p-3">
          <Button 
            onClick={startNewChat}
            className="w-full flex items-center justify-start gap-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Plus className="w-4 h-4" />
            New chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Today</div>
            <div className="text-sm text-gray-300 p-3 rounded hover:bg-gray-800 cursor-pointer truncate">
              College AI Assistant
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="text-sm text-gray-300">Student Project</div>
          <div className="text-xs text-gray-500">OpenRouter AI Demo</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-800 px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">College AI Assistant</h1>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Student Demo</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                  How can I help you today?
                </h2>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-200">
                    <strong>Student Project Notice:</strong> This AI assistant is powered by OpenRouter API and created by college students for educational purposes. 
                    Feel free to ask questions and explore AI capabilities!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`py-6 px-4 ${msg.type === 'bot' ? 'bg-gray-750' : ''}`}>
                  <div className="flex gap-4 max-w-3xl mx-auto">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full">
                      {msg.type === 'user' ? (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="py-6 px-4 bg-gray-750">
                  <div className="flex gap-4 max-w-3xl mx-auto">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-gray-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end bg-gray-700 rounded-lg">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Assistant..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none pr-12 py-3 disabled:opacity-50"
                style={{ minHeight: '44px' }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 p-0 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-gray-800 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-gray-800" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-400 text-center mt-2">
              Powered by OpenRouter API • Student Educational Project
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}