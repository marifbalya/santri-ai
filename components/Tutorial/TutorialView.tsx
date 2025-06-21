import React, { useState } from 'react';
import Button from '../ui/Button';
import { PlayCircleIcon } from '../ui/Icons';

interface TutorialVideo {
  id: string;
  title: string;
  videoId: string;
  description: string;
}

const tutorialVideos: TutorialVideo[] = [
  { 
    id: 'intro', 
    title: 'Perkenalan Aplikasi KangSantri AI', 
    videoId: 'J0pdzfmzo4g', 
    description: 'Video pengenalan singkat mengenai fitur dan kegunaan aplikasi KangSantri AI.' 
  },
  { 
    id: 'apiKey', 
    title: 'Cara Buat API Key Gratis', 
    videoId: 'VIDEO_API_KEY_PLACEHOLDER', // Placeholder ID
    description: 'Tutorial langkah demi langkah untuk mendapatkan API key gratis dari berbagai provider AI.' 
  },
  { 
    id: 'setupAI', 
    title: 'Cara Setting AI di KangSantri AI', 
    videoId: 'VIDEO_SETTING_AI_PLACEHOLDER', // Placeholder ID
    description: 'Panduan lengkap cara memasukkan API key dan mengatur berbagai model AI di dalam aplikasi KangSantri AI.' 
  },
];

const TutorialView: React.FC = () => {
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>(tutorialVideos[0].id);

  const selectedTutorial = tutorialVideos.find(v => v.id === selectedTutorialId) || tutorialVideos[0];
  const isPlaceholderVideo = selectedTutorial.videoId.startsWith('VIDEO_');

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold text-textLight dark:text-textDark flex items-center">
          <PlayCircleIcon className="w-7 h-7 mr-2 text-primary dark:text-primary-light" />
          Tutorial Penggunaan
        </h2>
        <div className="flex flex-wrap gap-2">
          {tutorialVideos.map((video) => (
            <Button
              key={video.id}
              onClick={() => setSelectedTutorialId(video.id)}
              variant={selectedTutorialId === video.id ? 'primary' : 'secondary'}
              size="sm"
            >
              {video.title}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-bgDarkLighter shadow">
        <h3 className="text-xl font-semibold text-primary dark:text-primary-light mb-2">{selectedTutorial.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedTutorial.description}</p>
        
        {isPlaceholderVideo ? (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center rounded-lg text-center p-6">
            <PlayCircleIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3" />
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200">Video Segera Hadir</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tutorial untuk bagian ini sedang dalam persiapan. Terima kasih atas kesabaran Anda!</p>
          </div>
        ) : (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedTutorial.videoId}?autoplay=0&rel=0`} // Autoplay set to 0 for better UX
              title={selectedTutorial.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg shadow-xl"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialView;