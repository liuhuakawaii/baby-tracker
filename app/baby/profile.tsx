import { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBabyStore } from '../../src/stores/babyStore';
import { Gender } from '../../src/constants/types';
import { BorderRadius, Colors, FontSize, Spacing } from '../../src/constants/theme';

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
      Alert.alert('\u8bf7\u5148\u586b\u5199\u540d\u5b57', '\u7ed9\u5b9d\u5b9d\u8d77\u4e00\u4e2a\u65b9\u4fbf\u8bc6\u522b\u7684\u6635\u79f0\u5c31\u53ef\u4ee5\u3002');
      return;
    }

    if (!birthday.trim()) {
      Alert.alert('\u8bf7\u586b\u5199\u751f\u65e5', '\u5efa\u8bae\u4f7f\u7528 YYYY-MM-DD \u683c\u5f0f\u3002');
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
        <Text style={styles.fieldLabel}>{'\u5b9d\u5b9d\u6027\u522b'}</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentButton, gender === 'male' && styles.segmentButtonActive]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>{'\u7537\u5b9d\u5b9d'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, gender === 'female' && styles.segmentButtonActive]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>{'\u5973\u5b9d\u5b9d'}</Text>
          </TouchableOpacity>
        </View>

        <ProfileField
          label={'\u5b9d\u5b9d\u6635\u79f0'}
          placeholder={'\u4f8b\u5982 \u5c0f\u7c73\u3001\u7cd6\u7cd6\u3001\u5b9d\u5b9d'}
          value={name}
          onChangeText={setName}
        />
        <ProfileField
          label={'\u751f\u65e5'}
          placeholder="YYYY-MM-DD"
          value={birthday}
          onChangeText={setBirthday}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.doubleRow}>
          <View style={styles.doubleField}>
            <ProfileField
              label={'\u8eab\u9ad8'}
              placeholder="50"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.doubleField}>
            <ProfileField
              label={'\u4f53\u91cd'}
              placeholder="3.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : '\u4fdd\u5b58\u8d44\u6599'}</Text>
        </TouchableOpacity>
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
    gap: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1,
    borderColor: Colors.border,
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
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
