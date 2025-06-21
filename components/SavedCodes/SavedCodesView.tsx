
import React, { useContext, useState, useRef } from 'react';
import { AppContext, AppView } from '../../contexts/AppContext';
import { CodeProject } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import { FolderOpenIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, DownloadIcon, UploadIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, XIcon } from '../ui/Icons';

const SavedCodesView: React.FC = () => {
  const { 
    savedCodeProjects, 
    setCurrentView, 
    loadCodeProjectForEditing, 
    deleteCodeProject,
    addCodeProject 
  } = useContext(AppContext);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'text'>('file');
  const [importText, setImportText] = useState('');
  const [importProjectName, setImportProjectName] = useState('Proyek Impor Baru');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [previewProjectName, setPreviewProjectName] = useState('');
  const [isModalPreviewFullscreen, setIsModalPreviewFullscreen] = useState(false); // New state for modal fullscreen


  const handleEditProject = (projectId: string) => {
    loadCodeProjectForEditing(projectId);
    setCurrentView(AppView.CODING);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus proyek "${projectName}"? Tindakan ini tidak dapat diurungkan.`)) {
      deleteCodeProject(projectId);
    }
  };
  
  const handleDownloadProject = (project: CodeProject) => {
    const blob = new Blob([project.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'kode_tersimpan'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenPreviewModal = (project: CodeProject) => {
    setPreviewCode(project.code);
    setPreviewProjectName(project.name);
    setIsModalPreviewFullscreen(false); // Reset fullscreen state when opening
    setIsPreviewModalOpen(true);
  };
  
  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setIsModalPreviewFullscreen(false); // Ensure reset on close
  }

  const handleOpenImportModal = (method: 'file' | 'text') => {
    setImportMethod(method);
    setImportText('');
    setImportProjectName('Proyek Impor Baru');
    setIsImportModalOpen(true);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/html') {
        alert("Hanya file .html yang didukung.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setImportText(fileContent);
        const fileNameWithoutExtension = file.name.replace(/\.html$/i, '');
        setImportProjectName(fileNameWithoutExtension || 'Proyek Impor dari File');
      };
      reader.readAsText(file);
    }
  };

  const handleSaveImportedCode = () => {
    if (!importProjectName.trim()) {
      alert("Nama proyek tidak boleh kosong.");
      return;
    }
    if (!importText.trim() && importMethod === 'text') {
        alert("Kode untuk diimpor tidak boleh kosong.");
        return;
    }
     if (!importText.trim() && importMethod === 'file' && !fileInputRef.current?.files?.length) {
        alert("Silakan pilih file HTML untuk diimpor.");
        return;
    }

    addCodeProject({ name: importProjectName, code: importText });
    alert(`Proyek "${importProjectName}" berhasil diimpor.`);
    setIsImportModalOpen(false);
    setImportText(''); 
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };
  
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-semibold text-textLight dark:text-textDark flex items-center">
          <FolderOpenIcon className="w-7 h-7 mr-2 text-primary dark:text-primary-light" />
          Kode Tersimpan
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleOpenImportModal('file')} variant="secondary" size="sm" leftIcon={<UploadIcon className="w-4 h-4"/>}>Impor File</Button>
          <Button onClick={() => handleOpenImportModal('text')} variant="secondary" size="sm" leftIcon={<PlusIcon className="w-4 h-4"/>}>Impor Teks</Button>
          <Button 
            onClick={() => { loadCodeProjectForEditing(null); setCurrentView(AppView.CODING); }} 
            variant="primary" 
            size="sm" 
            leftIcon={<PlusIcon className="w-4 h-4"/>}
          >
            Buat Proyek Baru
          </Button>
        </div>
      </div>

      {savedCodeProjects.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <FolderOpenIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Belum ada proyek kode yang tersimpan.</p>
          <p>Mulai buat proyek baru atau impor kode yang sudah ada!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCodeProjects.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((project) => (
            <div key={project.id} className="bg-white dark:bg-bgDarkLighter p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary dark:text-primary-light truncate mb-1" title={project.name}>{project.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                  Terakhir diubah: {formatDate(project.updatedAt)}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded max-h-20 overflow-hidden mb-3">
                  <pre className="whitespace-pre-wrap break-all"><code>{project.code.substring(0, 100)}{project.code.length > 100 ? '...' : ''}</code></pre>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                <Button onClick={() => handleEditProject(project.id)} size="sm" variant="primary" leftIcon={<PencilIcon className="w-3.5 h-3.5"/>}>Edit</Button>
                <Button onClick={() => handleOpenPreviewModal(project)} size="sm" variant="secondary" leftIcon={<EyeIcon className="w-3.5 h-3.5"/>}>Preview</Button>
                <Button onClick={() => handleDownloadProject(project)} size="sm" variant="ghost" leftIcon={<DownloadIcon className="w-3.5 h-3.5"/>}>Unduh</Button>
                <Button onClick={() => handleDeleteProject(project.id, project.name)} size="sm" variant="danger" leftIcon={<TrashIcon className="w-3.5 h-3.5"/>}>Hapus</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title={`Impor Proyek Kode via ${importMethod === 'file' ? 'File' : 'Teks'}`}>
        <div className="space-y-4">
          <Input 
            label="Nama Proyek"
            value={importProjectName}
            onChange={(e) => setImportProjectName(e.target.value)}
            placeholder="Masukkan nama untuk proyek ini"
          />
          {importMethod === 'file' ? (
            <div>
              <label htmlFor="htmlFileInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih File .html</label>
              <input 
                id="htmlFileInput"
                type="file" 
                ref={fileInputRef}
                accept=".html" 
                onChange={handleFileImport} 
                className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-primary-light/10 dark:file:text-primary-light hover:file:bg-primary/20"
              />
            </div>
          ) : (
            <Textarea
              label="Tempel Kode HTML di Sini"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              placeholder="<!DOCTYPE html>..."
              className="font-mono text-xs"
            />
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>Batal</Button>
          <Button onClick={handleSaveImportedCode}>Impor & Simpan Proyek</Button>
        </div>
      </Modal>

      {/* Preview Modal - Modified for Fullscreen Capability */}
      {isPreviewModalOpen && (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm 
                        ${isModalPreviewFullscreen ? 'p-0' : 'p-4'}`}
            onClick={(e) => { if (e.target === e.currentTarget && !isModalPreviewFullscreen) closePreviewModal();}} // Close on overlay click only if not fullscreen
        >
          <div className={`bg-bgLight dark:bg-bgDarkLighter rounded-lg shadow-xl 
                           ${isModalPreviewFullscreen ? 'w-full h-full max-w-full max-h-full rounded-none' : 'w-full max-w-2xl max-h-[90vh]'} 
                           flex flex-col`}>
            
            {!isModalPreviewFullscreen && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-textLight dark:text-textDark truncate" title={previewProjectName}>Preview: {previewProjectName}</h3>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsModalPreviewFullscreen(true)} 
                        className="p-1.5"
                        title="Tampilan Penuh"
                    >
                        <ArrowsPointingOutIcon className="w-5 h-5"/>
                    </Button>
                    <button
                        onClick={closePreviewModal}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
                        aria-label="Tutup modal"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            )}

            <div className={` ${isModalPreviewFullscreen ? 'w-full h-full' : 'p-4 overflow-y-auto h-[calc(90vh-120px)] sm:h-auto sm:min-h-[50vh]'}`}> {/* Adjust height for content area */}
              <iframe
                  srcDoc={previewCode}
                  title={`Preview ${previewProjectName}`}
                  sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-forms"
                  className="w-full h-full bg-white border border-gray-300 dark:border-gray-700 rounded"
              />
            </div>
            
            {isModalPreviewFullscreen && (
                 <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setIsModalPreviewFullscreen(false)} 
                    className="absolute top-3 right-3 z-[70] shadow-lg p-1.5"
                    title="Perkecil Preview"
                >
                    <ArrowsPointingInIcon className="w-5 h-5"/>
                </Button>
            )}

            {!isModalPreviewFullscreen && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button variant="secondary" onClick={closePreviewModal}>Tutup Preview</Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default SavedCodesView;
