import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../constants/theme';
import { BreastSide, DiaperType, FeedingType } from '../../constants/types';
import { RecordIcon } from './record-icons';

export type RecordMode = 'feeding' | 'diaper';

interface RecordEntryPanelProps {
  mode: RecordMode;
  feedingType: FeedingType | null;
  amount: string;
  duration: string;
  breastSide: BreastSide;
  feedingNote: string;
  diaperType: DiaperType | null;
  diaperNote: string;
  saving: boolean;
  canSaveFeeding: boolean;
  onChangeMode: (mode: RecordMode) => void;
  onChangeFeedingType: (value: FeedingType) => void;
  onChangeAmount: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onChangeBreastSide: (value: BreastSide) => void;
  onChangeFeedingNote: (value: string) => void;
  onChangeDiaperType: (value: DiaperType) => void;
  onChangeDiaperNote: (value: string) => void;
  onSubmitFeeding: () => void;
  onSubmitDiaper: () => void;
}

const RECORD_MODE_OPTIONS: Array<{
  mode: RecordMode;
  label: string;
  icon: 'bottle' | 'diaper';
  tint: string;
}> = [
  { mode: 'feeding', label: '喂奶', icon: 'bottle', tint: Colors.primary },
  { mode: 'diaper', label: '换尿裤', icon: 'diaper', tint: Colors.success },
];

const FEEDING_OPTIONS: Array<{ label: string; value: FeedingType }> = [
  { label: '瓶喂母乳', value: 'bottle_breast' },
  { label: '瓶喂奶粉', value: 'bottle_formula' },
  { label: '亲喂', value: 'direct' },
];

const BREAST_SIDE_OPTIONS: Array<{ label: string; value: BreastSide }> = [
  { label: '左侧', value: 'left' },
  { label: '右侧', value: 'right' },
  { label: '双侧', value: 'both' },
];

const DIAPER_OPTIONS: Array<{ label: string; value: DiaperType }> = [
  { label: '尿了', value: 'wet' },
  { label: '拉臭臭', value: 'dirty' },
  { label: '混合', value: 'mixed' },
];

function RecordFormField({
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

function RecordTypeSwitcher({
  mode,
  onChange,
}: {
  mode: RecordMode;
  onChange: (mode: RecordMode) => void;
}) {
  return (
    <View style={styles.switcher}>
      {RECORD_MODE_OPTIONS.map((option) => {
        const active = option.mode === mode;

        return (
          <TouchableOpacity
            key={option.mode}
            style={[styles.switchButton, active && styles.switchButtonActive]}
            activeOpacity={0.84}
            onPress={() => onChange(option.mode)}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <RecordIcon type={option.icon} color={option.tint} size={18} />
            </View>
            <Text style={[styles.switchLabel, active && styles.switchLabelActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function RecordEntryPanel({
  mode,
  feedingType,
  amount,
  duration,
  breastSide,
  feedingNote,
  diaperType,
  diaperNote,
  saving,
  canSaveFeeding,
  onChangeMode,
  onChangeFeedingType,
  onChangeAmount,
  onChangeDuration,
  onChangeBreastSide,
  onChangeFeedingNote,
  onChangeDiaperType,
  onChangeDiaperNote,
  onSubmitFeeding,
  onSubmitDiaper,
}: RecordEntryPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelEyebrow}>快速记录</Text>
        <Text style={styles.panelDescription}>直接切换记录类型，不再经过中间选择页。</Text>
      </View>

      <RecordTypeSwitcher mode={mode} onChange={onChangeMode} />

      {mode === 'feeding' ? (
        <View>
          <Text style={styles.sectionTitle}>喂奶记录</Text>
          <Text style={styles.sectionDescription}>先选喂养方式，再填最必要的信息。</Text>

          <View style={styles.segmentRow}>
            {FEEDING_OPTIONS.map((option) => {
              const active = feedingType === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.segmentButton, active && styles.segmentButtonActive]}
                  activeOpacity={0.84}
                  onPress={() => onChangeFeedingType(option.value)}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {feedingType === 'direct' ? (
            <>
              <RecordFormField
                label="亲喂时长"
                placeholder="例如 15"
                value={duration}
                onChangeText={onChangeDuration}
                keyboardType="number-pad"
                suffix="min"
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>喂养侧别</Text>
                <View style={styles.segmentRow}>
                  {BREAST_SIDE_OPTIONS.map((option) => {
                    const active = breastSide === option.value;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.segmentButton, active && styles.segmentButtonActive]}
                        activeOpacity={0.84}
                        onPress={() => onChangeBreastSide(option.value)}
                      >
                        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          ) : null}

          {feedingType && feedingType !== 'direct' ? (
            <RecordFormField
              label="奶量"
              placeholder="例如 120"
              value={amount}
              onChangeText={onChangeAmount}
              keyboardType="number-pad"
              suffix="ml"
            />
          ) : null}

          <RecordFormField
            label="备注"
            placeholder="例如 刚睡醒、喝得很快、外出中"
            value={feedingNote}
            onChangeText={onChangeFeedingNote}
          />

          <TouchableOpacity
            style={[styles.primaryButton, (!canSaveFeeding || saving) && styles.primaryButtonDisabled]}
            disabled={!canSaveFeeding || saving}
            onPress={onSubmitFeeding}
          >
            <Text style={styles.primaryButtonText}>{saving ? '保存中...' : '保存喂奶记录'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>换尿裤记录</Text>
          <Text style={styles.sectionDescription}>保留最常用的选项，减少操作步骤。</Text>

          <View style={styles.segmentRow}>
            {DIAPER_OPTIONS.map((option) => {
              const active = diaperType === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.segmentButton,
                    active && styles.diaperSegmentButtonActive,
                  ]}
                  activeOpacity={0.84}
                  onPress={() => onChangeDiaperType(option.value)}
                >
                  <Text
                    style={[styles.segmentText, active && styles.diaperSegmentTextActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <RecordFormField
            label="备注"
            placeholder="例如 颜色正常、外出前更换"
            value={diaperNote}
            onChangeText={onChangeDiaperNote}
          />

          <TouchableOpacity
            style={[styles.primaryButton, (!diaperType || saving) && styles.primaryButtonDisabled]}
            disabled={!diaperType || saving}
            onPress={onSubmitDiaper}
          >
            <Text style={styles.primaryButtonText}>{saving ? '保存中...' : '保存换尿裤记录'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  panelHeader: {
    marginBottom: Spacing.lg,
  },
  panelEyebrow: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  panelDescription: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  switcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: 4,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardMuted,
    marginBottom: Spacing.xl,
  },
  switchButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  switchButtonActive: {
    backgroundColor: Colors.card,
    ...Shadows.soft,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSoft,
  },
  iconWrapActive: {
    backgroundColor: Colors.cardMuted,
  },
  switchLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  switchLabelActive: {
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
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
  diaperSegmentButtonActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.success,
  },
  segmentText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  diaperSegmentTextActive: {
    color: Colors.success,
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
});
