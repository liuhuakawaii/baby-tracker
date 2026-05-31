import { StyleSheet, Text, View } from 'react-native';
import { DailySummary } from '../../utils/records';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../constants/theme';

interface TodaySummaryStripProps {
  summary: DailySummary;
}

function SummaryTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileHelper}>{helper}</Text>
    </View>
  );
}

export function TodaySummaryStrip({ summary }: TodaySummaryStripProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.wrapper}>
        <SummaryTile
          label="今日瓶喂"
          value={`${summary.totalBottleMl} ml`}
          helper={`${summary.bottleFeedings} 次`}
        />
        <SummaryTile
          label="亲喂时长"
          value={`${summary.nursingMinutes} 分钟`}
          helper={`${summary.breastFeedings} 次`}
        />
        <SummaryTile
          label="换尿裤"
          value={`${summary.diapers} 次`}
          helper={`尿 ${summary.wetDiapers} · 臭 ${summary.dirtyDiapers}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  wrapper: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  tile: {
    flex: 1,
    minHeight: 88,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  tileLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  tileValue: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  tileHelper: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
