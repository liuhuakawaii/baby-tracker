import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Record } from '../../constants/types';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../constants/theme';
import { formatDateLabel, formatElapsedSince, formatTime, getRecordPresentation } from '../../utils/records';
import { RecordIcon } from '../ui/record-icons';

interface RecordDayCardProps {
  dateKey: string;
  records: Record[];
  latestFeedingRecordId?: number | null;
  onDeleteRecord?: (id: number) => void;
}

export function RecordDayCard({
  dateKey,
  records,
  latestFeedingRecordId = null,
  onDeleteRecord,
}: RecordDayCardProps) {
  const router = useRouter();
  const dateLabel = formatDateLabel(dateKey);

  return (
    <View style={styles.daySection}>
      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.dayTitle}>{dateLabel.title}</Text>
          <Text style={styles.daySubtitle}>{dateLabel.subtitle}</Text>
        </View>
      </View>

      {records.map((record, index) => {
        const presentation = getRecordPresentation(record);
        const showLatestFeedingTip = record.id === latestFeedingRecordId && record.type === 'feeding';

        return (
          <View key={record.id} style={styles.timelineRow}>
            <View style={styles.timelineTimeColumn}>
              <Text style={styles.timelineTime}>{formatTime(record.created_at)}</Text>
              <View style={styles.timelineTrack}>
                <View style={[styles.timelineDot, { backgroundColor: presentation.timelineTint }]} />
                {index !== records.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.timelineItem}
              activeOpacity={0.82}
              onPress={() => router.push({ pathname: '/add', params: { recordId: String(record.id) } })}
              onLongPress={onDeleteRecord ? () => onDeleteRecord(record.id) : undefined}
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
}

const styles = StyleSheet.create({
  daySection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
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
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  daySubtitle: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.xs,
  },
  timelineTimeColumn: {
    width: 64,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  timelineTime: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timelineTrack: {
    flex: 1,
    width: 20,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
    marginTop: 3,
  },
  timelineItem: {
    flex: 1,
    minHeight: 76,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xs,
  },
  timelineItemContent: {
    gap: Spacing.xs,
  },
  timelineItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  timelineBody: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  timelineItemTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  timelineNote: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tipRow: {
    flexDirection: 'row',
  },
  tipPill: {
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
  },
  tipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  timelineValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timelineValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
