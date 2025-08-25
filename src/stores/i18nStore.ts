import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface I18nState {
  namespace: string;
}

interface I18nActions {
  setNamespace: (namespace: string) => void;
}

const useI18nStore = create<I18nState & I18nActions>()(
  persist(
    set => ({
      namespace: 'degreeTrainer', // Default namespace

      setNamespace: namespace => set({ namespace }),
    }),
    {
      name: 'I18nSettings',
    }
  )
);

export default useI18nStore;
