import { create } from 'zustand';
import { AIAnalysisHistoryItem } from '../constants/types';
import { getDB } from '../db/database';

const AI_ANALYSIS_HISTORY_KEY = 'ai_analysis_history';
const MAX_HISTORY_ITEMS = 20;

interface AIAnalysisState {
  history: AIAnalysisHistoryItem[];
  activeResultId: string | null;
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  addHistoryItem: (item: AIAnalysisHistoryItem) => Promise<void>;
  setActiveResultId: (id: string) => void;
  getHistoryItem: (id: string) => AIAnalysisHistoryItem | null;
}

async function getSetting(key: string): Promise<string | null> {
  const db = await getDB();
  const row = await db.getFirst<{ value: string }>('SELECT value FROM settings WHERE key=?', key);
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

function parseHistory(value: string | null): AIAnalysisHistoryItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is AIAnalysisHistoryItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'created_at' in item &&
        'content' in item
      );
    });
  } catch {
    return [];
  }
}

export const useAIAnalysisStore = create<AIAnalysisState>((set, get) => ({
  history: [],
  activeResultId: null,
  isLoading: true,

  loadHistory: async () => {
    const value = await getSetting(AI_ANALYSIS_HISTORY_KEY);
    set({ history: parseHistory(value), isLoading: false });
  },

  addHistoryItem: async (item) => {
    const nextHistory = [item, ...get().history].slice(0, MAX_HISTORY_ITEMS);
    await setSetting(AI_ANALYSIS_HISTORY_KEY, JSON.stringify(nextHistory));
    set({ history: nextHistory, activeResultId: item.id });
  },

  setActiveResultId: (id) => {
    set({ activeResultId: id });
  },

  getHistoryItem: (id) => {
    return get().history.find((item) => item.id === id) ?? null;
  },
}));

