import { GoogleGenAI, GenerateContentResponse, Part, GroundingMetadata as SDKGroundingMetadata, Content } from '@google/genai';
import { ChatParams, GroundingMetadata as LocalGroundingMetadata, Message } from '../types'; 
import { DEFAULT_GEMINI_MODEL } from '../constants';

interface GeminiResponse {
  text: string;
  groundingMetadata?: LocalGroundingMetadata; 
}

export const sendMessageToGemini = async (
  promptText: string,
  history: Message[], // Added history parameter
  apiKey: string,
  modelName: string, 
  params?: ChatParams,
  imageBase64?: string 
): Promise<GeminiResponse> => {
  if (!apiKey) {
    throw new Error('API Key Gemini tidak tersedia.');
  }
  if (!modelName) {
    console.warn('Nama model Gemini tidak diberikan, menggunakan default:', DEFAULT_GEMINI_MODEL);
    modelName = DEFAULT_GEMINI_MODEL;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Format history messages
  const formattedHistory: Content[] = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }], 
    // Note: Images from previous history turns are not included here for simplicity.
    // If msg.imagePreview exists and model supports vision in history, this part needs enhancement.
  }));

  // Prepare current user prompt parts
  const currentUserParts: Part[] = [{ text: promptText }]; 
  if (imageBase64) {
    let mimeType = 'image/png'; 
    if (imageBase64.startsWith('data:image/jpeg;base64,')) mimeType = 'image/jpeg';
    else if (imageBase64.startsWith('data:image/png;base64,')) mimeType = 'image/png';
    else if (imageBase64.startsWith('data:image/webp;base64,')) mimeType = 'image/webp';
    else if (imageBase64.startsWith('data:image/gif;base64,')) mimeType = 'image/gif';
    else if (imageBase64.startsWith('/9j/')) mimeType = 'image/jpeg'; 
    else if (imageBase64.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
    else if (imageBase64.startsWith('UklGR')) mimeType = 'image/webp'; 
    else if (imageBase64.startsWith('R0lGOD')) mimeType = 'image/gif'; 
    
    const actualBase64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    currentUserParts.unshift({ 
      inlineData: {
        mimeType: mimeType,
        data: actualBase64Data, 
      },
    });
  }

  const fullContents: Content[] = [
    ...formattedHistory,
    { role: "user", parts: currentUserParts }
  ];

  try {
    const generationConfig: Record<string, any> = {};
    if (params?.temperature !== undefined) generationConfig.temperature = params.temperature;
    if (params?.top_p !== undefined) generationConfig.topP = params.top_p;
    if (params?.max_tokens !== undefined) generationConfig.maxOutputTokens = params.max_tokens;
    
    const systemInstructionText = params?.system_prompt;

    const requestPayload: any = { 
        model: modelName,
        contents: fullContents, // Use the combined history and current prompt
        config: generationConfig,
    };

    if (systemInstructionText) {
        requestPayload.systemInstruction = { parts: [{ text: systemInstructionText }] };
    }

    const response: GenerateContentResponse = await ai.models.generateContent(requestPayload);
    
    const text = response.text; 
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as LocalGroundingMetadata | undefined;

    return { text, groundingMetadata };

  } catch (error) {
    console.error(`Error calling Gemini API (model: ${modelName}):`, error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("API Key Gemini tidak valid. Silakan periksa kembali di Pengaturan.");
        }
        if (error.message.includes("billing account")) {
            throw new Error("Ada masalah dengan akun penagihan Google Cloud Anda terkait API Gemini.");
        }
         if (error.message.includes("quota")) {
            throw new Error("Anda telah melebihi kuota API Gemini. Silakan coba lagi nanti atau tingkatkan kuota Anda.");
        }
         if (error.message.toLowerCase().includes("model") && error.message.toLowerCase().includes("not found")) {
            throw new Error(`Model Gemini "${modelName}" tidak ditemukan atau tidak valid. Periksa nama model.`);
        }
        if (error.message.includes("request payload size exceeds the limit")) {
             throw new Error("Ukuran permintaan (prompt atau kode) terlalu besar untuk API Gemini.");
        }
    }
    throw new Error('Gagal mendapatkan respons dari Gemini: ' + (error instanceof Error ? error.message : String(error)));
  }
};
