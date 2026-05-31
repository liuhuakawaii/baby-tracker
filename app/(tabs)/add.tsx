import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import { BreastSide, DiaperType, FeedingType, Record } from '../../src/constants/types';
import { RecordEntryPanel, RecordMode } from '../../src/components/ui/record-entry-panel';

function sanitizeNumericInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recordId?: string }>();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const records = useRecordStore((state) => state.records);
  const addFeeding = useRecordStore((state) => state.addFeeding);
  const addDiaper = useRecordStore((state) => state.addDiaper);
  const updateFeeding = useRecordStore((state) => state.updateFeeding);
  const updateDiaper = useRecordStore((state) => state.updateDiaper);

  const editingRecord = useMemo<Record | null>(() => {
    if (!params.recordId) {
      return null;
    }

    const targetId = Number(params.recordId);
    return records.find((record) => record.id === targetId) ?? null;
  }, [params.recordId, records]);
  const isEditing = Boolean(editingRecord);

  const [mode, setMode] = useState<RecordMode>('feeding');
  const [feedingType, setFeedingType] = useState<FeedingType | null>(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [breastSide, setBreastSide] = useState<BreastSide>('both');
  const [feedingNote, setFeedingNote] = useState('');
  const [diaperType, setDiaperType] = useState<DiaperType | null>(null);
  const [diaperNote, setDiaperNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingRecord) {
      return;
    }

    if (editingRecord.type === 'feeding') {
      setMode('feeding');
      setFeedingType(editingRecord.feeding_type ?? null);
      setAmount(editingRecord.amount_ml ? String(editingRecord.amount_ml) : '');
      setDuration(editingRecord.duration_min ? String(editingRecord.duration_min) : '');
      setBreastSide(editingRecord.breast_side ?? 'both');
      setFeedingNote(editingRecord.note ?? '');
      setDiaperType(null);
      setDiaperNote('');
      return;
    }

    setMode('diaper');
    setDiaperType(editingRecord.diaper_type ?? null);
    setDiaperNote(editingRecord.note ?? '');
    setFeedingType(null);
    setAmount('');
    setDuration('');
    setBreastSide('both');
    setFeedingNote('');
  }, [editingRecord]);

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
    if ((!baby && !isEditing) || !feedingType || !canSaveFeeding) {
      return;
    }

    setSaving(true);
    const payload = {
      feeding_type: feedingType,
      amount_ml: feedingType === 'direct' ? undefined : Number(sanitizeNumericInput(amount)),
      duration_min: feedingType === 'direct' ? Number(sanitizeNumericInput(duration)) : undefined,
      breast_side: feedingType === 'direct' ? breastSide : undefined,
      note: feedingNote.trim() || undefined,
    };

    if (editingRecord) {
      await updateFeeding(editingRecord.id, payload);
    } else if (baby) {
      await addFeeding(baby.id, payload);
    }

    setSaving(false);
    resetFeedingDraft();
    router.navigate('/');
  };

  const handleSaveDiaper = async () => {
    if ((!baby && !isEditing) || !diaperType) {
      return;
    }

    setSaving(true);
    const payload = {
      diaper_type: diaperType,
      note: diaperNote.trim() || undefined,
    };

    if (editingRecord) {
      await updateDiaper(editingRecord.id, payload);
    } else if (baby) {
      await addDiaper(baby.id, payload);
    }

    setSaving(false);
    resetDiaperDraft();
    router.navigate('/');
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
        isEditing={isEditing}
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
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    ...Shadows.card,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    lineHeight: 36,
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
    height: 58,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
