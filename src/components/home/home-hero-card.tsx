import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Baby } from '../../constants/types';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../constants/theme';
import { formatHeroDate, getAgeLabel } from '../../utils/records';

interface HomeHeroCardProps {
  baby: Baby;
  topInset: number;
  onPressAI: () => void;
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export function HomeHeroCard({ baby, topInset, onPressAI }: HomeHeroCardProps) {
  const babyInitial = baby.name.trim().charAt(0) || '宝';
  const avatarToneStyle = baby.gender === 'male' ? styles.avatarMale : styles.avatarFemale;

  return (
    <View style={[styles.card, { paddingTop: topInset + 12 }]}>
      <View style={styles.identityRow}>
        <View style={[styles.avatar, avatarToneStyle]}>
          <Text style={styles.avatarText}>{babyInitial}</Text>
        </View>

        <View style={styles.identityText}>
          <Text style={styles.profileName}>{baby.name}</Text>
          <Text style={styles.profileDate}>{formatHeroDate()}</Text>
        </View>

        <TouchableOpacity style={styles.aiButton} activeOpacity={0.86} onPress={onPressAI}>
          <Ionicons name="sparkles" size={16} color={Colors.primary} />
          <Text style={styles.aiButtonText}>AI分析</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryChip label="年龄" value={getAgeLabel(baby.birthday)} />
        <SummaryChip label="体重" value={`${baby.weight} kg`} />
        <SummaryChip label="身高" value={`${baby.height} cm`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    ...Shadows.soft,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMale: {
    backgroundColor: Colors.skySoft,
  },
  avatarFemale: {
    backgroundColor: Colors.primarySoft,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  identityText: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
    gap: 2,
  },
  profileName: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    color: Colors.text,
  },
  profileDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  aiButton: {
    height: 40,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    backgroundColor: Colors.backgroundSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aiButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  summaryChip: {
    flex: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
});
