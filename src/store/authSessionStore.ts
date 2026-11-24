import { create } from "zustand";

type AuthSessionState = {
  userId: string | null;
  setupComplete: boolean;
  startSession: (userId: string, setupComplete?: boolean) => void;
  completeSetup: () => void;
  endSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  // Every fresh application launch starts without an active session.
  userId: null,

  // Until Phase 5 checks the user's Firestore settings, setup is required.
  setupComplete: false,

  startSession: (userId, setupComplete = false) =>
    set({
      userId,
      setupComplete,
    }),

  completeSetup: () => set({ setupComplete: true }),

  endSession: () =>
    set({
      userId: null,
      setupComplete: false,
    }),
}));
