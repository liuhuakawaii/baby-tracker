import { create } from 'zustand';
import { AIConfig } from '../constants/types';
import { getDB } from '../db/database';

const DEFAULT_AI_CONFIG: AIConfig = {
  base_url: 'https://token-plan-sgp.xiaomimimo.com/v1',
  api_key: '',
  model: 'MiMo',
};

interface SettingsState {
  aiConfig: AIConfig;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  saveAIConfig: (config: Partial<AIConfig>) => Promise<void>;
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

export const useSettingsStore = create<SettingsState>((set, get) => ({
  aiConfig: DEFAULT_AI_CONFIG,
  isLoading: true,

  loadSettings: async () => {
    const baseUrl = await getSetting('ai_base_url');
    const apiKey = await getSetting('ai_api_key');
    const model = await getSetting('ai_model');
    set({
      aiConfig: {
        base_url: baseUrl ?? DEFAULT_AI_CONFIG.base_url,
        api_key: apiKey ?? DEFAULT_AI_CONFIG.api_key,
        model: model ?? DEFAULT_AI_CONFIG.model,
      },
      isLoading: false,
    });
  },

  saveAIConfig: async (config) => {
    const current = get().aiConfig;
    const updated = { ...current, ...config };
    if (config.base_url !== undefined) await setSetting('ai_base_url', config.base_url);
    if (config.api_key !== undefined) await setSetting('ai_api_key', config.api_key);
    if (config.model !== undefined) await setSetting('ai_model', config.model);
    set({ aiConfig: updated });
  },
}));
