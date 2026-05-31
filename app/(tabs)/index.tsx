import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import {
  buildDailySummary,
  getTodayRecords,
  groupRecordsByDate,
} from '../../src/utils/records';
import { TodaySummaryStrip } from '../../src/components/home/today-summary-strip';
import { RecordDayCard } from '../../src/components/records/record-day-card';

const TEXT = {
  welcome: '\u6b22\u8fce\u6765\u5230\u5b9d\u5b9d\u8bb0\u5f55',
  emptyTitle: '\u5148\u6dfb\u52a0\u5b9d\u5b9d\u8d44\u6599\uff0c\u518d\u5f00\u59cb\u8bb0\u5f55\u6bcf\u4e00\u5929',
  emptyDescription: '\u6dfb\u52a0\u5b8c\u6210\u540e\uff0c\u9996\u9875\u4f1a\u76f4\u63a5\u5c55\u793a\u57fa\u672c\u4fe1\u606f\u3001AI \u5206\u6790\u548c\u65f6\u95f4\u7ebf\u3002',
  addBaby: '\u6dfb\u52a0\u5b9d\u5b9d\u4fe1\u606f',
  goAI: '\u53bb\u770b AI \u5206\u6790',
  aiAnalysis: 'AI \u5582\u517b\u5206\u6790',
  timeline: '\u65f6\u95f4\u7ebf',
  noRecord: '\u8fd8\u6ca1\u6709\u4efb\u4f55\u8bb0\u5f55',
  noRecordDesc: '\u70b9\u51fb\u4e0b\u65b9\u4e2d\u95f4\u7684\u52a0\u53f7\uff0c\u5c31\u80fd\u5feb\u901f\u6dfb\u52a0\u5582\u5976\u6216\u6362\u5c3f\u88e4\u3002',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const babyLoading = useBabyStore((state) => state.isLoading);
  const records = useRecordStore((state) => state.records);
  const recordsLoading = useRecordStore((state) => state.isLoading);
  const loadRecords = useRecordStore((state) => state.loadRecords);
  const deleteRecord = useRecordStore((state) => state.deleteRecord);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (baby) {
      void loadRecords(baby.id);
    }
  }, [baby, loadRecords]);

  const groupedRecords = useMemo(() => groupRecordsByDate(records), [records]);
  const latestFeedingRecordId = useMemo(() => {
    const latestFeedingRecord = records.find((record) => record.type === 'feeding');
    return latestFeedingRecord?.id ?? null;
  }, [records]);
  const todaySummary = useMemo(() => buildDailySummary(getTodayRecords(records)), [records]);

  const onRefresh = async () => {
    if (!baby) {
      return;
    }

    setRefreshing(true);
    await loadRecords(baby.id);
    setRefreshing(false);
  };

  if (!babyLoading && !baby) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.emptyContent,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyCard}>
          <Text style={styles.emptyOverline}>{TEXT.welcome}</Text>
          <Text style={styles.emptyTitle}>{TEXT.emptyTitle}</Text>
          <Text style={styles.emptyDescription}>{TEXT.emptyDescription}</Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/baby/profile')}>
              <Text style={styles.primaryButtonText}>{TEXT.addBaby}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/ai-analysis')}>
              <Text style={styles.secondaryButtonText}>{TEXT.goAI}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={groupedRecords}
      keyExtractor={(item) => item.dateKey}
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 120,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={{ paddingTop: insets.top + 18 }}>
            <TodaySummaryStrip summary={todaySummary} />
          </View>

          {records.length === 0 && !recordsLoading ? (
            <View style={styles.timelineEmptyCard}>
              <View style={styles.timelineSectionHeader}>
                <View style={styles.timelineSectionTitleRow}>
                  <View style={styles.timelineSectionAccent} />
                  <Text style={styles.timelineSectionTitle}>{TEXT.timeline}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timelineAIButton}
                  activeOpacity={0.84}
                  onPress={() => router.push('/ai-analysis')}
                >
                  <Ionicons name="sparkles" size={15} color={Colors.primary} />
                  <Text style={styles.timelineAIButtonText}>AI分析</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.emptyTimelineTitle}>{TEXT.noRecord}</Text>
              <Text style={styles.emptyTimelineDescription}>{TEXT.noRecordDesc}</Text>
            </View>
          ) : (
            <View style={styles.timelineSectionHeader}>
              <View style={styles.timelineSectionTitleRow}>
                <View style={styles.timelineSectionAccent} />
                <Text style={styles.timelineSectionTitle}>{TEXT.timeline}</Text>
              </View>
              <View style={styles.timelineHeaderActions}>
                <Text style={styles.timelineSectionMeta}>{`${records.length} 条记录`}</Text>
                <TouchableOpacity
                  style={styles.timelineAIButton}
                  activeOpacity={0.84}
                  onPress={() => router.push('/ai-analysis')}
                >
                  <Ionicons name="sparkles" size={15} color={Colors.primary} />
                  <Text style={styles.timelineAIButtonText}>AI分析</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => {
        return (
          <RecordDayCard
            dateKey={item.dateKey}
            records={item.records}
            latestFeedingRecordId={latestFeedingRecordId}
            onDeleteRecord={deleteRecord}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  timelineSectionHeader: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timelineSectionAccent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timelineSectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  timelineSectionMeta: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  timelineHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timelineAIButton: {
    height: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryGlow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineAIButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  timelineEmptyCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    ...Shadows.soft,
  },
  emptyTimelineTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emptyTimelineDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  emptyContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    ...Shadows.card,
  },
  emptyOverline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    lineHeight: 38,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  emptyDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
  },
  primaryButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyActions: {
    gap: Spacing.md,
  },
  secondaryButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
