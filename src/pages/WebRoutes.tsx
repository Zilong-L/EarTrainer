import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import TrainingShell, {
  TrainingError,
} from '../features/training/TrainingShell';

const ChordTrainer = lazy(() => import('./ChordTrainer'));
const TrainingHome = lazy(() => import('../features/training/TrainingHome'));
const LearnPage = lazy(() => import('../features/training/LearnPage'));
const LessonExplainer = lazy(
  () => import('../features/training/LessonExplainer')
);
const PracticeLibrary = lazy(
  () => import('../features/training/PracticeLibrary')
);
const ProgressPage = lazy(() => import('../features/training/ProgressPage'));
const GuidedPractice = lazy(
  () => import('../features/practice/GuidedPractice')
);
const DegreeTrainer = lazy(
  () => import('@EarTrainers/DegreeTrainer/DegreeTrainer')
);
const ChordColorTrainer = lazy(
  () => import('@EarTrainers/ChordColorTrainer/ChordColorTrainer')
);
const DegreeTrainerSettingsProvider = lazy(() =>
  import('@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings').then(
    module => ({ default: module.DegreeTrainerSettingsProvider })
  )
);

function LoadingScreen() {
  return (
    <div className="trainer-loading" role="status">
      <span className="trainer-loading-dot" aria-hidden="true" />
      <p>Getting ready · 正在准备</p>
    </div>
  );
}

function RouteContent() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  useEffect(() => {
    document.body.classList.add('light');
    try {
      const saved = JSON.parse(localStorage.getItem('language') ?? 'null');
      if (saved === 'en' || saved === 'zh') void i18n.changeLanguage(saved);
    } catch {
      // Preserve the detected language if storage is invalid or unavailable.
    }
  }, [i18n]);
  useEffect(() => {
    const zh = i18n.language.startsWith('zh');
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    const titles = {
      '/ear-trainer/degree-trainer': zh ? '音级自由练习' : 'Scale-degree lab',
      '/ear-trainer/chord-color-trainer': zh
        ? '和弦听觉实验室'
        : 'Chord listening lab',
    };
    const title = pathname.startsWith('/chord-trainer')
      ? zh
        ? '键盘和弦练习'
        : 'Keyboard chord lab'
      : titles[pathname as keyof typeof titles];
    if (title) document.title = `${title} · Ear Trainer`;
  }, [pathname, i18n.language]);
  return (
    <TrainingError>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<TrainingShell />}>
            <Route path="/" element={<TrainingHome />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:lessonId" element={<LessonExplainer />} />
            <Route path="/practice" element={<PracticeLibrary />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/practice/:lessonId" element={<GuidedPractice />} />
          </Route>
          <Route path="/ear-trainer" element={<Navigate to="/" replace />} />
          <Route
            path="/chord-trainer/*"
            element={
              <DegreeTrainerSettingsProvider>
                <ChordTrainer />
              </DegreeTrainerSettingsProvider>
            }
          />
          <Route
            path="/ear-trainer/degree-trainer"
            element={
              <DegreeTrainerSettingsProvider>
                <DegreeTrainer />
              </DegreeTrainerSettingsProvider>
            }
          />
          <Route
            path="/ear-trainer/chord-color-trainer"
            element={<ChordColorTrainer />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </TrainingError>
  );
}

export default function WebRoutes() {
  return (
    <Router>
      <RouteContent />
    </Router>
  );
}
