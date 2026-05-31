import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AIAnalysisResult } from '../src/components/ai/ai-analysis-result';
import { useAIAnalysisStore } from '../src/stores/aiAnalysisStore';
import { BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../src/constants/theme';

function formatResultTime(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AIAnalysisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const activeResultId = useAIAnalysisStore((state) => state.activeResultId);
  const getHistoryItem = useAIAnalysisStore((state) => state.getHistoryItem);
  const resultId = params.id ?? activeResultId;
  const result = useMemo(() => (resultId ? getHistoryItem(resultId) : null), [getHistoryItem, resultId]);

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
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.78} onPress={() => router.replace('/')}>
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} activeOpacity={0.78} onPress={() => router.replace('/')}>
          <Ionicons name="home-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.homeButtonText}>首页</Text>
        </TouchableOpacity>
      </View>

      {result ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>生成时间</Text>
            <Text style={styles.summaryTitle}>{formatResultTime(result.created_at)}</Text>
            <View style={styles.metaRow}>
              <LinearGradient
                colors={[Colors.cardMuted, 'rgba(255,249,245,0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.metaPill}
              >
                <Text style={styles.metaText}>{`喂养 ${result.summary.feedings} 次`}</Text>
              </LinearGradient>
              <LinearGradient
                colors={[Colors.cardMuted, 'rgba(255,249,245,0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.metaPill}
              >
                <Text style={styles.metaText}>{`瓶喂 ${result.summary.totalBottleMl} ml`}</Text>
              </LinearGradient>
              <LinearGradient
                colors={[Colors.cardMuted, 'rgba(255,249,245,0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.metaPill}
              >
                <Text style={styles.metaText}>{`尿裤 ${result.summary.diapers} 次`}</Text>
              </LinearGradient>
            </View>
          </View>

          <AIAnalysisResult content={result.content} />
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>没有找到这次分析</Text>
          <Text style={styles.emptyDescription}>可能是历史记录还没加载完成，或这条分析已经被清理。</Text>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.86} onPress={() => router.replace('/ai-analysis')}>
            <Text style={styles.primaryButtonText}>重新分析</Text>
          </TouchableOpacity>
        </View>
      )}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  homeButton: {
    height: 40,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.subtle,
  },
  homeButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
  },
  summaryEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  metaText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.soft,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.white,
  },
});
