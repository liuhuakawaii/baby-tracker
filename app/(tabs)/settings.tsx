import { useEffect, useMemo, useState } from 'react';
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
import { useSettingsStore } from '../../src/stores/settingsStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';
import { getAgeLabel } from '../../src/utils/records';

function SettingsField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const aiConfig = useSettingsStore((state) => state.aiConfig);
  const saveAIConfig = useSettingsStore((state) => state.saveAIConfig);

  const [baseUrl, setBaseUrl] = useState(aiConfig.base_url);
  const [apiKey, setApiKey] = useState(aiConfig.api_key);
  const [model, setModel] = useState(aiConfig.model);

  useEffect(() => {
    setBaseUrl(aiConfig.base_url);
    setApiKey(aiConfig.api_key);
    setModel(aiConfig.model);
  }, [aiConfig]);

  const babyInfo = useMemo(() => {
    if (!baby) {
      return '\u8fd8\u6ca1\u6709\u586b\u5199\u5b9d\u5b9d\u8d44\u6599';
    }

    return `${getAgeLabel(baby.birthday)} \u00b7 ${baby.weight} kg \u00b7 ${baby.height} cm`;
  }, [baby]);

  const handleSave = async () => {
    await saveAIConfig({
      base_url: baseUrl.trim(),
      api_key: apiKey.trim(),
      model: model.trim(),
    });
    Alert.alert('\u5df2\u4fdd\u5b58', 'AI \u914d\u7f6e\u5df2\u7ecf\u66f4\u65b0\u3002');
  };

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
      <TouchableOpacity style={styles.profileCard} activeOpacity={0.84} onPress={() => router.push('/baby/profile')}>
        <View style={styles.profileAvatar}>
          <Ionicons name="happy-outline" size={28} color={Colors.primary} />
        </View>
        <View style={styles.profileBody}>
          <Text style={styles.profileName}>{baby?.name ?? '\u53bb\u6dfb\u52a0\u5b9d\u5b9d\u8d44\u6599'}</Text>
          <Text style={styles.profileMeta}>{babyInfo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>AI</Text>

        <SettingsField
          label="API Base URL"
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="https://example.com/v1"
        />
        <SettingsField
          label="API Key"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="\u8f93\u5165\u4f60\u7684 API Key"
          secureTextEntry
        />
        <SettingsField
          label={'\u6a21\u578b'}
          value={model}
          onChangeText={setModel}
          placeholder="MiMo"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>{'\u4fdd\u5b58 AI \u914d\u7f6e'}</Text>
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
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
    marginRight: Spacing.lg,
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileMeta: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.soft,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
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
  primaryButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
