import { AIProvider, KangSantriPreset, ChatParams, ApiSettings, ProviderSettings } from './types';

export const APP_NAME = "KangSantri AI";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";
export const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-chat-v3-0324:free"; // Updated default
export const DEFAULT_IMAGE_GEN_MODEL_GEMINI = "imagen-3.0-generate-002";


export const INITIAL_API_SETTINGS: ApiSettings = {
  [AIProvider.GEMINI]: { 
    apiKeys: [], 
    defaultModel: DEFAULT_GEMINI_MODEL,
  },
  [AIProvider.OPENROUTER]: { 
    apiKeys: [], 
    defaultModel: DEFAULT_OPENROUTER_MODEL,
    endpoint: '' 
  },
};

export const PRESET_SYSTEM_PROMPTS: Record<KangSantriPreset, string> = {
  [KangSantriPreset.DEFAULT]: "Anda adalah asisten AI yang membantu.",
  [KangSantriPreset.NGAJI]: "Anda adalah seorang santri cerdas dan alim yang memberikan jawaban dengan sopan, religius, dan merujuk pada ajaran Islam. Gunakan sapaan Islami seperti Assalamu'alaikum, dan akhiri dengan Wallahu a'lam bisshawab jika sesuai. Selalu awali respons dengan Bismillahirahmanirrahim.",
  [KangSantriPreset.BISNIS_HALAL]: "Anda adalah konsultan bisnis berpengalaman yang fokus pada prinsip syariah dan halal. Berikan saran praktis untuk UMKM.",
  [KangSantriPreset.AI_KREATOR]: "Anda adalah AI super kreatif yang membantu content creator menghasilkan ide-ide brilian, skrip menarik, dan caption viral.",
  [KangSantriPreset.SUARA_SANTRI]: "Anda adalah seorang santri. Berikan jawaban teks, dan jawaban ini juga akan diucapkan dengan suara.",
};

export const DEFAULT_CHAT_PARAMS: ChatParams = {
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 4096, // Increased default, CodingView will use even higher specific values
  system_prompt: PRESET_SYSTEM_PROMPTS[KangSantriPreset.DEFAULT],
  model: DEFAULT_GEMINI_MODEL, // Default overall chat model, will be updated by activeProvider's default
};

export const AVAILABLE_MODELS_TEXT: Record<AIProvider, string[]> = {
    [AIProvider.GEMINI]: [DEFAULT_GEMINI_MODEL, "gemini-pro", "gemini-pro-vision"], 
    [AIProvider.OPENROUTER]: [
        "deepseek/deepseek-chat-v3-0324:free",
        "qwen/qwq-32b:free",
        "mistralai/mistral-7b-instruct:free",
        "google/gemini-2.0-flash-001",
        "openai/gpt-4.1-nano",
        "openai/gpt-4o-mini",
        "anthropic/claude-3-haiku" // Kept as it was in user's list
    ],
};

export const AVAILABLE_MODELS_VISION: Record<AIProvider, string[]> = {
    [AIProvider.GEMINI]: ["gemini-pro-vision", DEFAULT_GEMINI_MODEL],
    [AIProvider.OPENROUTER]: ["anthropic/claude-3-opus", "anthropic/claude-3-sonnet", "anthropic/claude-3-haiku"], 
};

export const AVAILABLE_MODELS_IMAGE_GEN: Record<AIProvider, string[]> = {
    [AIProvider.GEMINI]: [DEFAULT_IMAGE_GEN_MODEL_GEMINI],
    [AIProvider.OPENROUTER]: ["stabilityai/stable-diffusion-xl-base-1.0"],
};

export const API_DOCS_LINKS: Record<AIProvider, string> = {
  [AIProvider.GEMINI]: "https://ai.google.dev/docs",
  [AIProvider.OPENROUTER]: "https://openrouter.ai/docs",
};

export const OLD_LOCAL_STORAGE_API_CONFIGS_KEY = 'kangSantriApiConfigs'; // Keep old key for migration
export const LOCAL_STORAGE_API_SETTINGS_KEY = 'kangSantriApiSettings'; // New key
export const LOCAL_STORAGE_THEME_KEY = 'kangSantriTheme';
export const LOCAL_STORAGE_CHAT_HISTORY_KEY = 'kangSantriChatHistory';
export const LOCAL_STORAGE_ACTIVE_PROVIDER_KEY = 'kangSantriActiveProvider';
export const LOCAL_STORAGE_CHAT_PARAMS_KEY = 'kangSantriChatParams';
export const LOCAL_STORAGE_KANGSANTRI_PRESET_KEY = 'kangSantriPreset';
export const LOCAL_STORAGE_SAVED_CODES_KEY = 'kangSantriSavedCodes'; // New key for saved code projects
