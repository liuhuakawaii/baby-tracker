import { create } from 'zustand';
import { Record, RecordType, FeedingType, BreastSide, DiaperType } from '../constants/types';
import { getDB } from '../db/database';

interface RecordState {
  records: Record[];
  isLoading: boolean;
  loadRecords: (babyId: number) => Promise<void>;
  addFeeding: (babyId: number, data: {
    feeding_type: FeedingType;
    amount_ml?: number;
    duration_min?: number;
    breast_side?: BreastSide;
    note?: string;
    created_at?: string;
  }) => Promise<void>;
  addDiaper: (babyId: number, data: {
    diaper_type: DiaperType;
    note?: string;
    created_at?: string;
  }) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  getTodaySummary: (babyId: number) => Promise<{ feedings: number; total_ml: number; diapers: number }>;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: [],
  isLoading: true,

  loadRecords: async (babyId) => {
    const db = await getDB();
    const rows = await db.getAll<Record>(
      'SELECT * FROM records WHERE baby_id=? ORDER BY created_at DESC',
      babyId
    );
    set({ records: rows, isLoading: false });
  },

  addFeeding: async (babyId, data) => {
    const db = await getDB();
    const now = data.created_at ?? new Date().toISOString();
    const result = await db.run(
      `INSERT INTO records (baby_id, type, created_at, feeding_type, amount_ml, duration_min, breast_side, note)
       VALUES (?, 'feeding', ?, ?, ?, ?, ?, ?)`,
      babyId, now, data.feeding_type, data.amount_ml ?? null, data.duration_min ?? null, data.breast_side ?? null, data.note ?? null
    );
    const newRecord: Record = {
      id: result.lastInsertRowId,
      baby_id: babyId,
      type: 'feeding',
      created_at: now,
      feeding_type: data.feeding_type,
      amount_ml: data.amount_ml,
      duration_min: data.duration_min,
      breast_side: data.breast_side,
      note: data.note,
    };
    set({ records: [newRecord, ...get().records] });
  },

  addDiaper: async (babyId, data) => {
    const db = await getDB();
    const now = data.created_at ?? new Date().toISOString();
    const result = await db.run(
      `INSERT INTO records (baby_id, type, created_at, diaper_type, note)
       VALUES (?, 'diaper', ?, ?, ?)`,
      babyId, now, data.diaper_type, data.note ?? null
    );
    const newRecord: Record = {
      id: result.lastInsertRowId,
      baby_id: babyId,
      type: 'diaper',
      created_at: now,
      diaper_type: data.diaper_type,
      note: data.note,
    };
    set({ records: [newRecord, ...get().records] });
  },

  deleteRecord: async (id) => {
    const db = await getDB();
    await db.run('DELETE FROM records WHERE id=?', id);
    set({ records: get().records.filter((r) => r.id !== id) });
  },

  getTodaySummary: async (babyId) => {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0];
    const row = await db.getFirst<{ feedings: number; total_ml: number; diapers: number }>(
      `SELECT
        COUNT(CASE WHEN type='feeding' THEN 1 END) as feedings,
        COALESCE(SUM(CASE WHEN type='feeding' THEN amount_ml END), 0) as total_ml,
        COUNT(CASE WHEN type='diaper' THEN 1 END) as diapers
       FROM records
       WHERE baby_id=? AND created_at LIKE ?`,
      babyId, `${today}%`
    );
    return row ?? { feedings: 0, total_ml: 0, diapers: 0 };
  },
}));
