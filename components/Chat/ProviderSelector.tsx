
import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { AIProvider } from '../../types';
import Select from '../ui/Select';

const ProviderSelector: React.FC = () => {
  const { activeProvider, setActiveProvider, apiSettings } = useContext(AppContext); // Changed apiConfigs to apiSettings

  const providerOptions = Object.values(AIProvider).map(provider => ({
    value: provider,
    // Check if there's any key that isDefault and has a value for apiKey
    label: `${provider} ${apiSettings[provider]?.apiKeys.some(k => k.isDefault && k.apiKey) ? '✅' : '🔑?'}`, 
  }));

  return (
    <div className="flex items-center"> 
      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline mr-1">Provider:</span>
      <Select
        value={activeProvider}
        onChange={(e) => setActiveProvider(e.target.value as AIProvider)}
        options={providerOptions}
        wrapperClassName="mb-0 min-w-[90px] sm:min-w-[140px]" 
        className="text-xs sm:text-sm py-1.5" 
        title="Pilih Provider AI"
      />
    </div>
  );
};

export default ProviderSelector;
