import React from 'react';
import { useTranslation } from 'react-i18next';

function FreeSettings({FreeTrainerSettings}) {
  const { customNotes, handleDegreeToggle } = FreeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary ">
        {t('settings.SelectDegrees')}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {customNotes.map((note, index) => (
          <div
            key={note.name}
            onClick={() => handleDegreeToggle(index)}
            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-bg-main  rounded"
          >
            <input
              type="checkbox"
              checked={note.enable}
              onChange={() => {}}
              className="rounded "
            />
            <span className="text-text-secondary ">{note.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FreeSettings;
