import { create } from 'zustand'

interface AppStateStore {
    isChatOpen: boolean; 
    isChatDetailOpen: boolean; 
    setIsChatOpen: (isOpen: boolean) => void;
    setIsChatDetailOpen: (isOpen: boolean) => void;
}

export const useAppStateStore = create<AppStateStore>((set) => ({
    isChatOpen: false,
    isChatDetailOpen: false,
    setIsChatOpen: (isOpen: boolean) => set({ isChatOpen: isOpen }),
    setIsChatDetailOpen: (isOpen: boolean) => set({ isChatDetailOpen: isOpen })
}))