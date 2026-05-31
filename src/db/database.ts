import { Platform } from 'react-native';

// ---- Types ----
export interface DBAdapter {
  exec(sql: string): Promise<void>;
  run(sql: string, ...params: any[]): Promise<{ lastInsertRowId: number }>;
  getFirst<T>(sql: string, ...params: any[]): Promise<T | null>;
  getAll<T>(sql: string, ...params: any[]): Promise<T[]>;
}

// ---- Native SQLite adapter ----
let nativeDB: any = null;

async function getNativeAdapter(): Promise<DBAdapter> {
  const SQLite = require('expo-sqlite');
  if (!nativeDB) {
    nativeDB = await SQLite.openDatabaseAsync('baby-tracker.db');
    await initTables(nativeDB);
  }
  return {
    exec: (sql) => nativeDB.execAsync(sql),
    run: async (sql, ...params) => {
      const result = await nativeDB.runAsync(sql, ...params);
      return { lastInsertRowId: result.lastInsertRowId };
    },
    getFirst: (sql, ...params) => nativeDB.getFirstAsync(sql, ...params),
    getAll: (sql, ...params) => nativeDB.getAllAsync(sql, ...params),
  };
}

// ---- Web localStorage adapter ----
function getWebData(key: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function setWebData(key: string, data: any[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getWebSetting(key: string): string | null {
  try {
    const settings = JSON.parse(localStorage.getItem('baby_tracker_settings') || '{}');
    return settings[key] ?? null;
  } catch {
    return null;
  }
}

function setWebSetting(key: string, value: string) {
  try {
    const settings = JSON.parse(localStorage.getItem('baby_tracker_settings') || '{}');
    settings[key] = value;
    localStorage.setItem('baby_tracker_settings', JSON.stringify(settings));
  } catch {}
}

let webIdCounters: Record<string, number> = {};

function getNextId(table: string): number {
  if (!webIdCounters[table]) {
    const data = getWebData(`baby_tracker_${table}`);
    webIdCounters[table] = data.length > 0 ? Math.max(...data.map((d: any) => d.id || 0)) + 1 : 1;
  }
  return webIdCounters[table]++;
}

function getWebAdapter(): DBAdapter {
  return {
    exec: async () => {
      // Initialize tables in localStorage if not exist
      if (!localStorage.getItem('baby_tracker_baby')) setWebData('baby_tracker_baby', []);
      if (!localStorage.getItem('baby_tracker_records')) setWebData('baby_tracker_records', []);
      if (!localStorage.getItem('baby_tracker_settings')) localStorage.setItem('baby_tracker_settings', '{}');
    },
    run: async (sql, ...params) => {
      const upperSql = sql.trim().toUpperCase();

      // INSERT
      if (upperSql.startsWith('INSERT')) {
        if (sql.includes('baby') && !sql.includes('records') && !sql.includes('settings')) {
          const data = getWebData('baby_tracker_baby');
          const id = getNextId('baby');
          const now = new Date().toISOString();
          data.push({
            id,
            name: params[0],
            gender: params[1],
            birthday: params[2],
            height: params[3],
            weight: params[4],
            created_at: now,
          });
          setWebData('baby_tracker_baby', data);
          return { lastInsertRowId: id };
        }
        if (sql.includes('records')) {
          const data = getWebData('baby_tracker_records');
          const id = getNextId('records');
          const record: any = {
            id,
            baby_id: params[0],
            type: null,
            created_at: null,
            feeding_type: null,
            amount_ml: null,
            duration_min: null,
            breast_side: null,
            diaper_type: null,
            note: null,
          };

          // Parse INSERT columns from SQL
          const colMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
          if (colMatch) {
            const cols = colMatch[1].split(',').map((c: string) => c.trim());
            cols.forEach((col, i) => {
              if (params[i + 1] !== undefined) {
                record[col] = params[i + 1];
              }
            });
          }
          data.push(record);
          setWebData('baby_tracker_records', data);
          return { lastInsertRowId: id };
        }
        if (sql.includes('settings')) {
          setWebSetting(params[0], params[1]);
          return { lastInsertRowId: 0 };
        }
      }

      // UPDATE
      if (upperSql.startsWith('UPDATE')) {
        if (sql.includes('settings')) {
          setWebSetting(params[0], params[1]);
          return { lastInsertRowId: 0 };
        }
      if (sql.includes('baby')) {
        const data = getWebData('baby_tracker_baby');
        const idParam = params[params.length - 1];
          const idx = data.findIndex((d: any) => d.id === idParam);
          if (idx >= 0) {
            // Simple: update name, gender, birthday, height, weight
            if (params.length >= 6) {
              data[idx] = { ...data[idx], name: params[0], gender: params[1], birthday: params[2], height: params[3], weight: params[4] };
            }
            setWebData('baby_tracker_baby', data);
          }
          return { lastInsertRowId: 0 };
        }
        if (sql.includes('records')) {
          const data = getWebData('baby_tracker_records');
          const idParam = params[params.length - 1];
          const idx = data.findIndex((d: any) => d.id === idParam);

          if (idx >= 0) {
            if (sql.includes('feeding_type')) {
              data[idx] = {
                ...data[idx],
                feeding_type: params[0],
                amount_ml: params[1],
                duration_min: params[2],
                breast_side: params[3],
                note: params[4],
              };
            } else if (sql.includes('diaper_type')) {
              data[idx] = {
                ...data[idx],
                diaper_type: params[0],
                note: params[1],
              };
            }

            setWebData('baby_tracker_records', data);
          }

          return { lastInsertRowId: 0 };
        }
      }

      // DELETE
      if (upperSql.startsWith('DELETE')) {
        if (sql.includes('records')) {
          const data = getWebData('baby_tracker_records');
          const idParam = params[0];
          setWebData('baby_tracker_records', data.filter((d: any) => d.id !== idParam));
        }
        return { lastInsertRowId: 0 };
      }

      return { lastInsertRowId: 0 };
    },
    getFirst: async (sql, ...params) => {
      const upperSql = sql.trim().toUpperCase();

      // SELECT from baby
      if (sql.includes('FROM baby')) {
        const data = getWebData('baby_tracker_baby');
        return data.length > 0 ? data[0] : null;
      }

      // SELECT from settings
      if (sql.includes('FROM settings')) {
        const val = getWebSetting(params[0]);
        return val ? { value: val } : null;
      }

      // Today summary
      if (sql.includes('COUNT') && sql.includes('records')) {
        const records = getWebData('baby_tracker_records');
        const babyId = params[0];
        const todayPrefix = params[1];
        const todayRecords = records.filter(
          (r: any) => r.baby_id === babyId && r.created_at?.startsWith(todayPrefix)
        );
        return {
          feedings: todayRecords.filter((r: any) => r.type === 'feeding').length,
          total_ml: todayRecords.reduce((sum: number, r: any) => sum + (r.amount_ml || 0), 0),
          diapers: todayRecords.filter((r: any) => r.type === 'diaper').length,
        };
      }

      return null;
    },
    getAll: async (sql, ...params) => {
      if (sql.includes('FROM records')) {
        const data = getWebData('baby_tracker_records');
        const babyId = params[0];
        return data
          .filter((d: any) => d.baby_id === babyId)
          .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
      }
      return [];
    },
  };
}

// ---- Public API ----
async function initTables(db: any) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS baby (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      birthday TEXT NOT NULL,
      height REAL,
      weight REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baby_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      feeding_type TEXT,
      amount_ml INTEGER,
      duration_min INTEGER,
      breast_side TEXT,
      diaper_type TEXT,
      note TEXT,
      FOREIGN KEY (baby_id) REFERENCES baby(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_records_baby_id ON records(baby_id);
    CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);
    CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
  `);
}

let adapter: DBAdapter | null = null;

export async function getDB(): Promise<DBAdapter> {
  if (!adapter) {
    if (Platform.OS === 'web') {
      adapter = getWebAdapter();
      await adapter.exec('');
    } else {
      adapter = await getNativeAdapter();
    }
  }
  return adapter;
}
