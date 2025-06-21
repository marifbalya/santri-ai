
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext, AppView } from '../../contexts/AppContext';
import { APP_NAME } from '../../constants';
import { SunIcon, MoonIcon, MenuIcon, XIcon, ChatIcon, ImageIcon, CodeBracketIcon, PlayCircleIcon, CogIcon, FolderOpenIcon } from '../ui/Icons'; // Added FolderOpenIcon

interface NavItem {
  view: AppView;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { view: AppView.CHAT, label: 'Chat', icon: <ChatIcon className="w-5 h-5 mr-3" /> },
  { view: AppView.CODING, label: 'Coding', icon: <CodeBracketIcon className="w-5 h-5 mr-3" /> },
  { view: AppView.IMAGE, label: 'Gambar', icon: <ImageIcon className="w-5 h-5 mr-3" /> },
  { view: AppView.SAVED_CODES, label: 'Kode Tersimpan', icon: <FolderOpenIcon className="w-5 h-5 mr-3" /> },
  { view: AppView.TUTORIAL, label: 'Tutorial', icon: <PlayCircleIcon className="w-5 h-5 mr-3" /> },
  { view: AppView.SETTINGS, label: 'Pengaturan', icon: <CogIcon className="w-5 h-5 mr-3" /> },
];

const Header: React.FC = () => {
  const { theme, toggleTheme, setCurrentView, currentView } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleNavItemClick = (view: AppView) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-primary dark:bg-bgDarkLighter shadow-md p-3 sm:p-4 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-primary-light">{APP_NAME}</h1>
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-white dark:text-primary-light hover:bg-primary-dark dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark dark:focus:ring-offset-gray-700 focus:ring-white"
          aria-label={theme === 'light' ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'}
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full text-white dark:text-primary-light hover:bg-primary-dark dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark dark:focus:ring-offset-gray-700 focus:ring-white"
            aria-label="Buka menu navigasi"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <XIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-bgDarkLighter rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavItemClick(item.view)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center
                    ${currentView === item.view 
                      ? 'bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light' 
                      : 'text-textLight dark:text-textDark hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;