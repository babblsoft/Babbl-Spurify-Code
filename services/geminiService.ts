import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { API_MODELS, ModelType } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

let ai: GoogleGenAI | null = null;

// Initialize the AI client securely
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key missing");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export class ChatService {
  private chatSession: Chat | null = null;
  private currentModel: ModelType | null = null;

  constructor() {}

  public initChat(modelType: ModelType) {
    const client = getAiClient();
    const modelName = API_MODELS[modelType];
    
    // Configure thinking budget if the user selected the "Thinking" variant
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    if (modelType === ModelType.THINKING) {
       // Enable thinking for the 2.5 flash model if requested (using a safe default budget)
       // Note: This is an example. If the specific model doesn't support thinking, this might need adjustment.
       // Assuming gemini-2.5-flash supports thinking via config.
       config.thinkingConfig = { thinkingBudget: 1024 }; 
    }

    this.chatSession = client.chats.create({
      model: modelName,
      config: config,
    });
    this.currentModel = modelType;
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    try {
      const resultStream = await this.chatSession.sendMessageStream({ message });
      
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }

  public reset() {
    this.chatSession = null;
    this.currentModel = null;
  }
}

export const chatService = new ChatService();
