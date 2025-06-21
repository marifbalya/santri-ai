
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  provider?: AIProvider;
  imagePreview?: string; // For vision input or image generation output
  model?: string; // Model used for this AI message
}

export enum AIProvider {
  GEMINI = 'Gemini',
  OPENROUTER = 'OpenRouter',
}

export interface ApiKeyEntry {
  id:string;
  label: string;
  apiKey: string;
  isDefault: boolean;
}

export interface ProviderSettings {
  apiKeys: ApiKeyEntry[];
  defaultModel: string; 
  endpoint?: string; 
}

export interface StoredProviderSettings extends ProviderSettings {
  lastUpdated: string;
}

export interface ApiSettings {
  [AIProvider.GEMINI]: ProviderSettings; 
  [AIProvider.OPENROUTER]: ProviderSettings;
}

export interface StoredApiSettings {
  [AIProvider.GEMINI]?: StoredProviderSettings; 
  [AIProvider.OPENROUTER]?: StoredProviderSettings;
}


export enum KangSantriPreset {
  NGAJI = "Ngaji Mode",
  BISNIS_HALAL = "Bisnis Halal",
  AI_KREATOR = "AI Kreator",
  SUARA_SANTRI = "Suara Santri", 
  DEFAULT = "Default",
}

export interface ChatParams {
  top_p?: number;
  temperature?: number;
  max_tokens?: number; // Max output tokens
  system_prompt?: string;
  model?: string; 
}

export interface GroundingChunkWeb {
  uri?: string; 
  title?: string; 
}

export interface GroundingChunk {
  web?: GroundingChunkWeb; 
  retrievedContext?: { 
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

// For Coding View - Saved Code Projects
export interface CodeProject {
  id: string;
  name: string;
  code: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}


// Old types kept for potential migration reference, can be removed later
export interface OldProviderConfig {
  apiKey: string;
  model: string; 
  endpoint?: string; 
}
export interface OldStoredApiConfig extends OldProviderConfig {
  lastUpdated: string;
}
export interface OldApiConfigs {
  [AIProvider.GEMINI]: OldStoredApiConfig; 
  [AIProvider.OPENROUTER]: OldStoredApiConfig;
}
export interface OldStoredApiConfigs {
    [AIProvider.GEMINI]?: OldStoredApiConfig;
    [AIProvider.OPENROUTER]?: OldStoredApiConfig;
}