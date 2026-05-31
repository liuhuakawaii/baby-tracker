import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { Gender } from '../../src/constants/types';
import { Animation, BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../../src/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function ProfileField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'numbers-and-punctuation';
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function BabyProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const saveBaby = useBabyStore((state) => state.saveBaby);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthday, setBirthday] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const saveScale = useSharedValue(1);
  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  useEffect(() => {
    if (!baby) {
      return;
    }

    setName(baby.name);
    setGender(baby.gender);
    setBirthday(baby.birthday);
    setHeight(baby.height ? String(baby.height) : '');
    setWeight(baby.weight ? String(baby.weight) : '');
  }, [baby]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('请先填写名字', '给宝宝起一个方便识别的昵称就可以。');
      return;
    }

    if (!birthday.trim()) {
      Alert.alert('请填写生日', '建议使用 YYYY-MM-DD 格式。');
      return;
    }

    setSaving(true);
    await saveBaby({
      name: name.trim(),
      gender,
      birthday: birthday.trim(),
      height: height ? Number(height) : 0,
      weight: weight ? Number(weight) : 0,
    });
    setSaving(false);
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 36,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} activeOpacity={0.78} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.sectionCard}>
        <Text style={styles.fieldLabel}>宝宝性别</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentButton, gender === 'male' && styles.segmentButtonActive]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>男宝宝</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, gender === 'female' && styles.segmentButtonActive]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>女宝宝</Text>
          </TouchableOpacity>
        </View>

        <ProfileField
          label="宝宝昵称"
          placeholder="例如 小米、糖糖、宝宝"
          value={name}
          onChangeText={setName}
        />
        <ProfileField
          label="生日"
          placeholder="YYYY-MM-DD"
          value={birthday}
          onChangeText={setBirthday}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.doubleRow}>
          <View style={styles.doubleField}>
            <ProfileField
              label="身高"
              placeholder="50"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.doubleField}>
            <ProfileField
              label="体重"
              placeholder="3.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Animated.View style={saveAnimatedStyle}>
          <TouchableOpacity
            style={[saving && styles.primaryButtonDisabled]}
            disabled={saving}
            activeOpacity={0.9}
            onPressIn={() => {
              saveScale.value = withSpring(Animation.pressScale, Animation.springConfig);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            onPressOut={() => {
              saveScale.value = withSpring(1, Animation.springConfig);
            }}
            onPress={handleSave}
          >
            <LinearGradient
              colors={saving ? (['#D4D4D4', '#D4D4D4'] as [string, string]) : Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : '保存资料'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    gap: Spacing.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.subtle,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
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
  input: {
    minHeight: 52,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1.5,
    borderColor: Colors.clayHighlight,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  segmentText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  doubleField: {
    flex: 1,
  },
  primaryButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadows.button,
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
