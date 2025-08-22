'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bot, Loader2, ArrowUp, MessageCircle, Plus, Menu, X } from "lucide-react";

interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
  source?: 'community' | 'ai';
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function ChatGPTInterface() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  // Load chat history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ks_chat_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (Array.isArray(parsed)) {
          const chats = parsed.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            messages: Array.isArray(chat.messages) ? chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) : []
          }));
          setChatHistory(chats);
          // If there is at least one chat, load the most recent as current
          if (chats.length > 0) {
            setMessages([...chats[0].messages]);
            setCurrentChatId(chats[0].id);
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ks_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const createNewChat = () => {
    // Only clear the current chat, do not save here
    setMessages([]);
    setCurrentChatId("");
    setSidebarOpen(false);
  };

  const loadChat = (chat: ChatHistory) => {
    setMessages([...chat.messages]);
    setCurrentChatId(chat.id);
    setSidebarOpen(false);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      type: 'user',
      timestamp: new Date()
    };

    // Optimistically add user message
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
      // Add bot message and then save to history
      setMessages(prev => {
        const updated = [...prev, botMessage];
        // Save to history after bot response
        const newChatHistory: ChatHistory = {
          id: Date.now().toString(),
          title: updated[0]?.text.substring(0, 30) + "..." || "New Chat",
          messages: updated,
          createdAt: new Date()
        };
        setChatHistory(prevHistory => [newChatHistory, ...prevHistory]);
        setCurrentChatId(newChatHistory.id);
        return updated;
      });
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

  return (
    <div className="flex h-screen bg-neutral-900">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-40 w-64 h-full bg-neutral-800 border-r border-gray-700 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          
          {/* Logo and New Chat */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="KnowSarhadAI Logo"
                className="w-10 h-10 rounded-lg shadow-lg object-contain bg-white"
              />
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">KnowSarhadAI</h1>
                <p className="text-xs text-gray-400">Sarhad College</p>
              </div>
            </div>
            <Button 
              onClick={createNewChat}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white border border-gray-600 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Recent Chats</h3>
            <div className="space-y-2">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No chat history yet</p>
              ) : (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-neutral-700 ${
                      currentChatId === chat.id ? 'bg-neutral-700 border border-gray-600' : 'bg-neutral-800'
                    }`}
                  >
                    <div className="text-sm text-white truncate font-medium">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {chat.createdAt.toLocaleDateString()} {chat.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Powered by OpenRouter API
            </p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-neutral-800">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden bg-transparent hover:bg-neutral-700 text-white p-2"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="lg:hidden flex items-center gap-2">
              <img
                src="/logo.png"
                alt="KnowSarhadAI Logo"
                className="w-8 h-8 rounded-lg shadow-lg object-contain bg-white"
              />
              <div>
                <h1 className="text-base font-bold text-white leading-tight">KnowSarhadAI</h1>
                <p className="text-xs text-gray-400">Sarhad College</p>
              </div>
            </div>
          </div>
          
          <a href="/contribute">
            <Button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
              Contribute Knowledge
            </Button>
          </a>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-4">
                <img
                  src="/logo.png"
                  alt="KnowSarhadAI Logo"
                  className="w-16 h-16 rounded-full mx-auto mb-4 shadow-lg object-contain bg-white"
                />
                <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                  Welcome to KnowSarhadAI! What would you like to learn or ask about today?
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
                        <img
                          src="/logo.png"
                          alt="KnowSarhadAI Logo"
                          className="w-8 h-8 rounded-full shadow-sm object-contain bg-white"
                        />
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
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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