
import { GoogleGenAI, GenerateImagesResponse } from '@google/genai';
import { AIProvider } from '../types';
import { DEFAULT_IMAGE_GEN_MODEL_GEMINI } from '../constants';

export const generateImageWithGemini = async (
  prompt: string,
  apiKey: string,
  modelName: string = DEFAULT_IMAGE_GEN_MODEL_GEMINI,
  numberOfImages: number = 1,
  negativePrompt?: string
): Promise<string[]> => {
  if (!apiKey) {
    throw new Error('API Key Gemini tidak tersedia.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelToUse = modelName || DEFAULT_IMAGE_GEN_MODEL_GEMINI;

  try {
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: modelToUse,
      prompt: prompt,
      config: { 
        numberOfImages: Math.max(1, Math.min(4, numberOfImages)), // Clamp between 1 and 4 as an example limit
        outputMimeType: 'image/jpeg', // JPEG is often smaller
        // Negative prompt is not directly supported in generateImages config in the same way as some other APIs.
        // It would typically be part of the main prompt string for Gemini Imagen.
        // Example: "A cat astronaut, ((ugly, deformed, text, watermark))"
        // For now, if negativePrompt is provided, we can prepend it or handle as per Gemini's best practices.
        // The current SDK does not seem to have a dedicated negative_prompt field in config for generateImages.
        // So, we'll just use the main prompt.
      },
    });

    return response.generatedImages.map(img => img.image.imageBytes); // Assuming imageBytes is base64
  } catch (error) {
    console.error('Error calling Gemini Image Generation API:', error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("API Key Gemini tidak valid untuk Imagen. Silakan periksa kembali di Pengaturan.");
        }
         if (error.message.includes("quota")) {
            throw new Error("Anda telah melebihi kuota API Gemini Imagen. Silakan coba lagi nanti atau tingkatkan kuota Anda.");
        }
    }
    throw new Error('Gagal membuat gambar dengan Gemini: ' + (error instanceof Error ? error.message : String(error)));
  }
};


export const generateImageWithPlaceholder = async (
  prompt: string,
  provider: AIProvider,
  model: string,
  numberOfImages: number = 1,
  negativePrompt?: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const images: string[] = [];
      for (let i = 0; i < numberOfImages; i++) {
        // Use picsum.photos for placeholder images (base64 encoded)
        // This is a simplified placeholder. Real image generation would return base64 data.
        // For now, returning a placeholder URL as if it were base64. This will not render correctly.
        // A better placeholder would be a fixed base64 string of a small image.
        // Or fetch from picsum then convert to base64.
        // For simplicity, let's use a very small, generic base64 image.
        const placeholderBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // 1x1 red pixel
        images.push(placeholderBase64); 
      }
      console.log(`Placeholder image generation for ${provider} (model: ${model}): prompt "${prompt}", negative: "${negativePrompt}"`);
      resolve(images);
    }, 1500 + Math.random() * 1000);
  });
};
