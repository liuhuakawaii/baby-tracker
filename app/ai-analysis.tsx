import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../src/stores/babyStore';
import { useRecordStore } from '../src/stores/recordStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../src/constants/theme';
import { Record } from '../src/constants/types';
import { buildDailySummary } from '../src/utils/records';

function buildPrompt(
  baby: { name: string; birthday: string; height: number; weight: number; gender: 'male' | 'female' },
  records: Record[]
) {
  const recentRecords = records.slice(0, 60);
  const summary = buildDailySummary(recentRecords);

  const recentLines = recentRecords
    .map((record) => {
      const time = new Date(record.created_at).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (record.type === 'feeding') {
        if (record.feeding_type === 'direct') {
          const side = record.breast_side === 'left' ? '\u5de6\u4fa7' : record.breast_side === 'right' ? '\u53f3\u4fa7' : '\u53cc\u4fa7';
          return `- ${time}\uff1a\u4eb2\u5582\uff0c${side}\uff0c${record.duration_min ?? 0} \u5206\u949f`;
        }

        const type = record.feeding_type === 'bottle_breast' ? '\u74f6\u5582\u6bcd\u4e73' : '\u74f6\u5582\u5976\u7c89';
        return `- ${time}\uff1a${type}\uff0c${record.amount_ml ?? 0} ml`;
      }

      const diaperType =
        record.diaper_type === 'wet'
          ? '\u5c3f\u4e86'
          : record.diaper_type === 'dirty'
            ? '\u62c9\u81ed\u81ed'
            : '\u6df7\u5408\u4fbf\u4fbf';

      return `- ${time}\uff1a${diaperType}`;
    })
    .join('\n');

  return `\u8bf7\u6839\u636e\u4ee5\u4e0b\u5b9d\u5b9d\u8fd1\u671f\u8bb0\u5f55\uff0c\u7ed9\u51fa\u6e29\u548c\u3001\u5177\u4f53\u3001\u6613\u61c2\u7684\u5582\u517b\u89c2\u5bdf\u4e0e\u5efa\u8bae\u3002

\u5b9d\u5b9d\u4fe1\u606f\uff1a
- \u6635\u79f0\uff1a${baby.name}
- \u6027\u522b\uff1a${baby.gender === 'male' ? '\u7537\u5b9d\u5b9d' : '\u5973\u5b9d\u5b9d'}
- \u751f\u65e5\uff1a${baby.birthday}
- \u8eab\u9ad8\uff1a${baby.height} cm
- \u4f53\u91cd\uff1a${baby.weight} kg

\u8fd1\u671f\u6458\u8981\uff1a
- \u5582\u517b\u6b21\u6570\uff1a${summary.feedings}
- \u74f6\u5582\u603b\u91cf\uff1a${summary.totalBottleMl} ml
- \u4eb2\u5582\u65f6\u957f\uff1a${summary.nursingMinutes} \u5206\u949f
- \u6362\u5c3f\u88e4\u6b21\u6570\uff1a${summary.diapers}

\u8fd1\u671f\u8bb0\u5f55\uff1a
${recentLines || '\u6682\u65e0\u8bb0\u5f55'}

\u8bf7\u6309\u4e0b\u9762\u7ed3\u6784\u8f93\u51fa\uff1a
1. \u4eca\u65e5\u6216\u8fd1\u671f\u5582\u517b\u8282\u594f\u89c2\u5bdf
2. \u662f\u5426\u6709\u9700\u8981\u7ee7\u7eed\u7559\u610f\u7684\u5730\u65b9
3. \u7ed9\u5bb6\u957f\u7684\u6e29\u548c\u5efa\u8bae

\u6ce8\u610f\uff1a
- \u4e0d\u8981\u5236\u9020\u6050\u614c
- \u4e0d\u8981\u66ff\u4ee3\u533b\u751f\u8bca\u65ad
- \u8bed\u8a00\u7b80\u6d01\u6e29\u67d4
- \u53ea\u7528\u4e2d\u6587\u56de\u7b54`;
}

export default function AIAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const baby = useBabyStore((state) => state.baby);
  const records = useRecordStore((state) => state.records);
  const aiConfig = useSettingsStore((state) => state.aiConfig);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasApiConfig = useMemo(() => {
    return Boolean(aiConfig.base_url && aiConfig.api_key && aiConfig.model);
  }, [aiConfig]);

  const handleAnalyze = async () => {
    if (!baby) {
      Alert.alert('\u8fd8\u6ca1\u6709\u5b9d\u5b9d\u8d44\u6599', '\u8bf7\u5148\u586b\u5199\u5b9d\u5b9d\u8d44\u6599\uff0c\u518d\u5f00\u59cb AI \u5206\u6790\u3002');
      return;
    }

    if (!hasApiConfig) {
      Alert.alert('\u8fd8\u6ca1\u6709 AI \u914d\u7f6e', '\u8bf7\u5148\u5728\u201c\u6211\u7684\u201d\u9875\u9762\u5b8c\u6210 API \u914d\u7f6e\u3002');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(`${aiConfig.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiConfig.api_key}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: 'system',
              content:
                '\u4f60\u662f\u4e00\u4f4d\u6e29\u548c\u3001\u4e13\u4e1a\u3001\u8c28\u614e\u7684\u5a74\u513f\u5582\u517b\u52a9\u624b\u3002\u4f60\u7684\u56de\u7b54\u5e94\u8be5\u6e05\u6670\u3001\u6e29\u67d4\uff0c\u4e0d\u5938\u5f20\uff0c\u4e0d\u5236\u9020\u7126\u8651\uff0c\u4e5f\u4e0d\u66ff\u4ee3\u533b\u751f\u8bca\u65ad\u3002',
            },
            {
              role: 'user',
              content: buildPrompt(baby, records),
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`\u8bf7\u6c42\u5931\u8d25\uff1a${response.status} ${responseText}`);
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('\u65e0\u6cd5\u8bfb\u53d6\u6d41\u5f0f\u54cd\u5e94');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith('data: ')) {
            continue;
          }

          const payload = trimmed.slice(6);

          if (payload === '[DONE]') {
            continue;
          }

          try {
            const json = JSON.parse(payload);
            const content = json.choices?.[0]?.delta?.content;

            if (content) {
              setResult((current) => current + content);
            }
          } catch {
            continue;
          }
        }
      }
    } catch (analysisError) {
      const message =
        analysisError instanceof Error ? analysisError.message : '\u5206\u6790\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002';
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

      {!hasApiConfig ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>{'\u8bf7\u5148\u5728\u201c\u6211\u7684\u201d\u9875\u9762\u5b8c\u6210 AI \u914d\u7f6e\u3002'}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, (loading || !hasApiConfig) && styles.primaryButtonDisabled]}
        activeOpacity={0.86}
        onPress={handleAnalyze}
        disabled={loading || !hasApiConfig}
      >
        {loading ? <ActivityIndicator color={Colors.white} /> : <Ionicons name="sparkles" size={18} color={Colors.white} />}
        <Text style={styles.primaryButtonText}>{loading ? '\u5206\u6790\u4e2d...' : '\u5f00\u59cb AI \u5206\u6790'}</Text>
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{result}</Text>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    ...Shadows.soft,
  },
  warningCard: {
    backgroundColor: '#FFF4E8',
    borderRadius: BorderRadius.lg,
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  errorCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.danger,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.soft,
  },
  resultText: {
    fontSize: FontSize.md,
    lineHeight: 26,
    color: Colors.text,
  },
});
