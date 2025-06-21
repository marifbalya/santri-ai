
import React, { useState, useContext } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';
import { AppContext } from '../../contexts/AppContext';
import { AIProvider } from '../../types'; // Removed ProviderConfig as it's not directly used
import { DEFAULT_IMAGE_GEN_MODEL_GEMINI, AVAILABLE_MODELS_IMAGE_GEN } from '../../constants';
import { generateImageWithGemini, generateImageWithPlaceholder } from '../../services/imageGenService';
import { ImageIcon } from '../ui/Icons'; 

const ImageGenView: React.FC = () => {
  const { apiSettings } = useContext(AppContext); // Changed apiConfigs to apiSettings
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.GEMINI);
  const [selectedImageModel, setSelectedImageModel] = useState<string>(DEFAULT_IMAGE_GEN_MODEL_GEMINI);


  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Prompt tidak boleh kosong.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    const currentProviderSettings = apiSettings[selectedProvider];
    const activeApiKeyEntry = currentProviderSettings?.apiKeys.find(k => k.isDefault && k.apiKey);

    if (!activeApiKeyEntry || !activeApiKeyEntry.apiKey) {
      setError(`API Key aktif untuk ${selectedProvider} belum diatur atau tidak valid. Silakan periksa Pengaturan.`);
      setIsLoading(false);
      return;
    }
    const apiKeyToUse = activeApiKeyEntry.apiKey;
    
    // Model selection logic (can be expanded if needed)
    let modelToUse = selectedImageModel;
    if (!AVAILABLE_MODELS_IMAGE_GEN[selectedProvider]?.includes(modelToUse)) {
        modelToUse = AVAILABLE_MODELS_IMAGE_GEN[selectedProvider]?.[0] || '';
        if (!modelToUse) {
            setError(`Tidak ada model gambar yang tersedia untuk ${selectedProvider}.`);
            setIsLoading(false);
            return;
        }
    }


    try {
      let images: string[] = [];
      if (selectedProvider === AIProvider.GEMINI) {
        images = await generateImageWithGemini(prompt, apiKeyToUse, modelToUse, numImages, negativePrompt);
      } else if (selectedProvider === AIProvider.OPENROUTER) {
        // Assuming OpenRouter (or other providers) will use a similar service structure
        images = await generateImageWithPlaceholder(prompt, selectedProvider, modelToUse, numImages, negativePrompt);
      } else {
         setError(`Provider ${selectedProvider} tidak didukung untuk generasi gambar saat ini.`);
         setIsLoading(false);
         return;
      }
      setGeneratedImages(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat gambar.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const providerOptions = Object.values(AIProvider)
    .filter(p => AVAILABLE_MODELS_IMAGE_GEN[p]?.length > 0)
    .map(p => ({ 
        value: p, 
        label: `${p} ${apiSettings[p]?.apiKeys.some(k => k.isDefault && k.apiKey) ? '✅' : '🔑?'}` 
    }));
  
  const currentImageModels = AVAILABLE_MODELS_IMAGE_GEN[selectedProvider] || [];
  const imageModelOptions = currentImageModels.map(m => ({value: m, label: m}));

  // Update selectedImageModel if provider changes or models for provider update
  React.useEffect(() => {
    const models = AVAILABLE_MODELS_IMAGE_GEN[selectedProvider] || [];
    if (models.length > 0) {
      if (!models.includes(selectedImageModel)) { // If current model not in new list
        setSelectedImageModel(models[0]); // Set to first available
      }
    } else {
      setSelectedImageModel(''); // No models available
    }
  }, [selectedProvider, selectedImageModel]); // Removed apiSettings from deps here as it's about available models list


  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-textLight dark:text-textDark">Generate Gambar AI</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Pilih Provider Gambar"
          options={providerOptions}
          value={selectedProvider}
          onChange={(e) => {
            const newProvider = e.target.value as AIProvider;
            setSelectedProvider(newProvider);
            // Auto-select first model for new provider
            const newProviderModels = AVAILABLE_MODELS_IMAGE_GEN[newProvider] || [];
            if (newProviderModels.length > 0) {
              setSelectedImageModel(newProviderModels[0]);
            } else {
              setSelectedImageModel('');
            }
          }}
        />
        {imageModelOptions.length > 0 && (
            <Select
                label="Pilih Model Gambar"
                options={imageModelOptions}
                value={selectedImageModel}
                onChange={(e) => setSelectedImageModel(e.target.value)}
            />
        )}
      </div>


      <Textarea
        label="Prompt Gambar"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Contoh: Seekor kucing astronot mengendarai skateboard di bulan, gaya lukisan cat minyak."
        rows={3}
      />
      <Textarea
        label="Prompt Negatif (Opsional)"
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        placeholder="Contoh: buram, kualitas rendah, teks, watermark"
        rows={2}
      />
      <Input
        label="Jumlah Gambar (1-4)"
        type="number"
        value={numImages}
        min={1}
        max={4} 
        onChange={(e) => setNumImages(parseInt(e.target.value))}
      />

      <Button onClick={handleGenerateImage} isLoading={isLoading} disabled={isLoading || !selectedImageModel}>
        {isLoading ? 'Sedang Membuat...' : 'Generate Gambar'}
      </Button>

      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
          <p className="ml-4 text-textLight dark:text-textDark">AI sedang melukis imajinasi Anda...</p>
        </div>
      )}

      {generatedImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3 text-textLight dark:text-textDark">Hasil Gambar:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {generatedImages.map((imageBase64, index) => (
              <div key={index} className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
                <img src={`data:image/jpeg;base64,${imageBase64}`} alt={`Generated image ${index + 1}`} className="w-full h-auto object-contain" />
                <div className="p-2 flex justify-end">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:image/jpeg;base64,${imageBase64}`;
                            link.download = `kang_santri_ai_image_${Date.now()}.jpg`;
                            link.click();
                        }}
                    >
                        Unduh
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
       {!isLoading && generatedImages.length === 0 && !error && (
         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Masukkan prompt dan klik "Generate Gambar" untuk melihat keajaiban AI.</p>
         </div>
       )}
    </div>
  );
};

export default ImageGenView;
