import { create } from "zustand";

type AuthSessionState = {
  userId: string | null;
  startSession: (userId: string) => void;
  endSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  // A new application process always starts without an active session.
  userId: null,

  startSession: (userId) => set({ userId }),

  endSession: () => set({ userId: null }),
}));
