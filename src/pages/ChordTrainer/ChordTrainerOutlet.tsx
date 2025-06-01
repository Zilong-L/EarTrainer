import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import { Cog6ToothIcon, BookOpenIcon } from '@heroicons/react/24/solid';


import Header from '@components/Header';
import HeaderTitle from '@components/HeaderTitle';
import HeaderButtons from '@components/HeaderButtons';
import HeaderButton from '@components/HeaderButton';
import useSettingsStore from './stores/settingsStore';
import { GAMES } from './utils/routes/constants';
function ChordTrainerOutlet() {
    const { t, i18n } = useTranslation('chordGame');
    const { openModal } = useSettingsStore();
    return (<div className="flex flex-col h-[100vh]">
        <Header>
            <HeaderTitle>
                <Link to="/ear-trainer" className="text-inherit no-underline">
                    {t('trainer.title')}
                </Link>
            </HeaderTitle>
            <HeaderButtons>
                <HeaderButton onClick={openModal}>
                    <Cog6ToothIcon className="h-6 w-6" />
                </HeaderButton>
                <HeaderButton>
                    <a
                        href={`https://docs.musictrainer.barnman.cc/#/${i18n.language}/${i18n.language === 'zh' ? '键盘训练/主要功能' : 'keyboard-training/main-features'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-inherit no-underline block"
                        title={t('buttons.help')}
                    >
                        <BookOpenIcon className="h-6 w-6" />
                    </a>
                </HeaderButton>
                {GAMES.map((game) => (
                    <Link
                        key={game}
                        to={`${game}`}
                        className={`p-2 rounded-md hover:cursor-pointer  text-text-secondary hover:shadow-md `}

                    >
                        {t(`buttons.${game}`)}
                    </Link>
                ))}
            </HeaderButtons>
        </Header>
        <div className="flex-1 pt-20 overflow-y-auto bg-bg-main">
            <Outlet />
        </div>

    </div>)
}

export default ChordTrainerOutlet;