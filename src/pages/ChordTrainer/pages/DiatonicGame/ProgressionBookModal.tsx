import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { DIATONIC_PROGRESSIONS } from './progressions';
import { useDiatonicProgressionStore } from './diatonicProgressionStore';
import { transposeChordSymbol } from '@utils/ChordTrainer/transposeChordSymbol';

type ProgressionBookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetTonic: string;
};

function ProgressionBookModal({
  isOpen,
  onClose,
  targetTonic,
}: ProgressionBookModalProps) {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  const [query, setQuery] = useState('');

  const progressionId = useDiatonicProgressionStore(s => s.progressionId);
  const setProgressionId = useDiatonicProgressionStore(s => s.setProgressionId);
  const requireSlashBass = useDiatonicProgressionStore(s => s.requireSlashBass);
  const setRequireSlashBass = useDiatonicProgressionStore(
    s => s.setRequireSlashBass
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DIATONIC_PROGRESSIONS;
    return DIATONIC_PROGRESSIONS.filter(p => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.tags?.some(tag => tag.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[92%] max-w-3xl h-[80vh] bg-bg-common rounded-xl shadow-xl overflow-hidden border border-bg-accent">
        <div className="flex items-center gap-3 p-4 border-b border-bg-accent">
          <h2 className="text-xl font-semibold text-text-primary flex-1">
            {t('diatonicBook.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary"
            aria-label={t('diatonicBook.close')}
            title={t('diatonicBook.close')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('diatonicBook.searchPlaceholder')}
              className="flex-1 rounded-lg border border-bg-accent bg-bg-main px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-notification-bg"
            />
            <button
              type="button"
              onClick={() => {
                setProgressionId(null);
                onClose();
              }}
              className="rounded-lg border border-bg-accent bg-bg-main px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-hover"
            >
              {t('diatonicBook.randomMode')}
            </button>
          </div>

          <label className="flex items-center gap-3 text-sm text-text-primary select-none">
            <input
              type="checkbox"
              checked={requireSlashBass}
              onChange={e => setRequireSlashBass(e.target.checked)}
              className="h-4 w-4 accent-notification-bg"
            />
            {t('diatonicBook.requireSlashBass')}
          </label>
        </div>

        <div className="px-4 pb-4 overflow-y-auto h-[calc(80vh-8.5rem)]">
          <div className="space-y-2">
            {filtered.map(p => {
              const isSelected = p.id === progressionId;
              const preview = p.steps
                .slice(0, 8)
                .map(s =>
                  transposeChordSymbol(s.symbol, p.baseTonic, targetTonic)
                )
                .join('  ');

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProgressionId(p.id);
                    onClose();
                  }}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                    isSelected
                      ? 'border-notification-bg bg-notification-bg/10'
                      : 'border-bg-accent bg-bg-main hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary">
                        {p.name}
                        {p.keyMode !== 'any' ? (
                          <span className="ml-2 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            {p.keyMode}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">
                        {preview}
                        {p.steps.length > 8 ? '  …' : ''}
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="text-xs font-semibold text-notification-bg">
                        {t('diatonicBook.selected')}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressionBookModal;
