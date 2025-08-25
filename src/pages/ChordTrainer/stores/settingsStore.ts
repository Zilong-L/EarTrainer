import { create } from 'zustand';

interface SettingsModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

const useSettingsModalStore = create<SettingsModalStore>(set => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  setIsOpen: (isOpen: boolean) => set({ isOpen: isOpen }),
}));

export default useSettingsModalStore;
