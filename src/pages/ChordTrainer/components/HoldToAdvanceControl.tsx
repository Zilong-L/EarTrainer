import React from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { useAdvanceSettingsStore } from '@ChordTrainer/stores/advanceSettingsStore';
import './practiceUi.css';

const MIN_MS = 0;
const MAX_MS = 3000;
const STEP_MS = 100;

const formatSeconds = (ms: number) => (ms / 1000).toFixed(1);

const HoldToAdvanceControl: React.FC = () => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);

  const holdToAdvanceMs = useAdvanceSettingsStore(s => s.holdToAdvanceMs);
  const setHoldToAdvanceMs = useAdvanceSettingsStore(s => s.setHoldToAdvanceMs);
  const pct = ((holdToAdvanceMs - MIN_MS) / Math.max(1, MAX_MS - MIN_MS)) * 100;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-bg-accent bg-bg-common px-3 pt-2 pb-2 mb-4 shadow-sm shrink-0">
      <span className="text-xs font-semibold tracking-wide text-text-secondary whitespace-nowrap uppercase">
        {t('settings.holdToAdvance.label')}
      </span>
      <input
        type="range"
        min={MIN_MS}
        max={MAX_MS}
        step={STEP_MS}
        value={holdToAdvanceMs}
        onChange={e => setHoldToAdvanceMs(Number(e.target.value))}
        className="ct-holdRange w-36 sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notification-bg focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main"
        style={
          {
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            // Used by WebKit to render a filled track.
            '--ct-pct': `${pct}%`,
          } as React.CSSProperties
        }
        aria-label={t('settings.holdToAdvance.label')}
      />
      <span className="w-24 text-center rounded-lg border border-bg-accent bg-bg-main px-2 py-1 text-sm tabular-nums text-text-primary whitespace-nowrap">
        {holdToAdvanceMs === 0
          ? t('settings.holdToAdvance.instant')
          : `${formatSeconds(holdToAdvanceMs)}${t('settings.holdToAdvance.unit')}`}
      </span>
    </div>
  );
};

export default HoldToAdvanceControl;
