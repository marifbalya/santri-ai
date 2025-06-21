
import React, { useState, useRef } from 'react';
import Button from '../ui/Button';
import { SendIcon, PaperClipIcon, XIcon } from '../ui/Icons'; // Assuming you have PaperClipIcon

interface ChatInputProps {
  onSendMessage: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!inputText.trim() && !imageBase64)) return;
    onSendMessage(inputText, imageBase64);
    setInputText('');
    setImagePreview(null);
    setImageBase64(undefined);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5MB.");
        return;
      }
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        alert("Format gambar tidak didukung. Harap unggah JPEG, PNG, WEBP, atau GIF.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Extract base64 part: data:image/png;base64,THIS_PART
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(undefined);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="chat-input-form" className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-bgDarkLighter fixed bottom-0 md:relative md:bottom-auto left-0 right-0 z-40"> {/* Changed bottom-12 to bottom-0, md:bottom-auto */}
      {imagePreview && (
        <div className="mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md relative max-w-xs">
          <img src={imagePreview} alt="Preview unggahan" className="max-h-32 w-auto rounded" />
          <button 
            type="button" 
            onClick={removeImage} 
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700"
            aria-label="Hapus gambar"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-end space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light rounded-full focus:outline-none focus:ring-2 focus:ring-primary self-end"
          aria-label="Lampirkan gambar"
          disabled={isLoading}
        >
          <PaperClipIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp,image/gif"
        />
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan Anda atau unggah gambar..."
          className="flex-grow p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-gray-50 dark:bg-gray-700 dark:text-textDark placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base max-h-32"
          rows={1}
          disabled={isLoading}
          style={{ overflowY: 'auto' }} // Ensure scrollbar appears if text overflows
        />
        <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={isLoading || (!inputText.trim() && !imageBase64)} 
            className="self-end px-3 py-2.5 sm:px-4" // Made button always visible and adjusted padding
            aria-label="Kirim pesan"
        >
          <SendIcon className="w-5 h-5" />
          <span className="hidden sm:inline ml-2">Kirim</span>
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
