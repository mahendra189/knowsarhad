'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot, Plus, Loader2, ArrowUp } from "lucide-react";

interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
  source?: 'community' | 'ai';
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
        timestamp: new Date(),
        source: data.source === 'community' ? 'community' : 'ai',
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
    <div className="flex h-screen bg-neutral-900">

      {/* Contribute Button */}
      <div className="absolute top-4 right-4 z-50">
        <a href="/contribute">
          <Button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
            Contribute Knowledge
          </Button>
        </a>
      </div>

  {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                  Welcome to Knowsarhad! What would you like to learn or ask about today?
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
              {messages.map((msg) => {
                const isUser = msg.type === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full py-3 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="flex flex-col items-center mr-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-5 py-3 text-gray-100 whitespace-pre-wrap shadow-md ${
                        isUser
                          ? 'bg-purple-600 rounded-br-none ml-2'
                          : 'bg-gray-800 rounded-bl-none mr-2'
                      }`}
                    >
                      {msg.text}
                      {msg.type === 'bot' && msg.source === 'community' && (
                        <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Answered by Community
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div className="flex flex-col items-center ml-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex w-full py-3 px-2 justify-start">
                  <div className="flex flex-col items-center mr-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="max-w-[70%] rounded-2xl px-5 py-3 bg-gray-800 text-gray-100 shadow-md rounded-bl-none mr-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-neutral-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end bg-neutral-700 rounded-full">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Assistant..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none pr-12 py-3 disabled:opacity-50 rounded-full"
                style={{ minHeight: '44px' }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 p-0 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:opacity-50 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-gray-800 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 text-gray-800" />
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