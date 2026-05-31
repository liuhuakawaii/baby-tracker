import { useEffect, useMemo, useState } from 'react';
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
import { useSettingsStore } from '../../src/stores/settingsStore';
import { Animation, BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../../src/constants/theme';
import { getAgeLabel } from '../../src/utils/records';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

  const saveScale = useSharedValue(1);
  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  useEffect(() => {
    setBaseUrl(aiConfig.base_url);
    setApiKey(aiConfig.api_key);
    setModel(aiConfig.model);
  }, [aiConfig]);

  const babyInfo = useMemo(() => {
    if (!baby) {
      return '还没有填写宝宝资料';
    }

    return `${getAgeLabel(baby.birthday)} · ${baby.weight} kg · ${baby.height} cm`;
  }, [baby]);

  const handleSave = async () => {
    await saveAIConfig({
      base_url: baseUrl.trim(),
      api_key: apiKey.trim(),
      model: model.trim(),
    });
    Alert.alert('已保存', 'AI 配置已经更新。');
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
        <View style={styles.profileAvatarShell}>
          <LinearGradient
            colors={Gradients.softPink}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileAvatarGradient}
          >
            <View style={styles.profileAvatar}>
              <Ionicons name="happy-outline" size={26} color={Colors.primary} />
            </View>
          </LinearGradient>
        </View>
        <View style={styles.profileBody}>
          <Text style={styles.profileEyebrow}>宝宝资料</Text>
          <Text style={styles.profileName}>{baby?.name ?? '去添加宝宝资料'}</Text>
          <Text style={styles.profileMeta}>{babyInfo}</Text>
        </View>
        <View style={styles.profileArrowWrap}>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </View>
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
          placeholder="API Key"
          secureTextEntry
        />
        <SettingsField
          label="模型"
          value={model}
          onChangeText={setModel}
          placeholder="mimo-v2.5-pro"
        />

        <Animated.View style={saveAnimatedStyle}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => {
              saveScale.value = withSpring(Animation.pressScale, Animation.springConfig);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onPressOut={() => {
              saveScale.value = withSpring(1, Animation.springConfig);
            }}
            onPress={handleSave}
          >
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>保存 AI 配置</Text>
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
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
  },
  profileAvatarShell: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    ...Shadows.subtle,
  },
  profileAvatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
    borderWidth: 1.5,
    borderColor: Colors.clayHighlight,
  },
  profileBody: {
    flex: 1,
  },
  profileEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  profileMeta: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  profileArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardMuted,
    marginLeft: Spacing.md,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
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
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1.5,
    borderColor: Colors.clayHighlight,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  primaryButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
