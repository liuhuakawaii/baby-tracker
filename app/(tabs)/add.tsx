import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import { BreastSide, DiaperType, FeedingType } from '../../src/constants/types';
import { RecordEntryPanel, RecordMode } from '../../src/components/ui/record-entry-panel';

function sanitizeNumericInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const addFeeding = useRecordStore((state) => state.addFeeding);
  const addDiaper = useRecordStore((state) => state.addDiaper);

  const [mode, setMode] = useState<RecordMode>('feeding');
  const [feedingType, setFeedingType] = useState<FeedingType | null>(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [breastSide, setBreastSide] = useState<BreastSide>('both');
  const [feedingNote, setFeedingNote] = useState('');
  const [diaperType, setDiaperType] = useState<DiaperType | null>(null);
  const [diaperNote, setDiaperNote] = useState('');
  const [saving, setSaving] = useState(false);

  const canSaveFeeding = useMemo(() => {
    if (!feedingType) {
      return false;
    }

    if (feedingType === 'direct') {
      return Boolean(duration);
    }

    return Boolean(amount);
  }, [amount, duration, feedingType]);

  const resetFeedingDraft = () => {
    setAmount('');
    setDuration('');
    setFeedingNote('');
  };

  const resetDiaperDraft = () => {
    setDiaperType(null);
    setDiaperNote('');
  };

  const handleSaveFeeding = async () => {
    if (!baby || !feedingType || !canSaveFeeding) {
      return;
    }

    setSaving(true);
    await addFeeding(baby.id, {
      feeding_type: feedingType,
      amount_ml: feedingType === 'direct' ? undefined : Number(sanitizeNumericInput(amount)),
      duration_min: feedingType === 'direct' ? Number(sanitizeNumericInput(duration)) : undefined,
      breast_side: feedingType === 'direct' ? breastSide : undefined,
      note: feedingNote.trim() || undefined,
    });
    setSaving(false);
    Alert.alert('已保存', '这条记录已经记下来了。');
    resetFeedingDraft();
  };

  const handleSaveDiaper = async () => {
    if (!baby || !diaperType) {
      return;
    }

    setSaving(true);
    await addDiaper(baby.id, {
      diaper_type: diaperType,
      note: diaperNote.trim() || undefined,
    });
    setSaving(false);
    Alert.alert('已保存', '这条记录已经记下来了。');
    resetDiaperDraft();
  };

  if (!baby) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.emptyContent,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>先创建宝宝资料</Text>
          <Text style={styles.emptyDescription}>填写完成后，记录页和 AI 分析功能都会一起可用。</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/baby/profile')}>
            <Text style={styles.primaryButtonText}>去填写资料</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

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
      <RecordEntryPanel
        mode={mode}
        feedingType={feedingType}
        amount={amount}
        duration={duration}
        breastSide={breastSide}
        feedingNote={feedingNote}
        diaperType={diaperType}
        diaperNote={diaperNote}
        saving={saving}
        canSaveFeeding={canSaveFeeding}
        onChangeMode={setMode}
        onChangeFeedingType={setFeedingType}
        onChangeAmount={(value) => setAmount(sanitizeNumericInput(value))}
        onChangeDuration={(value) => setDuration(sanitizeNumericInput(value))}
        onChangeBreastSide={setBreastSide}
        onChangeFeedingNote={setFeedingNote}
        onChangeDiaperType={setDiaperType}
        onChangeDiaperNote={setDiaperNote}
        onSubmitFeeding={handleSaveFeeding}
        onSubmitDiaper={handleSaveDiaper}
      />
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
  emptyContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    ...Shadows.card,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    lineHeight: 36,
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
});
