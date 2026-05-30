import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { useRecordStore } from '../../src/stores/recordStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import { BreastSide, DiaperType, FeedingType } from '../../src/constants/types';
import { RecordIcon } from '../../src/components/ui/record-icons';

type Mode = 'menu' | 'feeding' | 'diaper';

function sanitizeNumericInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  suffix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  suffix?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, suffix ? styles.inputWithSuffix : null]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const addFeeding = useRecordStore((state) => state.addFeeding);
  const addDiaper = useRecordStore((state) => state.addDiaper);

  const [mode, setMode] = useState<Mode>('menu');
  const [feedingType, setFeedingType] = useState<FeedingType | null>(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [breastSide, setBreastSide] = useState<BreastSide>('both');
  const [diaperType, setDiaperType] = useState<DiaperType | null>(null);
  const [note, setNote] = useState('');
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

  const reset = () => {
    setMode('menu');
    setFeedingType(null);
    setAmount('');
    setDuration('');
    setBreastSide('both');
    setDiaperType(null);
    setNote('');
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
      note: note.trim() || undefined,
    });
    setSaving(false);
    Alert.alert('已保存', '这条记录已经记下来了。');
    reset();
  };

  const handleSaveDiaper = async () => {
    if (!baby || !diaperType) {
      return;
    }

    setSaving(true);
    await addDiaper(baby.id, {
      diaper_type: diaperType,
      note: note.trim() || undefined,
    });
    setSaving(false);
    Alert.alert('已保存', '这条记录已经记下来了。');
    reset();
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
      {mode === 'menu' ? (
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.84}
            onPress={() => setMode('feeding')}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.primarySoft }]}>
              <RecordIcon type="bottle" color={Colors.primary} size={30} />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.menuTitle}>记录喂奶</Text>
              <Text style={styles.menuDescription}>支持瓶喂母乳、瓶喂奶粉和亲喂。</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.84}
            onPress={() => setMode('diaper')}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.accentSoft }]}>
              <RecordIcon type="diaper" color={Colors.success} size={30} />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.menuTitle}>记录换尿裤</Text>
              <Text style={styles.menuDescription}>尿了、臭臭、混合便便都能快速标记。</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.84}
            onPress={() => router.push('/ai-analysis')}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: Colors.secondarySoft }]}>
              <Text style={styles.menuSpark}>AI</Text>
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.menuTitle}>AI 喂养分析</Text>
              <Text style={styles.menuDescription}>结合最近记录，生成温和清晰的喂养建议。</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {mode === 'feeding' ? (
        <View style={styles.formCard}>
          <TouchableOpacity style={styles.backButton} onPress={reset}>
            <Text style={styles.backButtonText}>返回选择</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>喂奶记录</Text>
          <Text style={styles.formDescription}>先选喂养方式，再填最必要的信息。</Text>

          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segmentButton, feedingType === 'bottle_breast' && styles.segmentButtonActive]}
              onPress={() => setFeedingType('bottle_breast')}
            >
              <Text style={[styles.segmentText, feedingType === 'bottle_breast' && styles.segmentTextActive]}>瓶喂母乳</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, feedingType === 'bottle_formula' && styles.segmentButtonActive]}
              onPress={() => setFeedingType('bottle_formula')}
            >
              <Text style={[styles.segmentText, feedingType === 'bottle_formula' && styles.segmentTextActive]}>瓶喂奶粉</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, feedingType === 'direct' && styles.segmentButtonActive]}
              onPress={() => setFeedingType('direct')}
            >
              <Text style={[styles.segmentText, feedingType === 'direct' && styles.segmentTextActive]}>亲喂</Text>
            </TouchableOpacity>
          </View>

          {feedingType === 'direct' ? (
            <>
              <FormField
                label="亲喂时长"
                placeholder="例如 15"
                value={duration}
                onChangeText={(value) => setDuration(sanitizeNumericInput(value))}
                keyboardType="number-pad"
                suffix="min"
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>喂养侧别</Text>
                <View style={styles.segmentRow}>
                  {[
                    { label: '左侧', value: 'left' as BreastSide },
                    { label: '右侧', value: 'right' as BreastSide },
                    { label: '双侧', value: 'both' as BreastSide },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.segmentButton, breastSide === option.value && styles.segmentButtonActive]}
                      onPress={() => setBreastSide(option.value)}
                    >
                      <Text style={[styles.segmentText, breastSide === option.value && styles.segmentTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : null}

          {feedingType && feedingType !== 'direct' ? (
            <FormField
              label="奶量"
              placeholder="例如 120"
              value={amount}
              onChangeText={(value) => setAmount(sanitizeNumericInput(value))}
              keyboardType="number-pad"
              suffix="ml"
            />
          ) : null}

          <FormField
            label="备注"
            placeholder="例如 刚睡醒、喝得很快、外出中"
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={[styles.primaryButton, (!canSaveFeeding || saving) && styles.primaryButtonDisabled]}
            disabled={!canSaveFeeding || saving}
            onPress={handleSaveFeeding}
          >
            <Text style={styles.primaryButtonText}>{saving ? '保存中...' : '保存喂奶记录'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {mode === 'diaper' ? (
        <View style={styles.formCard}>
          <TouchableOpacity style={styles.backButton} onPress={reset}>
            <Text style={styles.backButtonText}>返回选择</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>换尿裤记录</Text>
          <Text style={styles.formDescription}>保留最常用的选项，减少操作步骤。</Text>

          <View style={styles.segmentRow}>
            {[
              { label: '尿了', value: 'wet' as DiaperType },
              { label: '拉臭臭', value: 'dirty' as DiaperType },
              { label: '混合', value: 'mixed' as DiaperType },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.segmentButton, diaperType === option.value && styles.segmentButtonActive]}
                onPress={() => setDiaperType(option.value)}
              >
                <Text style={[styles.segmentText, diaperType === option.value && styles.segmentTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormField
            label="备注"
            placeholder="例如 颜色正常、外出前更换"
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={[styles.primaryButton, (!diaperType || saving) && styles.primaryButtonDisabled]}
            disabled={!diaperType || saving}
            onPress={handleSaveDiaper}
          >
            <Text style={styles.primaryButtonText}>{saving ? '保存中...' : '保存换尿裤记录'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  menuGroup: {
    gap: Spacing.md,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  menuIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  menuBody: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  menuDescription: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  menuSpark: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.secondary,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardMuted,
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  formTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  formDescription: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  segmentText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  fieldBlock: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    minHeight: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  inputWithSuffix: {
    paddingRight: 56,
  },
  inputSuffix: {
    position: 'absolute',
    right: Spacing.md,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  primaryButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
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
});
