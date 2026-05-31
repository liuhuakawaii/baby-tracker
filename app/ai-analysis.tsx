import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAIAnalysisStore } from '../src/stores/aiAnalysisStore';
import { useBabyStore } from '../src/stores/babyStore';
import { useRecordStore } from '../src/stores/recordStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { Animation, BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../src/constants/theme';
import { requestAIAnalysis } from '../src/utils/aiAnalysis';
import { buildDailySummary, getTodayRecords } from '../src/utils/records';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatHistoryTime(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AIAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const records = useRecordStore((state) => state.records);
  const aiConfig = useSettingsStore((state) => state.aiConfig);
  const history = useAIAnalysisStore((state) => state.history);
  const addHistoryItem = useAIAnalysisStore((state) => state.addHistoryItem);
  const setActiveResultId = useAIAnalysisStore((state) => state.setActiveResultId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customRequest, setCustomRequest] = useState('');
  const todayRecords = useMemo(() => getTodayRecords(records), [records]);
  const todaySummary = useMemo(() => buildDailySummary(todayRecords), [todayRecords]);

  const hasApiConfig = useMemo(() => {
    return Boolean(aiConfig.base_url && aiConfig.api_key && aiConfig.model);
  }, [aiConfig]);

  const analyzeScale = useSharedValue(1);
  const analyzeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: analyzeScale.value }],
  }));

  const handleAnalyze = async () => {
    if (!baby) {
      Alert.alert('还没有宝宝资料', '请先填写宝宝资料，再开始 AI 分析。');
      return;
    }

    if (!hasApiConfig) {
      Alert.alert('还没有 AI 配置', '请先在"我的"页面完成 API 配置。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let analysisContent = '';

      await requestAIAnalysis({
        aiConfig,
        baby,
        records,
        customRequest,
        onToken: (content) => {
          analysisContent += content;
        },
      });

      const resultId = createHistoryId();
      await addHistoryItem({
        id: resultId,
        created_at: new Date().toISOString(),
        summary: todaySummary,
        custom_request: customRequest.trim() || undefined,
        content: analysisContent,
      });
      router.push({ pathname: '/ai-analysis-result', params: { id: resultId } });
    } catch (analysisError) {
      const message =
        analysisError instanceof Error ? analysisError.message : '分析失败，请稍后重试。';
      setError(message);
    } finally {
      setLoading(false);
    }
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

      <View style={styles.introCard}>
        <Text style={styles.introTitle}>AI 今日护理分析</Text>
        <Text style={styles.introDescription}>
          结合宝宝基础信息和今天的喂奶、排便记录，给出喂养节奏分析、观察重点和可执行建议。
        </Text>
        <View style={styles.introMetaRow}>
          <LinearGradient
            colors={[Colors.cardMuted, 'rgba(255,249,245,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.introMetaPill}
          >
            <Text style={styles.introMetaText}>{`喂养 ${todaySummary.feedings} 次`}</Text>
          </LinearGradient>
          <LinearGradient
            colors={[Colors.cardMuted, 'rgba(255,249,245,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.introMetaPill}
          >
            <Text style={styles.introMetaText}>{`换尿裤 ${todaySummary.diapers} 次`}</Text>
          </LinearGradient>
          <LinearGradient
            colors={[Colors.cardMuted, 'rgba(255,249,245,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.introMetaPill}
          >
            <Text style={styles.introMetaText}>{`瓶喂 ${todaySummary.totalBottleMl} ml`}</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.customPromptCard}>
        <View style={styles.customPromptHeader}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
          <Text style={styles.customPromptTitle}>补充要求</Text>
        </View>
        <TextInput
          style={styles.customPromptInput}
          value={customRequest}
          onChangeText={setCustomRequest}
          placeholder="例如：重点看奶量是否偏少。"
          placeholderTextColor={Colors.textTertiary}
          multiline
          textAlignVertical="top"
        />
      </View>

      {!hasApiConfig ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>请先在"我的"页面完成 AI 配置。</Text>
        </View>
      ) : null}

      <Animated.View style={analyzeAnimatedStyle}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => {
            analyzeScale.value = withSpring(Animation.pressScale, Animation.springConfig);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          onPressOut={() => {
            analyzeScale.value = withSpring(1, Animation.springConfig);
          }}
          onPress={handleAnalyze}
          disabled={loading || !hasApiConfig}
        >
          <LinearGradient
            colors={loading || !hasApiConfig ? (['#D4D4D4', '#D4D4D4'] as [string, string]) : Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            {loading ? <ActivityIndicator color={Colors.white} /> : <Ionicons name="sparkles" size={18} color={Colors.white} />}
            <Text style={styles.primaryButtonText}>{loading ? '分析中...' : '开始 AI 分析'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>历史分析</Text>
        {history.length ? (
          <View style={styles.historyList}>
            {history.slice(0, 8).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                activeOpacity={0.82}
                onPress={() => {
                  setActiveResultId(item.id);
                  router.push({ pathname: '/ai-analysis-result', params: { id: item.id } });
                }}
              >
                <View style={styles.historyContent}>
                  <Text style={styles.historyTime}>{formatHistoryTime(item.created_at)}</Text>
                  <Text style={styles.historyMeta}>
                    {`喂养 ${item.summary.feedings} 次 · 瓶喂 ${item.summary.totalBottleMl} ml · 尿裤 ${item.summary.diapers} 次`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>还没有历史分析</Text>
          </View>
        )}
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
  introCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
  },
  introTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  introDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  introMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  introMetaPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  introMetaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  customPromptCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.soft,
  },
  customPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  customPromptTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  customPromptInput: {
    minHeight: 72,
    maxHeight: 104,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1.5,
    borderColor: Colors.clayHighlight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.text,
  },
  warningCard: {
    backgroundColor: '#FFF4E8',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  warningText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: '#B7782B',
  },
  primaryButton: {
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  errorCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.danger,
  },
  historySection: {
    gap: Spacing.md,
  },
  historyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  historyList: {
    gap: Spacing.sm,
  },
  historyItem: {
    minHeight: 68,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  historyContent: {
    flex: 1,
  },
  historyTime: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyHistory: {
    minHeight: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
  },
  emptyHistoryText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
});
