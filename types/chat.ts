export interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatAPIRequest {
  messages: ChatMessage[];
}

export interface ChatAPIResponse {
  message: string;
  model: string;
}

export interface ChatAPIError {
  error: string;
  details?: string;
}

export interface OpenRouterMessage {
  role: string;
  content: string;
}

export interface OpenRouterChoice {
  message: OpenRouterMessage;
  finish_reason?: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}