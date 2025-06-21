
import React, { useState, useContext, useCallback, useEffect } from 'react';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import { EyeIcon, CodeIcon as CodeDisplayIcon, SaveIcon, DownloadIcon, PlusIcon as NewProjectIcon, SparklesIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from '../ui/Icons';
import { AppContext, AppView } from '../../contexts/AppContext';
import { AIProvider, CodeProject, Message } from '../../types';
import { sendMessageToGemini } from '../../services/geminiService';
import { sendMessageToPlaceholder } from '../../services/placeholderService';
import { AVAILABLE_MODELS_TEXT } from '../../constants';

const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proyek Baru</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; background-color: #f0f0f0; text-align: center; }
    .content { padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #333; }
  </style>
</head>
<body>
  <div class="content">
    <h1>Selamat Datang di Coding Playground!</h1>
    <p>Gunakan AI untuk membuat atau memodifikasi kode, lalu simpan proyek Anda.</p>
  </div>
</body>
</html>`;

const CodingView: React.FC = () => {
  const { 
    apiSettings, 
    activeProvider: globalActiveProvider,
    savedCodeProjects,
    activeEditingProjectId,
    loadCodeProjectForEditing,
    addCodeProject,
    updateCodeProject,
    clearActiveEditingProject,
    setCurrentView
  } = useContext(AppContext);
  
  const [projectName, setProjectName] = useState<string>('Proyek Baru');
  const [currentCode, setCurrentCode] = useState<string>(DEFAULT_CODE);
  const [previewSrcDoc, setPreviewSrcDoc] = useState<string>(DEFAULT_CODE);
  
  const [userInputPrompt, setUserInputPrompt] = useState<string>('');
  const [updateInstruction, setUpdateInstruction] = useState<string>('');

  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeUITab, setActiveUITab] = useState<'code' | 'preview'>('code');
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState<boolean>(false); 
  
  const [selectedCodeProvider, setSelectedCodeProvider] = useState<AIProvider>(globalActiveProvider);
  const [currentModelsForCodeProvider, setCurrentModelsForCodeProvider] = useState<Array<{value: string, label: string}>>([]);
  const [selectedCodeModel, setSelectedCodeModel] = useState<string>('');

  useEffect(() => {
    setIsPreviewFullscreen(false); 
    if (activeEditingProjectId) {
      const projectToLoad = savedCodeProjects.find(p => p.id === activeEditingProjectId);
      if (projectToLoad) {
        setProjectName(projectToLoad.name);
        setCurrentCode(projectToLoad.code);
        setPreviewSrcDoc(projectToLoad.code);
        setActiveUITab('code');
      } else {
        clearActiveEditingProject();
        setProjectName('Proyek Baru');
        setCurrentCode(DEFAULT_CODE);
        setPreviewSrcDoc(DEFAULT_CODE);
      }
    } else {
      setProjectName('Proyek Baru');
      setCurrentCode(DEFAULT_CODE);
      setPreviewSrcDoc(DEFAULT_CODE);
    }
  }, [activeEditingProjectId, savedCodeProjects, clearActiveEditingProject]);


  useEffect(() => {
    const providerSettings = apiSettings[selectedCodeProvider];
    const models = AVAILABLE_MODELS_TEXT[selectedCodeProvider] || [];
    setCurrentModelsForCodeProvider(models.map(m => ({ value: m, label: m })));

    if (models.length > 0) {
      const providerDefaultModel = providerSettings?.defaultModel;
      if (providerDefaultModel && models.includes(providerDefaultModel)) {
        setSelectedCodeModel(providerDefaultModel);
      } else {
        setSelectedCodeModel(models[0]);
      }
    } else {
      setSelectedCodeModel('');
    }
  }, [selectedCodeProvider, apiSettings]);

  const cleanAiResponseAsCode = (rawResponse: string): string => {
    let code = rawResponse.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = code.match(fenceRegex);
    if (match && match[2]) {
      code = match[2].trim();
    }
    return code; 
  };
  
  const callAI = async (prompt: string, currentCodeForModification?: string) => {
    if (!selectedCodeModel) {
      setAiError(`Model untuk provider ${selectedCodeProvider} belum dipilih.`);
      return null;
    }
    setIsLoadingAI(true);
    setAiError(null);
    if (!currentCodeForModification) { 
        setCurrentCode('// AI sedang membuat kode, mohon tunggu...');
        setActiveUITab('code');
        setIsPreviewFullscreen(false);
    }

    const currentProviderSettings = apiSettings[selectedCodeProvider];
    const activeApiKeyEntry = currentProviderSettings?.apiKeys.find(k => k.isDefault && k.apiKey);

    if (!activeApiKeyEntry || !activeApiKeyEntry.apiKey) {
      setAiError(`API Key aktif untuk ${selectedCodeProvider} belum diatur.`);
      setIsLoadingAI(false);
      return null;
    }
    const apiKeyToUse = activeApiKeyEntry.apiKey;
    
    let systemInstruction = "";
    let fullPromptForAI = "";

    if (currentCodeForModification) {
        systemInstruction = "Anda adalah asisten AI yang ahli dalam memodifikasi kode frontend (HTML, CSS, JavaScript). Diberikan kode HTML berikut, terapkan perubahan yang diminta oleh pengguna. Hasilkan HANYA blok kode mentah yang sudah diperbarui secara keseluruhan. JANGAN menyertakan teks penjelasan atau format markdown seperti ```html ... ``` atau sejenisnya. Hanya kode.";
        fullPromptForAI = `${systemInstruction}\n\nKODE SAAT INI:\n\`\`\`html\n${currentCodeForModification}\n\`\`\`\n\nINSTRUKSI PENGGUNA: "${prompt}"\n\nKODE YANG DIPERBARUI (HANYA KODE):`;
    } else {
        systemInstruction = "Anda adalah asisten AI yang ahli dalam membuat kode frontend (HTML, CSS, JavaScript). Penting: Hasilkan HANYA blok kode mentah yang diminta. Output harus berupa kode valid yang bisa langsung dirender di browser. JANGAN menyertakan teks penjelasan, salam, atau format markdown seperti ```html ... ``` atau sejenisnya. Hanya kode.";
        fullPromptForAI = `${systemInstruction}\n\nPermintaan Pengguna: Buatkan kode untuk "${prompt}". Pastikan semua CSS dan JavaScript (jika ada) berada dalam satu file HTML, baik inline atau dalam tag <style> dan <script>.`;
    }

    try {
      let rawResponseText = '';
      const aiParams = { system_prompt: systemInstruction, temperature: 0.2, top_p: 0.95, max_tokens: 8000 };
      const emptyHistory: Message[] = [];

      if (selectedCodeProvider === AIProvider.GEMINI) {
        const response = await sendMessageToGemini(fullPromptForAI, emptyHistory, apiKeyToUse, selectedCodeModel, aiParams);
        rawResponseText = response.text;
      } else { 
        rawResponseText = await sendMessageToPlaceholder(fullPromptForAI, emptyHistory, selectedCodeProvider, selectedCodeModel, undefined, currentCodeForModification);
      }
      return cleanAiResponseAsCode(rawResponseText);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal berinteraksi dengan AI.";
      setAiError(message);
      if (!currentCodeForModification) {
        setCurrentCode(`// Gagal menghasilkan kode: ${message}`);
      }
      return null;
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!userInputPrompt.trim()) {
      setAiError("Masukkan deskripsi kode yang ingin Anda buat.");
      return;
    }
    setIsPreviewFullscreen(false); 
    const newCode = await callAI(userInputPrompt);
    if (newCode !== null) {
      setCurrentCode(newCode);
      setPreviewSrcDoc(newCode);
      const suggestedName = userInputPrompt.substring(0, 30).trim() || 'Proyek AI Baru';
      if (!activeEditingProjectId) setProjectName(suggestedName); 
      setUserInputPrompt(''); 
    }
  };
  
  const handleUpdateCodeWithAI = async () => {
    if (!updateInstruction.trim()) {
      setAiError("Masukkan instruksi pembaruan untuk AI.");
      return;
    }
    setIsPreviewFullscreen(false); 
    const updatedCode = await callAI(updateInstruction, currentCode);
    if (updatedCode !== null) {
      setCurrentCode(updatedCode);
      setPreviewSrcDoc(updatedCode);
      setUpdateInstruction(''); 
    }
  };

  const handleTogglePreviewFullscreen = () => {
    setPreviewSrcDoc(currentCode); 
    setActiveUITab('preview'); // Keep this to ensure preview mode is active for normal view if minimized
    setIsPreviewFullscreen(true);
  };
  
  const handleMinimizePreview = () => {
    setIsPreviewFullscreen(false);
  };
  
  const handleSwitchToEditor = () => {
    setActiveUITab('code');
    setIsPreviewFullscreen(false);
  }

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert("Nama proyek tidak boleh kosong.");
      return;
    }
    if (activeEditingProjectId) {
      updateCodeProject(activeEditingProjectId, { name: projectName, code: currentCode });
      alert(`Proyek "${projectName}" berhasil diperbarui.`);
    } else {
      const newId = addCodeProject({ name: projectName, code: currentCode });
      loadCodeProjectForEditing(newId); 
      alert(`Proyek "${projectName}" berhasil disimpan.`);
    }
  };
  
  const handleDownloadCode = () => {
    const blob = new Blob([currentCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'kode_kangsantri'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateNewProject = () => {
    clearActiveEditingProject(); 
    setIsPreviewFullscreen(false);
    setCurrentView(AppView.CODING); 
  };

  const codeProviderOptions = Object.values(AIProvider).map(p => ({
    value: p,
    label: `${p} ${apiSettings[p]?.apiKeys.some(k => k.isDefault && k.apiKey) ? '✅' : '🔑?'}`,
  }));

  return (
    <div className="p-2 sm:p-4 h-full flex flex-col">
      {!isPreviewFullscreen && (
        <>
          {/* Top Controls: Provider, Model, View Toggle */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center flex-shrink min-w-0"> 
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline mr-1">Provider:</span>
                <Select options={codeProviderOptions} value={selectedCodeProvider} onChange={(e) => setSelectedCodeProvider(e.target.value as AIProvider)} wrapperClassName="mb-0 flex-grow min-w-[80px] sm:min-w-[120px]" className="text-xs sm:text-sm py-1.5" title="Pilih Provider AI untuk Kode"/>
            </div>
            {currentModelsForCodeProvider.length > 0 ? (
               <div className="flex items-center flex-shrink min-w-0"> 
                 <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline mr-1">Model:</span>
                 <Select options={currentModelsForCodeProvider} value={selectedCodeModel} onChange={(e) => setSelectedCodeModel(e.target.value)} wrapperClassName="mb-0 flex-grow min-w-[80px] sm:min-w-[120px]" className="text-xs sm:text-sm py-1.5" title="Pilih Model AI untuk Kode"/>
               </div>
            ) : <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 self-center px-2">No Model</div>}
            <Button onClick={handleSwitchToEditor} variant={activeUITab === 'code' ? 'primary' : 'secondary'} size="sm" leftIcon={<CodeDisplayIcon className="w-4 h-4" />} className="flex-shrink-0 px-2 sm:px-3 py-1.5" title="Editor Kode"><span className="hidden sm:inline">Editor</span></Button>
            <Button onClick={handleTogglePreviewFullscreen} variant={activeUITab === 'preview' ? 'primary' : 'secondary'} size="sm" leftIcon={<EyeIcon className="w-4 h-4" />} className="flex-shrink-0 px-2 sm:px-3 py-1.5" title="Live Preview"><span className="hidden sm:inline">Preview</span></Button>
          </div>

          {/* Project Name & Actions */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Input label="Nama Proyek:" value={projectName} onChange={e => setProjectName(e.target.value)} wrapperClassName="mb-0 flex-grow" className="text-sm py-1.5"/>
            <Button onClick={handleSaveProject} size="sm" variant="primary" leftIcon={<SaveIcon className="w-4 h-4"/>} className="flex-shrink-0" title="Simpan Proyek"><span className="hidden sm:inline">Simpan</span></Button>
            <Button onClick={handleDownloadCode} size="sm" variant="secondary" leftIcon={<DownloadIcon className="w-4 h-4"/>} className="flex-shrink-0" title="Unduh Kode (.html)"><span className="hidden sm:inline">Unduh</span></Button>
            <Button onClick={handleCreateNewProject} size="sm" variant="ghost" leftIcon={<NewProjectIcon className="w-4 h-4"/>} className="flex-shrink-0" title="Buat Proyek Baru"><span className="hidden sm:inline">Baru</span></Button>
          </div>
          
          {aiError && <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-md mb-3 whitespace-pre-wrap">{aiError}</p>}
        </>
      )}
      
      {/* Code Editor / Preview Area */}
      <div 
        className={
            isPreviewFullscreen 
            ? 'fixed inset-0 z-[60] bg-bgLight dark:bg-bgDark flex flex-col' 
            : 'flex-grow min-h-[250px] sm:min-h-[350px] mb-3 relative border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden'
        }
      >
        {isPreviewFullscreen ? (
            // Fullscreen Preview
            <> 
                 <iframe 
                    srcDoc={previewSrcDoc} 
                    title="Preview Kode Fullscreen" 
                    sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-forms" 
                    className="w-full flex-grow bg-white" 
                    aria-label="Preview render kode HTML fullscreen"
                 />
                 <Button 
                    onClick={handleMinimizePreview} 
                    size="sm" 
                    variant="primary" 
                    leftIcon={<ArrowsPointingInIcon className="w-4 h-4"/>} 
                    className="absolute top-2 right-2 z-[70] shadow-lg"
                    title="Perkecil Preview"
                >
                    <span className="hidden sm:inline">Perkecil</span>
                </Button>
            </>
        ) : activeUITab === 'code' ? (
          isLoadingAI && currentCode.includes('AI sedang membuat kode') ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800"><Spinner size="lg" /><p className="mt-3 text-gray-600 dark:text-gray-300">AI sedang meracik kode...</p></div>
          ) : (
            <Textarea value={currentCode} onChange={(e) => setCurrentCode(e.target.value)} aria-label="Editor Kode HTML, CSS, JavaScript" className="w-full h-full p-2.5 font-mono text-sm leading-relaxed resize-none bg-white dark:bg-gray-800 text-textLight dark:text-textDark focus:ring-0 focus:border-transparent border-0" wrapperClassName="w-full h-full m-0 p-0" spellCheck="false"/>
          )
        ) : ( // Normal Preview
          isLoadingAI && previewSrcDoc.includes('AI sedang membuat kode') ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-800"><Spinner size="lg" /><p className="mt-3 text-gray-600 dark:text-gray-300">Memuat preview kode AI...</p></div>
          ) : (
            <iframe srcDoc={previewSrcDoc} title="Preview Kode" sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-forms" className="w-full h-full bg-white" aria-label="Preview render kode HTML"/>
          )
        )}
      </div>
      
      {/* AI Interaction Area (Hidden in fullscreen preview) */}
      {!isPreviewFullscreen && (
        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Initial Prompt for New Code */}
          <div className="flex items-end gap-2">
            <Textarea value={userInputPrompt} onChange={(e) => setUserInputPrompt(e.target.value)} placeholder="Buat kode baru: (Contoh: tabel responsif dengan 3 kolom)" rows={1} className="flex-grow p-2.5 text-sm max-h-24" wrapperClassName="flex-grow mb-0" aria-label="Input deskripsi untuk kode baru"/>
            <Button onClick={handleGenerateNewCode} isLoading={isLoadingAI && userInputPrompt !== ''} disabled={isLoadingAI || !userInputPrompt.trim() || !selectedCodeModel} size="md" className="h-[46px] self-end" leftIcon={<SparklesIcon className="w-4 h-4"/>} title="Generate Kode Baru dengan AI"><span className="hidden sm:inline">Generate</span><span className="sm:hidden">Go</span></Button>
          </div>
          {/* Instruction to Update Existing Code */}
          <div className="flex items-end gap-2">
            <Textarea value={updateInstruction} onChange={(e) => setUpdateInstruction(e.target.value)} placeholder="Update kode di atas: (Contoh: ubah warna background jadi biru)" rows={1} className="flex-grow p-2.5 text-sm max-h-24" wrapperClassName="flex-grow mb-0" aria-label="Input instruksi untuk update kode"/>
            <Button onClick={handleUpdateCodeWithAI} isLoading={isLoadingAI && updateInstruction !== ''} disabled={isLoadingAI || !updateInstruction.trim() || !currentCode.trim() || !selectedCodeModel} size="md" className="h-[46px] self-end" leftIcon={<SparklesIcon className="w-4 h-4"/>} title="Update Kode Saat Ini dengan AI"><span className="hidden sm:inline">Update</span><span className="sm:hidden">Upd</span></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingView;
