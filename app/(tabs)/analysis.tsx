import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecordStore } from '../../src/stores/recordStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import {
  buildDailySummary,
  CalendarDay,
  formatMonthLabel,
  getDateKey,
  getMonthCalendarDays,
  getRecordsForDateKey,
  isDateKeyInMonth,
  toDateKey,
} from '../../src/utils/records';
import { MonthCalendarGrid } from '../../src/components/records/month-calendar-grid';
import { RecordDayCard } from '../../src/components/records/record-day-card';

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function getDefaultSelectedDateKey(monthDate: Date, dateKeysWithRecords: string[]) {
  const todayKey = getDateKey(new Date().toISOString());

  if (isDateKeyInMonth(todayKey, monthDate)) {
    return todayKey;
  }

  const firstMonthRecordKey = dateKeysWithRecords.find((dateKey) => isDateKeyInMonth(dateKey, monthDate));

  if (firstMonthRecordKey) {
    return firstMonthRecordKey;
  }

  return toDateKey(monthDate);
}

export default function AnalysisTabScreen() {
  const insets = useSafeAreaInsets();
  const records = useRecordStore((state) => state.records);
  const deleteRecord = useRecordStore((state) => state.deleteRecord);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKey(new Date().toISOString()));

  const monthRecords = useMemo(
    () => records.filter((record) => isDateKeyInMonth(getDateKey(record.created_at), visibleMonth)),
    [records, visibleMonth]
  );
  const monthSummary = useMemo(() => buildDailySummary(monthRecords), [monthRecords]);
  const calendarDays = useMemo(() => getMonthCalendarDays(visibleMonth, records), [visibleMonth, records]);
  const monthDateKeysWithRecords = useMemo(
    () => Array.from(new Set(monthRecords.map((record) => getDateKey(record.created_at)))),
    [monthRecords]
  );
  const selectedDayRecords = useMemo(
    () => getRecordsForDateKey(records, selectedDateKey),
    [records, selectedDateKey]
  );

  useEffect(() => {
    if (!isDateKeyInMonth(selectedDateKey, visibleMonth)) {
      setSelectedDateKey(getDefaultSelectedDateKey(visibleMonth, monthDateKeysWithRecords));
    }
  }, [monthDateKeysWithRecords, selectedDateKey, visibleMonth]);

  const handleSelectDay = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      setVisibleMonth(getMonthStart(day.date));
    }

    setSelectedDateKey(day.dateKey);
  };

  return (
    <View style={styles.container}>
      <View style={styles.decorativeBlob} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.monthNavButton}
            activeOpacity={0.84}
            onPress={() => setVisibleMonth((current) => shiftMonth(current, -1))}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.monthHeaderText}>
            <Text style={styles.monthLabel}>{formatMonthLabel(visibleMonth)}</Text>
            <Text style={styles.monthMeta}>
              {`${monthRecords.length} 条记录 · 喂奶 ${monthSummary.feedings} 次 · 换尿裤 ${monthSummary.diapers} 次`}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.monthNavButton}
            activeOpacity={0.84}
            onPress={() => setVisibleMonth((current) => shiftMonth(current, 1))}
          >
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <MonthCalendarGrid
          days={calendarDays}
          selectedDateKey={selectedDateKey}
          onSelectDay={handleSelectDay}
        />

        {selectedDayRecords.length > 0 ? (
          <RecordDayCard dateKey={selectedDateKey} records={selectedDayRecords} onDeleteRecord={deleteRecord} />
        ) : (
          <View style={styles.emptyDayCard}>
            <Text style={styles.emptyDayTitle}>当天还没有记录</Text>
            <Text style={styles.emptyDayDescription}>可以切换到其他日期查看，或者回到首页继续添加当天记录。</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorativeBlob: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.decorativeBlob1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xxl,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  monthNavButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.subtle,
  },
  monthHeaderText: {
    flex: 1,
    gap: 4,
  },
  monthLabel: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  monthMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  emptyDayCard: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.soft,
  },
  emptyDayTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyDayDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
});
