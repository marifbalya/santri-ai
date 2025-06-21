
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { AIProvider, ApiKeyEntry } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { AVAILABLE_MODELS_TEXT, API_DOCS_LINKS } from '../../constants';
import { EyeIcon, EyeSlashIcon, InfoIcon, TrashIcon, PencilIcon, SparklesIcon, PlusIcon } from '../ui/Icons'; // Added PlusIcon

interface ProviderSettingsManagerProps {
  provider: AIProvider;
}

const ProviderSettingsManager: React.FC<ProviderSettingsManagerProps> = ({ provider }) => {
  const { 
    apiSettings, 
    addApiKey, 
    updateApiKey, 
    deleteApiKey, 
    setActiveApiKey, 
    updateProviderDefaultModel,
    updateProviderEndpoint 
  } = useContext(AppContext);

  const providerData = apiSettings[provider];

  const [localDefaultModel, setLocalDefaultModel] = useState(providerData.defaultModel);
  const [localEndpoint, setLocalEndpoint] = useState(providerData.endpoint || '');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyEntry | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showCurrentEditingKey, setShowCurrentEditingKey] = useState(false);

  useEffect(() => {
    setLocalDefaultModel(providerData.defaultModel);
    setLocalEndpoint(providerData.endpoint || '');
  }, [provider, providerData]);

  const handleOpenModalForAdd = () => {
    setEditingKey(null);
    setNewKeyLabel('');
    setNewKeyValue('');
    setShowCurrentEditingKey(true); // Show key by default when adding
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (keyEntry: ApiKeyEntry) => {
    setEditingKey(keyEntry);
    setNewKeyLabel(keyEntry.label);
    setNewKeyValue(keyEntry.apiKey);
    setShowCurrentEditingKey(false); // Hide key by default when editing existing
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    setShowCurrentEditingKey(false);
  };

  const handleSaveApiKey = () => {
    if (!newKeyLabel.trim() || !newKeyValue.trim()) {
      alert("Label dan API Key tidak boleh kosong.");
      return;
    }
    if (editingKey) {
      updateApiKey(provider, editingKey.id, { label: newKeyLabel, apiKey: newKeyValue });
    } else {
      addApiKey(provider, { label: newKeyLabel, apiKey: newKeyValue });
    }
    handleCloseModal();
  };

  const handleDeleteApiKey = (keyId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus API Key ini?")) {
      deleteApiKey(provider, keyId);
    }
  };

  const handleSetActiveApiKey = (keyId: string) => {
    setActiveApiKey(provider, keyId);
  };

  const handleSaveProviderSettings = () => {
    updateProviderDefaultModel(provider, localDefaultModel);
    if (provider === AIProvider.OPENROUTER) {
      updateProviderEndpoint(provider, localEndpoint);
    }
    alert(`Pengaturan umum untuk ${provider} telah disimpan.`);
  };

  const modelOptions = (AVAILABLE_MODELS_TEXT[provider] || []).map(m => ({ value: m, label: m }));
   // Ensure current default model is in options if not in AVAILABLE_MODELS_TEXT
  if (localDefaultModel && !modelOptions.some(opt => opt.value === localDefaultModel)) {
    modelOptions.unshift({ value: localDefaultModel, label: `${localDefaultModel} (custom)` });
  }


  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm space-y-6 bg-white dark:bg-bgDarkLighter">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-primary dark:text-primary-light">{provider} Settings</h3>
        <a 
            href={API_DOCS_LINKS[provider]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-accent hover:underline flex items-center"
            title={`Dokumentasi API ${provider}`}
        >
            <InfoIcon className="w-4 h-4 mr-1" />
            Dokumentasi
        </a>
      </div>

      {/* General Provider Settings */}
      <div className="space-y-4 p-3 border-b border-gray-200 dark:border-gray-600">
        <h4 className="text-md font-medium text-textLight dark:text-textDark">Pengaturan Umum Provider</h4>
        {modelOptions.length > 0 && (
            <Select
                label="Model Default (untuk Teks/Chat & Coding)"
                options={modelOptions}
                value={localDefaultModel}
                onChange={(e) => setLocalDefaultModel(e.target.value)}
            />
        )}
        
        {provider === AIProvider.OPENROUTER && (
            <Input
                label="Custom Endpoint (Opsional)"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="Contoh: https://api.openrouter.ai/api/v1"
            />
        )}
        <Button onClick={handleSaveProviderSettings} size="sm">
            Simpan Pengaturan Umum
        </Button>
      </div>

      {/* API Key Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-textLight dark:text-textDark">Kelola API Keys</h4>
            <Button onClick={handleOpenModalForAdd} size="sm" variant="primary" leftIcon={<PlusIcon className="w-4 h-4"/>}>
                Tambah Key Baru
            </Button>
        </div>

        {providerData.apiKeys.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada API Key untuk provider {provider}.</p>
        ) : (
          <ul className="space-y-3">
            {providerData.apiKeys.map((keyEntry) => (
              <li key={keyEntry.id} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                  <span className="font-medium text-textLight dark:text-textDark break-all">{keyEntry.label}</span>
                  {keyEntry.isDefault && (
                    <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 px-2 py-0.5 rounded-full inline-flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1"/> Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 break-all">
                  Key: {showCurrentEditingKey && editingKey?.id === keyEntry.id ? keyEntry.apiKey : `${keyEntry.apiKey.substring(0, 4)}...${keyEntry.apiKey.substring(keyEntry.apiKey.length - 4)}`}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  {!keyEntry.isDefault && (
                    <Button onClick={() => handleSetActiveApiKey(keyEntry.id)} size="sm" variant="ghost">
                      Jadikan Aktif
                    </Button>
                  )}
                  <Button onClick={() => handleOpenModalForEdit(keyEntry)} size="sm" variant="secondary" leftIcon={<PencilIcon className="w-3.5 h-3.5"/>}>
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteApiKey(keyEntry.id)} size="sm" variant="danger" leftIcon={<TrashIcon className="w-3.5 h-3.5"/>}>
                    Hapus
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingKey ? 'Edit API Key' : 'Tambah API Key Baru'}>
        <div className="space-y-4">
          <Input 
            label="Label Key"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="Contoh: Kunci Pribadi Gemini"
          />
          <div className="relative">
            <Input 
              label="API Key"
              type={showCurrentEditingKey ? 'text' : 'password'}
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder={`Masukkan API Key ${provider}`}
            />
            <button 
                type="button" 
                onClick={() => setShowCurrentEditingKey(prev => !prev)}
                className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title={showCurrentEditingKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
            >
                {showCurrentEditingKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleCloseModal}>Batal</Button>
          <Button onClick={handleSaveApiKey}>Simpan Key</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderSettingsManager;
