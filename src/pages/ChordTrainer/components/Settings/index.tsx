import React, { useState, useLayoutEffect } from 'react';
import '@styles/scrollbar.css';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import SoundSettings from '@components/Settings/SoundSettings';

interface SettingsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  gameSettingsComponent: React.ReactNode;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, setIsOpen, gameSettingsComponent }) => {
  const { t } = useTranslation('chordGame');
  const [currentTab, setCurrentTab] = useState<string>('game');


  useLayoutEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-full max-w-5xl h-[80vh] rounded-lg bg-bg-main shadow-lg pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="w-full p-4 border-b border-bg-accent bg-bg-common flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('settings.title')}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-bg-accent text-text-secondary"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content Container */}
          <div className="flex flex-1 overflow-hidden">
            {/* Navigation Sidebar */}
            <div className="pt-2 w-48 border-r border-bg-accent bg-bg-common h-full">
              <nav className="p-2 space-y-1">
                <button
                  onClick={() => setCurrentTab('game')}
                  className={`w-full px-3 py-2 text-left rounded-md transition-colors
                    ${currentTab === 'game'
                      ? 'bg-notification-bg text-notification-text'
                      : 'text-text-primary hover:bg-bg-accent'
                    }`}
                >
                  {t('settings.modes.game')}
                </button>
                <button
                  onClick={() => setCurrentTab('sound')}
                  className={`w-full px-3 py-2 text-left rounded-md transition-colors
                    ${currentTab === 'sound'
                      ? 'bg-notification-bg text-notification-text'
                      : 'text-text-primary hover:bg-bg-accent'
                    }`}
                >
                  {t('settings.modes.soundSettings')}
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col pb-6 bg-bg-main">
              <div className="px-6 overflow-y-auto h-full box-border bg-bg-main">
                {currentTab === 'game' ? gameSettingsComponent : (
                  <SoundSettings />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;