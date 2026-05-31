import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { Animation, BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../../src/constants/theme';
import {
  buildDailySummary,
  getTodayRecords,
  groupRecordsByDate,
} from '../../src/utils/records';
import { TodaySummaryStrip } from '../../src/components/home/today-summary-strip';
import { RecordDayCard } from '../../src/components/records/record-day-card';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TEXT = {
  welcome: '欢迎来到宝宝记录',
  emptyTitle: '先添加宝宝资料，再开始记录每一天',
  emptyDescription: '添加完成后，首页会直接展示基本信息、AI 分析和时间线。',
  addBaby: '添加宝宝信息',
  goAI: '去看 AI 分析',
  aiAnalysis: 'AI 喂养分析',
  timeline: '时间线',
  noRecord: '还没有任何记录',
  noRecordDesc: '点击下方中间的加号，就能快速添加喂奶或换尿裤。',
};

function GradientButton({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => {
          scale.value = withSpring(Animation.pressScale, Animation.springConfig);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, Animation.springConfig);
        }}
        onPress={onPress}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
            <GradientButton label={TEXT.addBaby} onPress={() => router.push('/baby/profile')} />
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/ai-analysis')}>
              <Text style={styles.secondaryButtonText}>{TEXT.goAI}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.decorativeBlob1} />
      <View style={styles.decorativeBlob2} />
      <FlatList
        data={groupedRecords}
        keyExtractor={(item) => item.dateKey}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorativeBlob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.decorativeBlob1,
  },
  decorativeBlob2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.decorativeBlob2,
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
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
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
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
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
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
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
