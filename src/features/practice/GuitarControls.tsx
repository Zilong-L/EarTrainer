import type { GuitarSettings } from './guitarPractice';

export default function GuitarControls({
  settings,
  onChange,
  zh,
  practice = false,
}: {
  settings: GuitarSettings;
  onChange: (settings: GuitarSettings) => void;
  zh: boolean;
  practice?: boolean;
}) {
  return (
    <div className="guitar-controls">
      <label>
        <span>{zh ? '吉他音色' : 'Guitar sound'}</span>
        <select
          value={settings.instrument}
          onChange={event =>
            onChange({
              ...settings,
              instrument: event.currentTarget
                .value as GuitarSettings['instrument'],
            })
          }
        >
          <option value="guitar-nylon">
            {zh ? '尼龙弦' : 'Nylon strings'}
          </option>
          <option value="guitar-acoustic">
            {zh ? '钢弦木吉他' : 'Steel strings'}
          </option>
        </select>
      </label>
      <label>
        <span>{zh ? '下扫速度' : 'Downstroke'}</span>
        <select
          value={settings.speed}
          onChange={event =>
            onChange({
              ...settings,
              speed: event.currentTarget.value as GuitarSettings['speed'],
            })
          }
        >
          <option value="fast">{zh ? '快速扫过' : 'Quick sweep'}</option>
          <option value="slow">{zh ? '缓慢扫过' : 'Slow sweep'}</option>
        </select>
      </label>
      {practice && (
        <label>
          <span>{zh ? '指型范围' : 'Voicings'}</span>
          <select
            value={settings.voicing}
            onChange={event =>
              onChange({
                ...settings,
                voicing: event.currentTarget.value as GuitarSettings['voicing'],
              })
            }
          >
            <option value="varied">
              {zh ? '开放 / 横按 / 高把位' : 'Open / barre / upper'}
            </option>
            <option value="open">
              {zh ? '先练开放和弦' : 'Open shapes first'}
            </option>
          </select>
        </label>
      )}
      <p>
        {zh
          ? '采样模拟扫弦 · 按实际弦序发声，保持准确音高'
          : 'Sample-based strum simulation · actual string order, stable pitch'}
        {' · '}
        <a href="/samples/ATTRIBUTION.txt" target="_blank" rel="noreferrer">
          {zh ? '音源署名' : 'Sound credits'}
        </a>
      </p>
    </div>
  );
}
