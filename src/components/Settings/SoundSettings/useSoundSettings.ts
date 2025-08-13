import { useSoundSettingsStore } from '@stores/soundSettingsStore';

export type UseSoundSettingsReturn = ReturnType<typeof useSoundSettingsStore> & {
  clamps: {
    dronePan: { min: number; max: number };
    droneFilter: { min: number; max: number };
  };
};

const useSoundSettings = (): UseSoundSettingsReturn => {
  const store = useSoundSettingsStore();

  const clamps = {
    dronePan: { min: -1, max: 1 },
    droneFilter: { min: 20, max: 2000 },
  } as const;

  return {
    ...store,
    clamps,
  } as UseSoundSettingsReturn;
};

export default useSoundSettings;
