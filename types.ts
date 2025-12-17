export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  timestamp: number;
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  THINKING = 'gemini-2.5-flash-thinking', // Custom internal key to handle thinking config
}

// Actual model strings to send to API
export const API_MODELS = {
  [ModelType.FLASH]: 'gemini-2.5-flash',
  [ModelType.PRO]: 'gemini-3-pro-preview',
  [ModelType.THINKING]: 'gemini-2.5-flash', // Uses flash but adds thinking config
};

export interface ChatSessionConfig {
  model: ModelType;
  thinkingBudget?: number;
}