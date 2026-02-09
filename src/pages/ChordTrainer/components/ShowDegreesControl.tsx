import React from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';

type ShowDegreesControlProps = {
  value: boolean;
  onChange: (next: boolean) => void;
  className?: string;
};

const ShowDegreesControl: React.FC<ShowDegreesControlProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-bg-accent bg-bg-common px-3 pt-2 pb-2 shadow-sm shrink-0 ${className}`}
    >
      <span className="text-xs font-semibold tracking-wide text-text-secondary whitespace-nowrap uppercase">
        {t('settings.diatonic.showDegrees')}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`${
          value ? 'bg-notification-bg' : 'bg-bg-accent'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notification-bg focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main`}
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          className={`${
            value ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
    </div>
  );
};

export default ShowDegreesControl;
