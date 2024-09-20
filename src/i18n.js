// src/i18n.js 或类似文件
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // 默认语言为英语
    ns: ['degreeTrainer','sequenceTrainer','chordTrainer'], // 列出所有命名空间
    defaultNS: 'degreeTrainer', // 设置默认命名空间
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 保持不变
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
    react: {
      useSuspense: false, // 根据需要设置
    },
  });

export default i18n;