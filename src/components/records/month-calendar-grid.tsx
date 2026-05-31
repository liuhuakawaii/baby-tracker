import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDay } from '../../utils/records';
import { BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../../constants/theme';

interface MonthCalendarGridProps {
  days: CalendarDay[];
  selectedDateKey: string;
  onSelectDay: (day: CalendarDay) => void;
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export function MonthCalendarGrid({
  days,
  selectedDateKey,
  onSelectDay,
}: MonthCalendarGridProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const isSelected = day.dateKey === selectedDateKey;

          return (
            <View key={day.dateKey} style={styles.dayCell}>
              {isSelected ? (
                <LinearGradient
                  colors={Gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.dayButton,
                    !day.isCurrentMonth && styles.dayButtonMuted,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.dayButtonInner}
                    activeOpacity={0.84}
                    onPress={() => onSelectDay(day)}
                  >
                    <Text style={[styles.dayNumber, styles.dayNumberSelected]}>
                      {day.dayNumber}
                    </Text>
                    {day.recordCount > 0 ? (
                      <View style={[styles.recordBadge, styles.recordBadgeSelected]}>
                        <Text style={[styles.recordBadgeText, styles.recordBadgeTextSelected]}>
                          {day.recordCount}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.recordDotPlaceholder} />
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.dayButton,
                    !day.isCurrentMonth && styles.dayButtonMuted,
                    day.isToday && styles.dayButtonToday,
                  ]}
                  activeOpacity={0.84}
                  onPress={() => onSelectDay(day)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      !day.isCurrentMonth && styles.dayNumberMuted,
                      day.isToday && styles.dayNumberToday,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>

                  {day.recordCount > 0 ? (
                    <View style={styles.recordBadge}>
                      <Text style={styles.recordBadgeText}>
                        {day.recordCount}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.recordDotPlaceholder} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.soft,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekdayCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  weekdayText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    padding: 3,
  },
  dayButton: {
    minHeight: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  dayButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayButtonMuted: {
    opacity: 0.35,
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: 'rgba(255, 139, 160, 0.3)',
  },
  dayNumber: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  dayNumberMuted: {
    color: Colors.textSecondary,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  dayNumberToday: {
    color: Colors.primary,
  },
  recordBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryGlow,
    ...Shadows.subtle,
  },
  recordBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  recordBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  recordBadgeTextSelected: {
    color: Colors.white,
  },
  recordDotPlaceholder: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
  },
});
