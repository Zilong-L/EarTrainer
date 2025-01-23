import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import HeaderButton from '@components/SharedComponents/HeaderButton';
import Sidebar from '@components/Sidebar';

const trainers = [
  {name:'Degree',path:'/ear-trainer/degree-trainer'},
  {name:'Chord Color',path:'/ear-trainer/chord-color-trainer'},
  {name:'Chord Trainer',path:'/chord-trainer'}
]

const MusicTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation('musicTrainer');
  
  return (
    <div className="flex flex-col h-screen ">
      <Header>
        <HeaderTitle>{t('Ear Trainer')}</HeaderTitle>
        <HeaderButtons>
           
            
            
        </HeaderButtons>
      </Header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 pt-8  overflow-y-auto bg-bg-main ">
          <div className="max-w-6xl mx-auto px-2 ">
            <div className="grid grid-cols-2 mx-2 md:grid-cols-3 gap-3  "> 
              {trainers.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="aspect-[4/3]  sm:aspect-square bg-bg-accent shadow-md hover:shadow-sm rounded-lg flex items-center justify-center group transition-all"
                >
                  <span className="text-2xl text-text-primary group-hover:text-text-secondary transition-colors">
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
