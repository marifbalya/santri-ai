
import React, { useContext } from 'react';
import Header from './components/Layout/Header';
// import BottomNav from './components/Layout/BottomNav'; // Removed
import ChatView from './components/Chat/ChatView';
import ImageGenView from './components/ImageGen/ImageGenView';
import CodingView from './components/Coding/CodingView';
import TutorialView from './components/Tutorial/TutorialView';
import SettingsView from './components/Settings/SettingsView';
import SavedCodesView from './components/SavedCodes/SavedCodesView'; // New Import
import { AppContext, AppView } from './contexts/AppContext';

const App: React.FC = () => {
  const { currentView, theme } = useContext(AppContext);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderView = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatView />;
      case AppView.IMAGE:
        return <ImageGenView />;
      case AppView.CODING:
        return <CodingView />;
      case AppView.TUTORIAL:
        return <TutorialView />;
      case AppView.SAVED_CODES: // New Case
        return <SavedCodesView />;
      case AppView.SETTINGS:
        return <SettingsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark">
      <Header />
      <main className="flex-grow overflow-y-auto"> {/* Removed pb-16 md:pb-0 */}
        {renderView()}
      </main>
      {/* <BottomNav /> Removed */}
    </div>
  );
};

export default App;