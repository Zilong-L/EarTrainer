import React, { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

function ChallengeSettings({ChallengeTrainerSettings}) {
  const { userProgress, currentLevel, updateLevel, resetUserProgress } = ChallengeTrainerSettings;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all challenge progress? This cannot be undone.')) {
      resetUserProgress();
      toast.success('Challenge progress reset!');
      setIsConfirmOpen(false);
    }
  };
  console.log('ChallengeSettings:', ChallengeTrainerSettings);
  return (
    <div className="space-y-2">
      {userProgress.map((levelData, index) => (
        <button
          key={levelData.level}
          onClick={() => updateLevel(index)}
          disabled={!levelData.unlocked}
          className={`w-full flex justify-between items-center p-3 rounded-lg ${
            levelData.unlocked
              ? levelData.level === currentLevel?.level
                ? 'bg-cyan-800 text-white' // Selected level
                : 'bg-cyan-700 text-white hover:bg-cyan-800' // Unlocked but not selected
              : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed' // Locked
          }`}
        >
          <span className="font-medium">
            Level {levelData.level}: {levelData.notes}
          </span>
          {levelData.unlocked ? (
            <span>
              {levelData.stars >= 1 ? '⭐' : ''}
              {levelData.stars >= 2 ? '⭐' : ''}
              {levelData.stars >= 3 ? '⭐' : ''}
            </span>
          ) : (
            <LockClosedIcon className="h-5 w-5" />
          )}
        </button>
      ))}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset Challenge Progress
        </button>
      </div>
    </div>
  );
}

export default ChallengeSettings;
