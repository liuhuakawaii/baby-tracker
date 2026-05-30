import { create } from 'zustand';
import { Baby, Gender } from '../constants/types';
import { getDB } from '../db/database';

interface BabyState {
  baby: Baby | null;
  isLoading: boolean;
  loadBaby: () => Promise<void>;
  saveBaby: (data: { name: string; gender: Gender; birthday: string; height: number; weight: number }) => Promise<void>;
  updateBaby: (data: Partial<Baby>) => Promise<void>;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  baby: null,
  isLoading: true,

  loadBaby: async () => {
    try {
      const db = await getDB();
      const row = await db.getFirst<Baby>('SELECT * FROM baby LIMIT 1');
      set({ baby: row ?? null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  saveBaby: async (data) => {
    const db = await getDB();
    const existing = get().baby;
    if (existing) {
      await db.run(
        'UPDATE baby SET name=?, gender=?, birthday=?, height=?, weight=? WHERE id=?',
        data.name, data.gender, data.birthday, data.height, data.weight, existing.id
      );
      set({ baby: { ...existing, ...data } });
    } else {
      const result = await db.run(
        'INSERT INTO baby (name, gender, birthday, height, weight) VALUES (?, ?, ?, ?, ?)',
        data.name, data.gender, data.birthday, data.height, data.weight
      );
      set({
        baby: {
          id: result.lastInsertRowId,
          ...data,
          created_at: new Date().toISOString(),
        },
      });
    }
  },

  updateBaby: async (data) => {
    const baby = get().baby;
    if (!baby) return;
    const db = await getDB();
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key}=?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return;
    values.push(baby.id);
    await db.run(`UPDATE baby SET ${fields.join(',')} WHERE id=?`, ...values);
    set({ baby: { ...baby, ...data } });
  },
}));
