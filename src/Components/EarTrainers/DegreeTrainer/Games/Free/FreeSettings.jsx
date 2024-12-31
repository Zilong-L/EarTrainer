import React from 'react';
import { useTranslation } from 'react-i18next';

function FreeSettings({FreeTrainerSettings}) {
  const { customNotes, handleDegreeToggle } = FreeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {t('settings.SelectDegrees')}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {customNotes.map((note, index) => (
          <div
            key={note.name}
            onClick={() => handleDegreeToggle(index)}
            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <input
              type="checkbox"
              checked={note.enable}
              onChange={() => {}}
              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-slate-700 dark:text-slate-300">{note.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FreeSettings;
