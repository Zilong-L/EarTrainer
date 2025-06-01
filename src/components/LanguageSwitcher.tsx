import { useTranslation } from 'react-i18next';
import HeaderListButton from '@components/HeaderListButton';
import { LanguageIcon } from '@heroicons/react/24/solid';

interface LanguageOption {
  label: string;
  onClick: () => void;
}

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    console.log("切换前的当前语言:", i18n.language);
    i18n
      .changeLanguage(lng)
      .then(() => {
        console.log("切换后的当前语言:", i18n.language);
      })
      .catch((err) => {
        console.error("语言切换失败:", err);
      });
  };

  const languageOptions: LanguageOption[] = [
    { label: '中文', onClick: () => changeLanguage('zh') },
    { label: 'English', onClick: () => changeLanguage('en') },
  ];

  return (
    <HeaderListButton
      buttonLabel={<LanguageIcon className='w-6 h-6' />} // You can customize the button label as needed
      items={languageOptions}
    />
  );
};

export default LanguageSwitcher;
