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
  formatDateLabel,
  formatElapsedSince,
  formatTime,
  getRecordPresentation,
  groupRecordsByDate,
} from '../../src/utils/records';
import { RecordIcon } from '../../src/components/ui/record-icons';
import { HomeHeroCard } from '../../src/components/home/home-hero-card';

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
          {baby ? (
            <HomeHeroCard baby={baby} topInset={insets.top} onPressAI={() => router.push('/ai-analysis')} />
          ) : null}

          {records.length === 0 && !recordsLoading ? (
            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>{TEXT.timeline}</Text>
              <Text style={styles.emptyTimelineTitle}>{TEXT.noRecord}</Text>
              <Text style={styles.emptyTimelineDescription}>{TEXT.noRecordDesc}</Text>
            </View>
          ) : (
            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>{TEXT.timeline}</Text>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => {
        const dateLabel = formatDateLabel(item.dateKey);

        return (
          <View style={styles.daySection}>
            <View style={styles.dayHeader}>
              <View style={styles.dayHeaderLeft}>
                <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.dayTitle}>{dateLabel.title}</Text>
                <Text style={styles.daySubtitle}>{dateLabel.subtitle}</Text>
              </View>
            </View>

            {item.records.map((record, index) => {
              const presentation = getRecordPresentation(record);
              const showLatestFeedingTip = record.id === latestFeedingRecordId && record.type === 'feeding';

              return (
                <View key={record.id} style={styles.timelineRow}>
                  <View style={styles.timelineTimeColumn}>
                    <Text style={styles.timelineTime}>{formatTime(record.created_at)}</Text>
                    <View style={styles.timelineTrack}>
                      <View style={[styles.timelineDot, { backgroundColor: presentation.timelineTint }]} />
                      {index !== item.records.length - 1 ? <View style={styles.timelineLine} /> : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.timelineItem}
                    activeOpacity={0.82}
                    onLongPress={() => deleteRecord(record.id)}
                  >
                    <View style={styles.timelineItemContent}>
                      {showLatestFeedingTip ? (
                        <View style={styles.tipRow}>
                          <View style={styles.tipPill}>
                            <Text style={styles.tipText}>{formatElapsedSince(record.created_at)}</Text>
                          </View>
                        </View>
                      ) : null}

                      <View style={styles.timelineItemMain}>
                        <View style={[styles.timelineIconWrap, { backgroundColor: presentation.softTint }]}>
                          <RecordIcon type={presentation.icon} color={presentation.tint} />
                        </View>
                        <View style={styles.timelineBody}>
                          <Text style={styles.timelineItemTitle}>{presentation.title}</Text>
                          {record.note ? <Text style={styles.timelineNote}>{record.note}</Text> : null}
                        </View>
                        <View style={styles.timelineValueWrap}>
                          <Text style={[styles.timelineValue, { color: presentation.tint }]}>{presentation.value}</Text>
                          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
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
  timelineCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    ...Shadows.soft,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  daySection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    ...Shadows.soft,
  },
  dayHeader: {
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  daySubtitle: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.sm,
  },
  timelineTimeColumn: {
    width: 72,
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  timelineTime: {
    fontSize: 17,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timelineTrack: {
    flex: 1,
    width: 22,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineItem: {
    flex: 1,
    minHeight: 88,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timelineItemContent: {
    gap: Spacing.sm,
  },
  timelineItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  timelineBody: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  timelineItemTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  timelineNote: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
  },
  tipPill: {
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  tipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  timelineValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timelineValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyTimelineTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
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
    borderRadius: BorderRadius.xl,
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
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
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
