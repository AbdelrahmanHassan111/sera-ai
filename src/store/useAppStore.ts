/**
 * Global App Store using Zustand
 * 
 * Manages all application state with persistence to localStorage/IndexedDB via localforage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type {
  AppState,
  GeneticMarker,
  Recommendation,
  LifestylePlanItem,
  UserProfile,
  ChatMessage,
  AppSettings,
} from '@/types/domain';

// Configure localforage
localforage.config({
  name: 'SERA-AI',
  storeName: 'sera_storage',
  description: 'SERA AI local storage for genetic data and recommendations',
});

interface AppStore extends AppState {
  // User Profile Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Genetic Markers Actions
  addGeneticMarker: (marker: GeneticMarker) => void;
  addGeneticMarkers: (markers: GeneticMarker[]) => void;
  updateGeneticMarker: (rsid: string, updates: Partial<GeneticMarker>) => void;
  removeGeneticMarker: (rsid: string) => void;
  clearGeneticMarkers: () => void;
  
  // Recommendations Actions
  addRecommendation: (rec: Recommendation) => void;
  addRecommendations: (recs: Recommendation[]) => void;
  updateRecommendation: (id: string, updates: Partial<Recommendation>) => void;
  removeRecommendation: (id: string) => void;
  acceptRecommendation: (id: string) => void;
  declineRecommendation: (id: string) => void;
  clearRecommendations: () => void;
  
  // Lifestyle Plan Actions
  addLifestylePlanItem: (item: LifestylePlanItem) => void;
  addLifestylePlanItems: (items: LifestylePlanItem[]) => void;
  updateLifestylePlanItem: (id: string, updates: Partial<LifestylePlanItem>) => void;
  toggleLifestylePlanItem: (id: string) => void;
  removeLifestylePlanItem: (id: string) => void;
  clearLifestylePlan: () => void;
  
  // Chat Actions
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setGeminiApiKey: (key: string, persist: boolean) => void;
  clearGeminiApiKey: () => void;
  
  // App State Actions
  setConsentGiven: (given: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  
  // Data Management
  exportData: () => AppState;
  importData: (data: Partial<AppState>) => void;
  clearAllData: () => void;
}

const initialState: AppState = {
  userProfile: {},
  geneticMarkers: [],
  recommendations: [],
  lifestylePlan: [],
  settings: {
    persistApiKey: false,
  },
  consentGiven: false,
  onboardingCompleted: false,
  chatHistory: [],
  lastUpdated: Date.now(),
  dataVersion: '1.0.0',
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User Profile
      updateUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
          lastUpdated: Date.now(),
        })),

      // Genetic Markers
      addGeneticMarker: (marker) =>
        set((state) => {
          const exists = state.geneticMarkers.some((m) => m.rsid === marker.rsid);
          if (exists) {
            return {
              geneticMarkers: state.geneticMarkers.map((m) =>
                m.rsid === marker.rsid ? marker : m
              ),
              lastUpdated: Date.now(),
            };
          }
          return {
            geneticMarkers: [...state.geneticMarkers, marker],
            lastUpdated: Date.now(),
          };
        }),

      addGeneticMarkers: (markers) =>
        set((state) => {
          const markerMap = new Map(state.geneticMarkers.map((m) => [m.rsid, m]));
          markers.forEach((marker) => markerMap.set(marker.rsid, marker));
          return {
            geneticMarkers: Array.from(markerMap.values()),
            lastUpdated: Date.now(),
          };
        }),

      updateGeneticMarker: (rsid, updates) =>
        set((state) => ({
          geneticMarkers: state.geneticMarkers.map((m) =>
            m.rsid === rsid ? { ...m, ...updates } : m
          ),
          lastUpdated: Date.now(),
        })),

      removeGeneticMarker: (rsid) =>
        set((state) => ({
          geneticMarkers: state.geneticMarkers.filter((m) => m.rsid !== rsid),
          lastUpdated: Date.now(),
        })),

      clearGeneticMarkers: () =>
        set({
          geneticMarkers: [],
          lastUpdated: Date.now(),
        }),

      // Recommendations
      addRecommendation: (rec) =>
        set((state) => ({
          recommendations: [...state.recommendations, rec],
          lastUpdated: Date.now(),
        })),

      addRecommendations: (recs) =>
        set((state) => ({
          recommendations: [...state.recommendations, ...recs],
          lastUpdated: Date.now(),
        })),

      updateRecommendation: (id, updates) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
          lastUpdated: Date.now(),
        })),

      removeRecommendation: (id) =>
        set((state) => ({
          recommendations: state.recommendations.filter((r) => r.id !== id),
          lastUpdated: Date.now(),
        })),

      acceptRecommendation: (id) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'accepted' as const } : r
          ),
          lastUpdated: Date.now(),
        })),

      declineRecommendation: (id) =>
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'declined' as const } : r
          ),
          lastUpdated: Date.now(),
        })),

      clearRecommendations: () =>
        set({
          recommendations: [],
          lastUpdated: Date.now(),
        }),

      // Lifestyle Plan
      addLifestylePlanItem: (item) =>
        set((state) => ({
          lifestylePlan: [...state.lifestylePlan, item],
          lastUpdated: Date.now(),
        })),

      addLifestylePlanItems: (items) =>
        set((state) => ({
          lifestylePlan: [...state.lifestylePlan, ...items],
          lastUpdated: Date.now(),
        })),

      updateLifestylePlanItem: (id, updates) =>
        set((state) => ({
          lifestylePlan: state.lifestylePlan.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
          lastUpdated: Date.now(),
        })),

      toggleLifestylePlanItem: (id) =>
        set((state) => ({
          lifestylePlan: state.lifestylePlan.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
          lastUpdated: Date.now(),
        })),

      removeLifestylePlanItem: (id) =>
        set((state) => ({
          lifestylePlan: state.lifestylePlan.filter((item) => item.id !== id),
          lastUpdated: Date.now(),
        })),

      clearLifestylePlan: () =>
        set({
          lifestylePlan: [],
          lastUpdated: Date.now(),
        }),

      // Chat
      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
          lastUpdated: Date.now(),
        })),

      clearChatHistory: () =>
        set({
          chatHistory: [],
          lastUpdated: Date.now(),
        }),

      // Settings
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
          lastUpdated: Date.now(),
        })),

      setGeminiApiKey: (key, persist) =>
        set((state) => ({
          settings: {
            ...state.settings,
            geminiApiKey: key,
            persistApiKey: persist,
          },
          lastUpdated: Date.now(),
        })),

      clearGeminiApiKey: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            geminiApiKey: undefined,
            persistApiKey: false,
          },
          lastUpdated: Date.now(),
        })),

      // App State
      setConsentGiven: (given) =>
        set({
          consentGiven: given,
          lastUpdated: Date.now(),
        }),

      setOnboardingCompleted: (completed) =>
        set({
          onboardingCompleted: completed,
          lastUpdated: Date.now(),
        }),

      // Data Management
      exportData: () => {
        const state = get();
        return {
          userProfile: state.userProfile,
          geneticMarkers: state.geneticMarkers,
          recommendations: state.recommendations,
          lifestylePlan: state.lifestylePlan,
          settings: { ...state.settings, geminiApiKey: undefined }, // Don't export API key
          consentGiven: state.consentGiven,
          onboardingCompleted: state.onboardingCompleted,
          chatHistory: state.chatHistory,
          lastUpdated: state.lastUpdated,
          dataVersion: state.dataVersion,
        };
      },

      importData: (data) =>
        set((state) => ({
          ...state,
          ...data,
          lastUpdated: Date.now(),
        })),

      clearAllData: () =>
        set({
          ...initialState,
          consentGiven: get().consentGiven, // Preserve consent
          lastUpdated: Date.now(),
        }),
    }),
    {
      name: 'sera-ai-storage',
      storage: createJSONStorage(() => localforage as any),
      partialize: (state) => ({
        // Only persist these fields
        userProfile: state.userProfile,
        geneticMarkers: state.geneticMarkers,
        recommendations: state.recommendations,
        lifestylePlan: state.lifestylePlan,
        settings: state.settings.persistApiKey
          ? state.settings
          : { ...state.settings, geminiApiKey: undefined },
        consentGiven: state.consentGiven,
        onboardingCompleted: state.onboardingCompleted,
        chatHistory: state.chatHistory,
        lastUpdated: state.lastUpdated,
        dataVersion: state.dataVersion,
      }),
    }
  )
);

