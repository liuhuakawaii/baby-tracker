import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import { buildDailySummary, getAgeLabel, getTodayRecords } from '../../src/utils/records';

function SummaryMetric({
  label,
  value,
  helper,
  tint,
}: {
  label: string;
  value: string;
  helper: string;
  tint: string;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: tint }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

export default function AnalysisTabScreen() {
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const records = useRecordStore((state) => state.records);

  const todayRecords = useMemo(() => getTodayRecords(records), [records]);
  const summary = useMemo(() => buildDailySummary(todayRecords), [todayRecords]);

  const summaryText = useMemo(() => {
    if (summary.feedings === 0 && summary.diapers === 0) {
      return '\u4eca\u5929\u8fd8\u6ca1\u6709\u8bb0\u5f55\uff0c\u5148\u4ece\u7b2c\u4e00\u6761\u5582\u517b\u6216\u6362\u5c3f\u88e4\u5f00\u59cb\u3002';
    }

    if (summary.feedings >= 6 || summary.diapers >= 5) {
      return '\u4eca\u5929\u7684\u8bb0\u5f55\u5df2\u7ecf\u6bd4\u8f83\u5b8c\u6574\uff0c\u53ef\u4ee5\u66f4\u8f7b\u677e\u5730\u56de\u770b\u6574\u5929\u8282\u594f\u3002';
    }

    return '\u8bb0\u5f55\u8fd8\u5728\u9010\u6e10\u8865\u5145\u4e2d\uff0c\u7ee7\u7eed\u4fdd\u6301\u8fde\u7eed\u6027\u4f1a\u66f4\u6709\u53c2\u8003\u4ef7\u503c\u3002';
  }, [summary]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 120,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{'\u7edf\u8ba1'}</Text>
        {baby ? (
          <View style={styles.agePill}>
            <Text style={styles.agePillText}>{getAgeLabel(baby.birthday)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroDescription}>{summaryText}</Text>
      </View>

      <View style={styles.metricGrid}>
        <SummaryMetric
          label={'\u74f6\u5582\u603b\u91cf'}
          value={`${summary.totalBottleMl} ml`}
          helper={`\u5171 ${summary.bottleFeedings} \u6b21`}
          tint={Colors.primarySoft}
        />
        <SummaryMetric
          label={'\u4eb2\u5582\u65f6\u957f'}
          value={`${summary.nursingMinutes} \u5206\u949f`}
          helper={`\u5171 ${summary.breastFeedings} \u6b21`}
          tint={Colors.lavenderSoft}
        />
        <SummaryMetric
          label={'\u6362\u5c3f\u88e4'}
          value={`${summary.diapers} \u6b21`}
          helper={`\u5c3f ${summary.wetDiapers} \u00b7 \u81ed ${summary.dirtyDiapers} \u00b7 \u6df7\u5408 ${summary.mixedDiapers}`}
          tint={Colors.accentSoft}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: 36,
    fontWeight: '700',
    color: Colors.text,
  },
  agePill: {
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  agePillText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  heroDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  metricGrid: {
    gap: Spacing.md,
  },
  metricCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  metricLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  metricHelper: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
