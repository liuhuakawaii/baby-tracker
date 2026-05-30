import { Record } from '../constants/types';

export interface DailySummary {
  feedings: number;
  bottleFeedings: number;
  breastFeedings: number;
  totalBottleMl: number;
  diapers: number;
  wetDiapers: number;
  dirtyDiapers: number;
  mixedDiapers: number;
  nursingMinutes: number;
}

export interface DateGroup {
  dateKey: string;
  records: Record[];
}

function toSafeNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatTime(iso: string) {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatElapsedSince(iso: string) {
  const createdAt = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `\u8ddd\u73b0\u5728 ${minutes} \u5206\u949f`;
  }

  return `\u8ddd\u73b0\u5728 ${hours} \u5c0f\u65f6 ${minutes} \u5206\u949f`;
}

export function getDateKey(iso: string) {
  return iso.split('T')[0];
}

export function isSameDate(first: Date, second: Date) {
  return first.toDateString() === second.toDateString();
}

export function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDate(date, today)) {
    return { title: `${date.getMonth() + 1}\u6708${date.getDate()}\u65e5`, subtitle: '\u4eca\u5929' };
  }

  if (isSameDate(date, yesterday)) {
    return { title: `${date.getMonth() + 1}\u6708${date.getDate()}\u65e5`, subtitle: '\u6628\u5929' };
  }

  const weekday = [
    '\u5468\u65e5',
    '\u5468\u4e00',
    '\u5468\u4e8c',
    '\u5468\u4e09',
    '\u5468\u56db',
    '\u5468\u4e94',
    '\u5468\u516d',
  ][date.getDay()];

  return {
    title: `${date.getMonth() + 1}\u6708${date.getDate()}\u65e5`,
    subtitle: weekday,
  };
}

export function formatHeroDate() {
  const today = new Date();
  const weekday = [
    '\u661f\u671f\u65e5',
    '\u661f\u671f\u4e00',
    '\u661f\u671f\u4e8c',
    '\u661f\u671f\u4e09',
    '\u661f\u671f\u56db',
    '\u661f\u671f\u4e94',
    '\u661f\u671f\u516d',
  ][today.getDay()];
  return `${today.getMonth() + 1}\u6708${today.getDate()}\u65e5 ${weekday}`;
}

export function groupRecordsByDate(records: Record[]): DateGroup[] {
  const grouped = new Map<string, Record[]>();

  for (const record of records) {
    const dateKey = getDateKey(record.created_at);
    const existing = grouped.get(dateKey) ?? [];
    existing.push(record);
    grouped.set(dateKey, existing);
  }

  return Array.from(grouped.entries()).map(([groupDateKey, recordsForDay]) => ({
    dateKey: groupDateKey,
    records: recordsForDay,
  }));
}

export function getTodayRecords(records: Record[]) {
  const todayKey = getDateKey(new Date().toISOString());
  return records.filter((record) => getDateKey(record.created_at) === todayKey);
}

export function buildDailySummary(records: Record[]): DailySummary {
  return records.reduce<DailySummary>(
    (summary, record) => {
      if (record.type === 'feeding') {
        summary.feedings += 1;

        if (record.feeding_type === 'direct') {
          summary.breastFeedings += 1;
          summary.nursingMinutes += toSafeNumber(record.duration_min);
        } else {
          summary.bottleFeedings += 1;
          summary.totalBottleMl += toSafeNumber(record.amount_ml);
        }
      }

      if (record.type === 'diaper') {
        summary.diapers += 1;

        if (record.diaper_type === 'wet') {
          summary.wetDiapers += 1;
        } else if (record.diaper_type === 'dirty') {
          summary.dirtyDiapers += 1;
        } else if (record.diaper_type === 'mixed') {
          summary.mixedDiapers += 1;
        }
      }

      return summary;
    },
    {
      feedings: 0,
      bottleFeedings: 0,
      breastFeedings: 0,
      totalBottleMl: 0,
      diapers: 0,
      wetDiapers: 0,
      dirtyDiapers: 0,
      mixedDiapers: 0,
      nursingMinutes: 0,
    }
  );
}

export function getAgeLabel(birthday: string) {
  const birthDate = new Date(`${birthday}T00:00:00`);
  const today = new Date();
  const diffInDays = Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (diffInDays < 30) {
    return `${diffInDays}\u5929`;
  }

  const months = Math.floor(diffInDays / 30);

  if (months < 12) {
    return `${months}\u4e2a\u6708`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years}\u5c81`;
  }

  return `${years}\u5c81${remainingMonths}\u4e2a\u6708`;
}

export function getRecordPresentation(record: Record) {
  if (record.type === 'feeding') {
    if (record.feeding_type === 'bottle_breast') {
      return {
        icon: 'bottle' as const,
        title: '\u74f6\u5582\u6bcd\u4e73',
        value: record.amount_ml ? `${record.amount_ml} ml` : '\u5df2\u8bb0\u5f55',
        tint: '#FF6F9F',
        softTint: '#FFE7EF',
        timelineTint: '#FF7FA8',
      };
    }

    if (record.feeding_type === 'bottle_formula') {
      return {
        icon: 'bottle' as const,
        title: '\u74f6\u5582\u5976\u7c89',
        value: record.amount_ml ? `${record.amount_ml} ml` : '\u5df2\u8bb0\u5f55',
        tint: '#FF8C82',
        softTint: '#FFF0EC',
        timelineTint: '#FF8C82',
      };
    }

    const sideLabel =
      record.breast_side === 'left'
        ? '\u5de6\u4fa7'
        : record.breast_side === 'right'
          ? '\u53f3\u4fa7'
          : '\u53cc\u4fa7';

    return {
      icon: 'heart' as const,
      title: `\u4eb2\u5582\uff08${sideLabel}\uff09`,
      value: record.duration_min ? `${record.duration_min} \u5206\u949f` : '\u5df2\u8bb0\u5f55',
      tint: '#9C7CFB',
      softTint: '#F0EBFF',
      timelineTint: '#9C7CFB',
    };
  }

  if (record.diaper_type === 'wet') {
    return {
      icon: 'diaper' as const,
      title: '\u5c3f\u4e86',
      value: '\u5df2\u8bb0\u5f55',
      tint: '#81C85B',
      softTint: '#EEF9E8',
      timelineTint: '#92D35D',
    };
  }

  if (record.diaper_type === 'dirty') {
    return {
      icon: 'diaper' as const,
      title: '\u62c9\u81ed\u81ed',
      value: '\u5df2\u8bb0\u5f55',
      tint: '#76B65A',
      softTint: '#EDF7E8',
      timelineTint: '#81C85B',
    };
  }

  return {
    icon: 'diaper' as const,
    title: '\u6df7\u5408\u4fbf\u4fbf',
    value: '\u5df2\u8bb0\u5f55',
    tint: '#5FB99B',
    softTint: '#E8F8F3',
    timelineTint: '#5FB99B',
  };
}
