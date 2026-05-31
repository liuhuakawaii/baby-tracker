import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../src/stores/babyStore';
import { useRecordStore } from '../src/stores/recordStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../src/constants/theme';
import { Record } from '../src/constants/types';
import { buildDailySummary, formatTime, getDateKey, getTodayRecords } from '../src/utils/records';

function buildPrompt(
  baby: { name: string; birthday: string; height: number; weight: number; gender: 'male' | 'female' },
  records: Record[],
  customRequest: string
) {
  const todayRecords = getTodayRecords(records);
  const todaySummary = buildDailySummary(todayRecords);
  const todayKey = getDateKey(new Date().toISOString());
  const bottleMilkRecords = todayRecords.filter(
    (record) => record.type === 'feeding' && record.feeding_type !== 'direct'
  );
  const directFeedRecords = todayRecords.filter(
    (record) => record.type === 'feeding' && record.feeding_type === 'direct'
  );
  const diaperRecords = todayRecords.filter((record) => record.type === 'diaper');

  const todayTimeline = todayRecords
    .map((record) => {
      const time = formatTime(record.created_at);

      if (record.type === 'feeding') {
        if (record.feeding_type === 'direct') {
          const side =
            record.breast_side === 'left'
              ? '\u5de6\u4fa7'
              : record.breast_side === 'right'
                ? '\u53f3\u4fa7'
                : '\u53cc\u4fa7';

          return `- ${time}\uff1a\u4eb2\u5582\uff0c${side}\uff0c${record.duration_min ?? 0} \u5206\u949f${record.note ? `\uff0c\u5907\u6ce8\uff1a${record.note}` : ''}`;
        }

        const feedingLabel =
          record.feeding_type === 'bottle_breast' ? '\u74f6\u5582\u6bcd\u4e73' : '\u74f6\u5582\u5976\u7c89';

        return `- ${time}\uff1a${feedingLabel}\uff0c${record.amount_ml ?? 0} ml${record.note ? `\uff0c\u5907\u6ce8\uff1a${record.note}` : ''}`;
      }

      const diaperLabel =
        record.diaper_type === 'wet'
          ? '\u5c3f\u5e03\u6e7f'
          : record.diaper_type === 'dirty'
            ? '\u5927\u4fbf'
            : '\u5c3f\u4fbf\u6df7\u5408';

      return `- ${time}\uff1a${diaperLabel}${record.note ? `\uff0c\u5907\u6ce8\uff1a${record.note}` : ''}`;
    })
    .join('\n');

  const bottleMilkSummary = bottleMilkRecords.length
    ? bottleMilkRecords
        .map((record) => {
          const feedingLabel =
            record.feeding_type === 'bottle_breast' ? '\u6bcd\u4e73' : '\u5976\u7c89';
          return `${formatTime(record.created_at)} ${feedingLabel} ${record.amount_ml ?? 0} ml`;
        })
        .join('\n')
    : '\u4eca\u5929\u6ca1\u6709\u74f6\u5582\u8bb0\u5f55';

  const directFeedSummary = directFeedRecords.length
    ? directFeedRecords
        .map((record) => {
          const side =
            record.breast_side === 'left'
              ? '\u5de6\u4fa7'
              : record.breast_side === 'right'
                ? '\u53f3\u4fa7'
                : '\u53cc\u4fa7';
          return `${formatTime(record.created_at)} ${side} ${record.duration_min ?? 0} \u5206\u949f`;
        })
        .join('\n')
    : '\u4eca\u5929\u6ca1\u6709\u4eb2\u5582\u8bb0\u5f55';

  const diaperSummary = diaperRecords.length
    ? diaperRecords
        .map((record) => {
          const diaperLabel =
            record.diaper_type === 'wet'
              ? '\u5c3f\u5e03\u6e7f'
              : record.diaper_type === 'dirty'
                ? '\u5927\u4fbf'
                : '\u5c3f\u4fbf\u6df7\u5408';
          return `${formatTime(record.created_at)} ${diaperLabel}`;
        })
        .join('\n')
    : '\u4eca\u5929\u6ca1\u6709\u6362\u5c3f\u88e4\u8bb0\u5f55';

  const customRequestSection = customRequest.trim()
    ? `\n\n\u5bb6\u957f\u989d\u5916\u5173\u6ce8\uff1a\n${customRequest.trim()}\n\n\u8bf7\u5728\u4fdd\u6301\u4e0a\u8ff0\u56db\u4e2a\u8f93\u51fa\u7ed3\u6784\u4e0d\u53d8\u7684\u524d\u63d0\u4e0b\uff0c\u4f18\u5148\u56de\u5e94\u8fd9\u4e2a\u989d\u5916\u5173\u6ce8\u70b9\u3002`
    : '';

  return `\u8bf7\u4f60\u4f5c\u4e3a\u5a74\u513f\u5582\u517b\u4e0e\u65e5\u5e38\u62a4\u7406\u5206\u6790\u52a9\u624b\uff0c\u6839\u636e\u5b9d\u5b9d\u7684\u57fa\u672c\u8d44\u6599\u548c\u4eca\u5929\u7684\u8bb0\u5f55\uff0c\u7ed9\u51fa\u6709\u5b9e\u8d28\u5185\u5bb9\u7684\u5206\u6790\u3001\u5efa\u8bae\u548c\u9700\u8981\u7559\u610f\u7684\u4e8b\u9879\u3002

\u5b9d\u5b9d\u4fe1\u606f\uff1a
- \u6635\u79f0\uff1a${baby.name}
- \u6027\u522b\uff1a${baby.gender === 'male' ? '\u7537\u5b9d\u5b9d' : '\u5973\u5b9d\u5b9d'}
- \u751f\u65e5\uff1a${baby.birthday}
- \u8eab\u9ad8\uff1a${baby.height} cm
- \u4f53\u91cd\uff1a${baby.weight} kg

\u5206\u6790\u65e5\u671f\uff1a${todayKey}

\u4eca\u65e5\u6458\u8981\uff1a
- \u603b\u5582\u517b\u6b21\u6570\uff1a${todaySummary.feedings}
- \u74f6\u5582\u603b\u91cf\uff1a${todaySummary.totalBottleMl} ml
- \u4eb2\u5582\u603b\u65f6\u957f\uff1a${todaySummary.nursingMinutes} \u5206\u949f
- \u6362\u5c3f\u88e4\u603b\u6b21\u6570\uff1a${todaySummary.diapers}
- \u5c3f\u5e03\u6e7f\uff1a${todaySummary.wetDiapers} \u6b21
- \u5927\u4fbf\uff1a${todaySummary.dirtyDiapers} \u6b21
- \u6df7\u5408\u4fbf\uff1a${todaySummary.mixedDiapers} \u6b21

\u4eca\u65e5\u74f6\u5582\u8bb0\u5f55\uff1a
${bottleMilkSummary}

\u4eca\u65e5\u4eb2\u5582\u8bb0\u5f55\uff1a
${directFeedSummary}

\u4eca\u65e5\u6392\u5c3f\u6392\u4fbf\u8bb0\u5f55\uff1a
${diaperSummary}

\u4eca\u65e5\u65f6\u95f4\u7ebf\uff1a
${todayTimeline || '\u4eca\u5929\u8fd8\u6ca1\u6709\u4efb\u4f55\u8bb0\u5f55'}

\u8bf7\u4e25\u683c\u6309\u4e0b\u9762\u7ed3\u6784\u8f93\u51fa\uff1a
1. \u4eca\u5929\u7684\u5582\u517b\u60c5\u51b5\u5206\u6790
   \u91cd\u70b9\u5206\u6790\u5582\u517b\u9891\u6b21\u3001\u6bcf\u6b21\u5976\u91cf/\u65f6\u957f\u3001\u7ec8\u65e5\u8282\u594f\u662f\u5426\u5408\u7406\u3002
2. \u4eca\u5929\u7684\u6392\u5c3f\u6392\u4fbf\u60c5\u51b5\u5206\u6790
   \u7ed3\u5408\u6362\u5c3f\u88e4\u6b21\u6570\u3001\u5c3f\u5e03/\u5927\u4fbf\u8bb0\u5f55\uff0c\u5224\u65ad\u662f\u5426\u6709\u503c\u5f97\u7559\u610f\u7684\u4fe1\u53f7\u3002
3. \u7ed9\u5bb6\u957f\u7684\u5177\u4f53\u5efa\u8bae
   \u8981\u7ed9\u51fa\u53ef\u6267\u884c\u7684\u6307\u5bfc\uff0c\u4f8b\u5982\u4e0b\u4e00\u6b21\u5582\u517b\u65f6\u53ef\u4ee5\u89c2\u5bdf\u4ec0\u4e48\u3001\u9700\u4e0d\u9700\u8981\u8865\u8bb0\u5f55\u4ec0\u4e48\u3001\u4eca\u5929\u540e\u534a\u5929\u5e94\u8be5\u5173\u6ce8\u54ea\u4e9b\u53d8\u5316\u3002
4. \u4eca\u5929\u9700\u8981\u7279\u522b\u7559\u610f\u7684\u4e8b\u9879
   \u5982\u679c\u6570\u636e\u4e2d\u6709\u503c\u5f97\u5173\u6ce8\u7684\u5730\u65b9\uff0c\u8bf7\u6e29\u548c\u6307\u51fa\uff0c\u4f46\u4e0d\u8981\u5236\u9020\u6050\u614c\u3002

\u5982\u679c\u4eca\u5929\u8bb0\u5f55\u8fd8\u5f88\u5c11\uff0c\u8bf7\u76f4\u63a5\u8bf4\u660e\u201c\u6837\u672c\u8fd8\u4e0d\u591f\u591a\uff0c\u6682\u65f6\u53ea\u80fd\u505a\u521d\u6b65\u89c2\u5bdf\u201d\uff0c\u4f46\u4ecd\u7136\u8981\u7ed9\u51fa\u5bb6\u957f\u4eca\u5929\u63a5\u4e0b\u6765\u80fd\u7528\u7684\u89c2\u5bdf\u5efa\u8bae\u3002

\u6ce8\u610f\uff1a
- \u4e0d\u8981\u5236\u9020\u6050\u614c
- \u4e0d\u8981\u66ff\u4ee3\u533b\u751f\u8bca\u65ad
- \u8bed\u8a00\u7b80\u6d01\u6e29\u67d4\uff0c\u4f46\u5185\u5bb9\u8981\u6709\u5b9e\u9645\u4ef7\u503c
- \u53ea\u7528\u4e2d\u6587\u56de\u7b54${customRequestSection}`;
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
  const [customRequest, setCustomRequest] = useState('');
  const todayRecords = useMemo(() => getTodayRecords(records), [records]);
  const todaySummary = useMemo(() => buildDailySummary(todayRecords), [todayRecords]);

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
              content: buildPrompt(baby, records, customRequest),
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

      <View style={styles.introCard}>
        <Text style={styles.introTitle}>AI 今日护理分析</Text>
        <Text style={styles.introDescription}>
          结合宝宝基础信息和今天的喂奶、排便记录，给出喂养节奏分析、观察重点和可执行建议。
        </Text>
        <View style={styles.introMetaRow}>
          <View style={styles.introMetaPill}>
            <Text style={styles.introMetaText}>{`喂养 ${todaySummary.feedings} 次`}</Text>
          </View>
          <View style={styles.introMetaPill}>
            <Text style={styles.introMetaText}>{`换尿裤 ${todaySummary.diapers} 次`}</Text>
          </View>
          <View style={styles.introMetaPill}>
            <Text style={styles.introMetaText}>{`瓶喂 ${todaySummary.totalBottleMl} ml`}</Text>
          </View>
        </View>
      </View>

      <View style={styles.customPromptCard}>
        <Text style={styles.customPromptTitle}>补充给 AI 的要求</Text>
        <Text style={styles.customPromptDescription}>
          可以补充这次特别想让 AI 关注的问题，例如重点分析奶量够不够、排便是否正常、是否需要提醒夜间喂养节奏。
        </Text>
        <TextInput
          style={styles.customPromptInput}
          value={customRequest}
          onChangeText={setCustomRequest}
          placeholder="例如：请重点看今天的瓶喂量是否偏少，以及大便次数是否正常。"
          placeholderTextColor={Colors.textTertiary}
          multiline
          textAlignVertical="top"
        />
      </View>

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
  introCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.soft,
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
    backgroundColor: Colors.cardMuted,
  },
  introMetaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  customPromptCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.soft,
  },
  customPromptTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  customPromptDescription: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  customPromptInput: {
    minHeight: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSoft,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.text,
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
