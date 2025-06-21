
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  AIProvider, 
  ApiSettings, 
  ChatParams, 
  KangSantriPreset, 
  StoredApiSettings,
  StoredProviderSettings,
  ApiKeyEntry,
  CodeProject, // New type for saved code projects
  OldStoredApiConfigs, 
  OldStoredApiConfig   
} from '../types';
import { 
  INITIAL_API_SETTINGS, 
  DEFAULT_CHAT_PARAMS, 
  PRESET_SYSTEM_PROMPTS, 
  LOCAL_STORAGE_API_SETTINGS_KEY, 
  OLD_LOCAL_STORAGE_API_CONFIGS_KEY, 
  LOCAL_STORAGE_THEME_KEY, 
  LOCAL_STORAGE_ACTIVE_PROVIDER_KEY, 
  LOCAL_STORAGE_CHAT_PARAMS_KEY, 
  LOCAL_STORAGE_KANGSANTRI_PRESET_KEY,
  LOCAL_STORAGE_SAVED_CODES_KEY, // New key
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENROUTER_MODEL,
  AVAILABLE_MODELS_TEXT // Added import
} from '../constants';

export enum AppView {
  CHAT = 'Chat',
  IMAGE = 'Gambar',
  CODING = 'Coding', 
  TUTORIAL = 'Tutorial', 
  SAVED_CODES = 'Kode Tersimpan', // New view for saved codes
  SETTINGS = 'Pengaturan',
}

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  apiSettings: ApiSettings;
  addApiKey: (provider: AIProvider, keyDetails: Omit<ApiKeyEntry, 'id' | 'isDefault'>) => void;
  updateApiKey: (provider: AIProvider, keyId: string, updates: Partial<Omit<ApiKeyEntry, 'id' | 'isDefault'>>) => void;
  deleteApiKey: (provider: AIProvider, keyId: string) => void;
  setActiveApiKey: (provider: AIProvider, keyId: string) => void;
  updateProviderDefaultModel: (provider: AIProvider, model: string) => void;
  updateProviderEndpoint: (provider: AIProvider, endpoint?: string) => void;
  activeProvider: AIProvider;
  setActiveProvider: (provider: AIProvider) => void;
  chatParams: ChatParams;
  updateChatParams: (params: Partial<ChatParams>) => void;
  kangSantriPreset: KangSantriPreset;
  setKangSantriPreset: (preset: KangSantriPreset) => void;

  // Saved Code Projects
  savedCodeProjects: CodeProject[];
  addCodeProject: (projectData: Pick<CodeProject, 'name' | 'code'>) => string; // Returns new project ID
  updateCodeProject: (projectId: string, updates: Partial<Pick<CodeProject, 'name' | 'code'>>) => void;
  deleteCodeProject: (projectId: string) => void;
  activeEditingProjectId: string | null;
  loadCodeProjectForEditing: (projectId: string | null) => void;
  clearActiveEditingProject: () => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [apiSettings, setApiSettingsState] = useState<ApiSettings>(INITIAL_API_SETTINGS);
  const [activeProvider, setActiveProviderState] = useState<AIProvider>(AIProvider.GEMINI);
  const [chatParams, setChatParamsState] = useState<ChatParams>(DEFAULT_CHAT_PARAMS);
  const [kangSantriPreset, setKangSantriPresetState] = useState<KangSantriPreset>(KangSantriPreset.DEFAULT);
  
  // State for Saved Code Projects
  const [savedCodeProjects, setSavedCodeProjectsState] = useState<CodeProject[]>([]);
  const [activeEditingProjectId, setActiveEditingProjectIdState] = useState<string | null>(null);


  // Load and migrate settings on initial mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme | null;
    if (storedTheme) setTheme(storedTheme);
    else setTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    let loadedSettings: ApiSettings | null = null;
    const newSettingsStr = localStorage.getItem(LOCAL_STORAGE_API_SETTINGS_KEY);

    if (newSettingsStr) {
      try {
        const parsedNewSettings = JSON.parse(newSettingsStr) as StoredApiSettings;
        loadedSettings = { ...INITIAL_API_SETTINGS }; 
        (Object.keys(loadedSettings) as AIProvider[]).forEach(providerKey => {
          if (parsedNewSettings[providerKey]) {
            loadedSettings![providerKey] = {
              ...INITIAL_API_SETTINGS[providerKey], 
              ...(parsedNewSettings[providerKey] as StoredProviderSettings),
            };
          }
        });
      } catch (e) {
        console.error("Gagal memuat pengaturan API baru:", e);
        localStorage.removeItem(LOCAL_STORAGE_API_SETTINGS_KEY);
      }
    } else {
      const oldSettingsStr = localStorage.getItem(OLD_LOCAL_STORAGE_API_CONFIGS_KEY);
      if (oldSettingsStr) {
        console.log("Melakukan migrasi dari pengaturan API lama...");
        try {
          const parsedOldSettings = JSON.parse(oldSettingsStr) as OldStoredApiConfigs;
          const migratedSettings: ApiSettings = { ...INITIAL_API_SETTINGS };
          
          (Object.keys(migratedSettings) as AIProvider[]).forEach(providerKey => {
            const oldConfig = parsedOldSettings[providerKey];
            if (oldConfig && oldConfig.apiKey) {
              const newApiKeyEntry: ApiKeyEntry = {
                id: `${Date.now()}-${providerKey}`,
                label: `Kunci Utama ${providerKey}`,
                apiKey: oldConfig.apiKey,
                isDefault: true,
              };
              migratedSettings[providerKey] = {
                apiKeys: [newApiKeyEntry],
                defaultModel: oldConfig.model || (providerKey === AIProvider.GEMINI ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENROUTER_MODEL),
                endpoint: oldConfig.endpoint || '',
              };
            }
          });
          loadedSettings = migratedSettings;
          localStorage.setItem(LOCAL_STORAGE_API_SETTINGS_KEY, JSON.stringify(
             Object.fromEntries(
                Object.entries(loadedSettings).map(([key, value]) => [key, {...value, lastUpdated: new Date().toISOString()}])
            ) as StoredApiSettings
          ));
          localStorage.removeItem(OLD_LOCAL_STORAGE_API_CONFIGS_KEY);
          console.log("Migrasi berhasil.");
        } catch (e) {
          console.error("Gagal melakukan migrasi pengaturan API lama:", e);
          localStorage.removeItem(OLD_LOCAL_STORAGE_API_CONFIGS_KEY);
        }
      }
    }
    
    setApiSettingsState(loadedSettings || INITIAL_API_SETTINGS);

    const storedProvider = localStorage.getItem(LOCAL_STORAGE_ACTIVE_PROVIDER_KEY) as AIProvider | null;
    if (storedProvider && Object.values(AIProvider).includes(storedProvider)) {
      setActiveProviderState(storedProvider);
    }
    
    const initialActiveProvider = storedProvider || AIProvider.GEMINI;
    const effectiveSettingsForParams = loadedSettings || INITIAL_API_SETTINGS;
    const defaultModelForInitialProvider = effectiveSettingsForParams[initialActiveProvider]?.defaultModel || 
                                           (initialActiveProvider === AIProvider.GEMINI ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENROUTER_MODEL);

    const storedChatParams = localStorage.getItem(LOCAL_STORAGE_CHAT_PARAMS_KEY);
    if (storedChatParams) {
        try {
            const parsedParams = JSON.parse(storedChatParams);
            setChatParamsState({...DEFAULT_CHAT_PARAMS, ...parsedParams, model: parsedParams.model || defaultModelForInitialProvider });
        } catch (e) { console.error("Gagal parse param chat tersimpan", e); localStorage.removeItem(LOCAL_STORAGE_CHAT_PARAMS_KEY); setChatParamsState(prev => ({...prev, model: defaultModelForInitialProvider}));}
    } else {
        setChatParamsState(prev => ({...prev, model: defaultModelForInitialProvider}));
    }
    
    const storedPreset = localStorage.getItem(LOCAL_STORAGE_KANGSANTRI_PRESET_KEY) as KangSantriPreset | null;
    if (storedPreset && Object.values(KangSantriPreset).includes(storedPreset)) {
        setKangSantriPresetState(storedPreset);
        if (!storedChatParams || !JSON.parse(storedChatParams).system_prompt) {
          setChatParamsState(prev => ({ ...prev, system_prompt: PRESET_SYSTEM_PROMPTS[storedPreset], model: prev.model || defaultModelForInitialProvider }));
        }
    } else {
        setChatParamsState(prev => ({ ...prev, system_prompt: PRESET_SYSTEM_PROMPTS[KangSantriPreset.DEFAULT], model: prev.model || defaultModelForInitialProvider }));
    }

    // Load Saved Code Projects
    const storedSavedCodes = localStorage.getItem(LOCAL_STORAGE_SAVED_CODES_KEY);
    if (storedSavedCodes) {
        try {
            setSavedCodeProjectsState(JSON.parse(storedSavedCodes));
        } catch (e) {
            console.error("Gagal memuat kode tersimpan:", e);
            localStorage.removeItem(LOCAL_STORAGE_SAVED_CODES_KEY);
        }
    }

  }, []);

  const updateChatParams = useCallback((params: Partial<ChatParams>) => {
    setChatParamsState(prevParams => {
        const newParams = { ...prevParams, ...params };
        localStorage.setItem(LOCAL_STORAGE_CHAT_PARAMS_KEY, JSON.stringify(newParams));
        return newParams;
    });
  }, []);

  const saveApiSettings = useCallback((newSettings: ApiSettings) => {
    setApiSettingsState(newSettings);
    const settingsToStore: StoredApiSettings = {};
    (Object.keys(newSettings) as AIProvider[]).forEach(pKey => {
      settingsToStore[pKey] = {
        ...newSettings[pKey],
        lastUpdated: new Date().toISOString(),
      };
    });
    localStorage.setItem(LOCAL_STORAGE_API_SETTINGS_KEY, JSON.stringify(settingsToStore));
  }, []);

  const addApiKey = useCallback((provider: AIProvider, keyDetails: Omit<ApiKeyEntry, 'id' | 'isDefault'>) => {
    setApiSettingsState(prev => {
      const newKey: ApiKeyEntry = {
        ...keyDetails,
        id: `${Date.now()}-${provider}`,
        isDefault: prev[provider].apiKeys.length === 0, 
      };
      const updatedKeys = [...prev[provider].apiKeys, newKey];
      if (newKey.isDefault) {
        updatedKeys.forEach(k => { if (k.id !== newKey.id) k.isDefault = false; });
      }
      const newSettings = { ...prev, [provider]: { ...prev[provider], apiKeys: updatedKeys } };
      saveApiSettings(newSettings);
      return newSettings;
    });
  }, [saveApiSettings]);

  const updateApiKey = useCallback((provider: AIProvider, keyId: string, updates: Partial<Omit<ApiKeyEntry, 'id' | 'isDefault'>>) => {
    setApiSettingsState(prev => {
      const updatedKeys = prev[provider].apiKeys.map(k => k.id === keyId ? { ...k, ...updates } : k);
      const newSettings = { ...prev, [provider]: { ...prev[provider], apiKeys: updatedKeys } };
      saveApiSettings(newSettings);
      return newSettings;
    });
  }, [saveApiSettings]);

  const deleteApiKey = useCallback((provider: AIProvider, keyId: string) => {
    setApiSettingsState(prev => {
      const keyToDelete = prev[provider].apiKeys.find(k => k.id === keyId);
      const remainingKeys = prev[provider].apiKeys.filter(k => k.id !== keyId);
      if (keyToDelete?.isDefault && remainingKeys.length > 0) {
        remainingKeys[0].isDefault = true; 
      }
      const newSettings = { ...prev, [provider]: { ...prev[provider], apiKeys: remainingKeys } };
      saveApiSettings(newSettings);
      if (keyToDelete?.isDefault && provider === activeProvider) {
         updateChatParams({ model: newSettings[provider].defaultModel });
      }
      return newSettings;
    });
  }, [saveApiSettings, activeProvider, updateChatParams]);

  const setActiveApiKey = useCallback((provider: AIProvider, keyId: string) => {
    setApiSettingsState(prev => {
      const updatedKeys = prev[provider].apiKeys.map(k => ({ ...k, isDefault: k.id === keyId }));
      const newSettings = { ...prev, [provider]: { ...prev[provider], apiKeys: updatedKeys } };
      saveApiSettings(newSettings);
      if (provider === activeProvider) {
        updateChatParams({ model: newSettings[provider].defaultModel });
      }
      return newSettings;
    });
  }, [saveApiSettings, activeProvider, updateChatParams]);

  const updateProviderDefaultModel = useCallback((provider: AIProvider, model: string) => {
    setApiSettingsState(prev => {
      const newSettings = { ...prev, [provider]: { ...prev[provider], defaultModel: model } };
      saveApiSettings(newSettings);
      if (provider === activeProvider) {
        updateChatParams({ model });
      }
      return newSettings;
    });
  }, [saveApiSettings, activeProvider, updateChatParams]);

  const updateProviderEndpoint = useCallback((provider: AIProvider, endpoint?: string) => {
    if (provider !== AIProvider.OPENROUTER) return; 
    setApiSettingsState(prev => {
      const newSettings = { ...prev, [provider]: { ...prev[provider], endpoint: endpoint || '' } };
      saveApiSettings(newSettings);
      return newSettings;
    });
  }, [saveApiSettings]);
  
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
      return newTheme;
    });
  }, []);

  const setActiveProvider = useCallback((provider: AIProvider) => {
    setActiveProviderState(provider);
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROVIDER_KEY, provider);
    setApiSettingsState(prevApiSettings => {
      updateChatParams({ model: prevApiSettings[provider].defaultModel });
      return prevApiSettings; 
    });
  }, [updateChatParams]);

  const setKangSantriPreset = useCallback((preset: KangSantriPreset) => {
    setKangSantriPresetState(preset);
    localStorage.setItem(LOCAL_STORAGE_KANGSANTRI_PRESET_KEY, preset);
    setApiSettingsState(prevApiSettings => {
      setActiveProviderState(currentActiveProvider => {
         updateChatParams({ 
            system_prompt: PRESET_SYSTEM_PROMPTS[preset],
            model: prevApiSettings[currentActiveProvider].defaultModel 
        });
        return currentActiveProvider; 
      });
      return prevApiSettings; 
    });
  }, [updateChatParams]);

  useEffect(() => {
    const currentProviderDefaultModel = apiSettings[activeProvider]?.defaultModel;
    if (currentProviderDefaultModel && chatParams.model !== currentProviderDefaultModel) {
      // Check if the current chatParams.model is even valid for the activeProvider
      const availableModels = AVAILABLE_MODELS_TEXT[activeProvider] || [];
      if (!availableModels.includes(chatParams.model || '')) {
        updateChatParams({ model: currentProviderDefaultModel });
      }
      // If the model is valid but not the default, this effect could cause loops
      // Re-evaluate if this specific condition `chatParams.model !== currentProviderDefaultModel` is too strict
      // For now, if current model is not provider's default OR not in provider's available list, reset to provider's default.
      if (!availableModels.includes(chatParams.model || '') || chatParams.model !== currentProviderDefaultModel) {
          updateChatParams({ model: currentProviderDefaultModel });
      }
    }
  }, [apiSettings, activeProvider, chatParams.model, updateChatParams]);

  // Saved Code Projects CRUD
  const saveCodeProjectsToStorage = useCallback((projects: CodeProject[]) => {
    localStorage.setItem(LOCAL_STORAGE_SAVED_CODES_KEY, JSON.stringify(projects));
  }, []);

  const addCodeProject = useCallback((projectData: Pick<CodeProject, 'name' | 'code'>): string => {
    const newProject: CodeProject = {
      ...projectData,
      id: `${Date.now()}-code`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedCodeProjectsState(prev => {
      const updatedProjects = [...prev, newProject];
      saveCodeProjectsToStorage(updatedProjects);
      return updatedProjects;
    });
    return newProject.id;
  }, [saveCodeProjectsToStorage]);

  const updateCodeProject = useCallback((projectId: string, updates: Partial<Pick<CodeProject, 'name' | 'code'>>) => {
    setSavedCodeProjectsState(prev => {
      const updatedProjects = prev.map(p => 
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      saveCodeProjectsToStorage(updatedProjects);
      return updatedProjects;
    });
  }, [saveCodeProjectsToStorage]);

  const deleteCodeProject = useCallback((projectId: string) => {
    setSavedCodeProjectsState(prev => {
      const updatedProjects = prev.filter(p => p.id !== projectId);
      saveCodeProjectsToStorage(updatedProjects);
      return updatedProjects;
    });
    // If the deleted project was being edited, clear the active editing ID
    if (activeEditingProjectId === projectId) {
        setActiveEditingProjectIdState(null);
    }
  }, [saveCodeProjectsToStorage, activeEditingProjectId]);

  const loadCodeProjectForEditing = useCallback((projectId: string | null) => {
    setActiveEditingProjectIdState(projectId);
  }, []);
  
  const clearActiveEditingProject = useCallback(() => {
    setActiveEditingProjectIdState(null);
  }, []);


  return (
    <AppContext.Provider value={{ 
        theme, 
        toggleTheme, 
        currentView, 
        setCurrentView, 
        apiSettings, 
        addApiKey,
        updateApiKey,
        deleteApiKey,
        setActiveApiKey,
        updateProviderDefaultModel,
        updateProviderEndpoint,
        activeProvider,
        setActiveProvider,
        chatParams,
        updateChatParams,
        kangSantriPreset,
        setKangSantriPreset,
        // Saved Code Projects
        savedCodeProjects,
        addCodeProject,
        updateCodeProject,
        deleteCodeProject,
        activeEditingProjectId,
        loadCodeProjectForEditing,
        clearActiveEditingProject
      }}>
      {children}
    </AppContext.Provider>
  );
};
