import { StyleSheet, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Animation, BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../../constants/theme';
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
  isEditing?: boolean;
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

function SegmentButton({
  label,
  active,
  activeStyle,
  activeTextStyle,
  onPress,
}: {
  label: string;
  active: boolean;
  activeStyle?: object;
  activeTextStyle?: object;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <AnimatedTouchable
        style={[styles.segmentButton, active && (activeStyle || styles.segmentButtonActive)]}
        activeOpacity={0.9}
        onPressIn={() => {
          scale.value = withSpring(Animation.pressScale, Animation.springConfig);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, Animation.springConfig);
        }}
        onPress={onPress}
      >
        <Text style={[styles.segmentText, active && (activeTextStyle || styles.segmentTextActive)]}>
          {label}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
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
  isEditing = false,
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
  const saveScale = useSharedValue(1);
  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const isFeedingDisabled = !canSaveFeeding || saving;
  const isDiaperDisabled = !diaperType || saving;

  return (
    <View style={styles.panel}>
      <RecordTypeSwitcher mode={mode} onChange={onChangeMode} />

      {mode === 'feeding' ? (
        <View>
          <Text style={styles.sectionTitle}>喂奶记录</Text>

          <View style={styles.segmentRow}>
            {FEEDING_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                label={option.label}
                active={feedingType === option.value}
                onPress={() => onChangeFeedingType(option.value)}
              />
            ))}
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
                  {BREAST_SIDE_OPTIONS.map((option) => (
                    <SegmentButton
                      key={option.value}
                      label={option.label}
                      active={breastSide === option.value}
                      onPress={() => onChangeBreastSide(option.value)}
                    />
                  ))}
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

          <Animated.View style={saveAnimatedStyle}>
            <TouchableOpacity
              disabled={isFeedingDisabled}
              activeOpacity={0.9}
              onPressIn={() => {
                saveScale.value = withSpring(Animation.pressScale, Animation.springConfig);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onPressOut={() => {
                saveScale.value = withSpring(1, Animation.springConfig);
              }}
              onPress={onSubmitFeeding}
            >
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, isFeedingDisabled && styles.primaryButtonDisabled]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? '保存中...' : isEditing ? '保存喂奶修改' : '保存喂奶记录'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>换尿裤记录</Text>

          <View style={styles.segmentRow}>
            {DIAPER_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                label={option.label}
                active={diaperType === option.value}
                activeStyle={styles.diaperSegmentButtonActive}
                activeTextStyle={styles.diaperSegmentTextActive}
                onPress={() => onChangeDiaperType(option.value)}
              />
            ))}
          </View>

          <RecordFormField
            label="备注"
            placeholder="例如 颜色正常、外出前更换"
            value={diaperNote}
            onChangeText={onChangeDiaperNote}
          />

          <Animated.View style={saveAnimatedStyle}>
            <TouchableOpacity
              disabled={isDiaperDisabled}
              activeOpacity={0.9}
              onPressIn={() => {
                saveScale.value = withSpring(Animation.pressScale, Animation.springConfig);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onPressOut={() => {
                saveScale.value = withSpring(1, Animation.springConfig);
              }}
              onPress={onSubmitDiaper}
            >
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, isDiaperDisabled && styles.primaryButtonDisabled]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? '保存中...' : isEditing ? '保存换尿裤修改' : '保存换尿裤记录'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
  },
  switcher: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: 6,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardMuted,
    marginBottom: Spacing.xl,
  },
  switchButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  switchButtonActive: {
    backgroundColor: Colors.card,
    ...Shadows.subtle,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSoft,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryGlow,
  },
  switchLabel: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  switchLabelActive: {
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
    letterSpacing: -0.3,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  segmentButton: {
    minHeight: 52,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  diaperSegmentButtonActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  segmentText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  diaperSegmentTextActive: {
    color: Colors.accent,
    fontWeight: '700',
  },
  fieldBlock: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1.5,
    borderColor: Colors.clayHighlight,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '500',
  },
  inputWithSuffix: {
    paddingRight: 64,
  },
  inputSuffix: {
    position: 'absolute',
    right: Spacing.lg,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  primaryButton: {
    height: 58,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.2,
  },
});
