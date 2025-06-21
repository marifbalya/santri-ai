
import React, { useState } from 'react';
import { AIProvider } from '../../types';
import ProviderSettingsManager from './ProviderSettingsManager'; // New component
import Button from '../ui/Button';
import { InfoIcon } from '../ui/Icons';

const SettingsView: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.GEMINI);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-textLight dark:text-textDark">Pengaturan API Provider</h2>
      
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        {(Object.values(AIProvider) as AIProvider[]).map((provider) => (
          <Button
            key={provider}
            onClick={() => setSelectedProvider(provider)}
            variant={selectedProvider === provider ? 'primary' : 'ghost'}
            size="md"
          >
            {provider}
          </Button>
        ))}
      </div>

      {selectedProvider && <ProviderSettingsManager provider={selectedProvider} />}
      
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              API Key disimpan secara lokal di browser Anda dan tidak dikirim ke server KangSantri AI.
              Pastikan Anda memahami risiko keamanan jika menggunakan perangkat bersama.
              Model default yang dipilih di sini akan menjadi model utama untuk provider tersebut.
              API Key yang ditandai "Aktif" akan digunakan untuk semua operasi AI dengan provider tersebut.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
