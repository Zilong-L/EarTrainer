import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import Sidebar from '@components/Sidebar';

const apps = [{name: 'Chord Trainer', path: '/chord-trainer'}]
const trainers = [
  {name:'Degree',path:'/ear-trainer/degree-trainer'},
  {name:'Sequence',path:'/ear-trainer/sequence-trainer'},
  {name:'Chord Color',path:'/ear-trainer/chord-color-trainer'}
]

const MusicTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation('musicTrainer');
  
  return (
    <div className="flex flex-col h-screen font-jazz">
      <Header>
        <HeaderTitle>{t('Ear Trainer')}</HeaderTitle>
        <HeaderButtons>
            <div className="hidden md:flex space-x-4">
              {apps.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-4 py-2 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t(item.name)}
                </Link>
              ))}
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
        </HeaderButtons>
      </Header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 pt-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-2">
            <div className="grid grid-cols-2 mx-2 md:grid-cols-3 gap-3">
              {trainers.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="aspect-[4/3] sm:aspect-square bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:shadow-slate-700/20 rounded-lg flex items-center justify-center group transition-all"
                >
                  <span className="text-2xl text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {t(item.name)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MusicTrainer;
