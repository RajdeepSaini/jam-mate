import { create } from 'zustand';

interface SessionStore {
  activeSessionId: string | null;
  setActiveSession: (sessionId: string | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeSessionId: null,
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
}));