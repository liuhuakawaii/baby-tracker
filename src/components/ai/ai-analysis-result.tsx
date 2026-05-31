import Markdown from 'react-native-markdown-display';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Colors, FontSize, Gradients, Shadows, Spacing } from '../../constants/theme';

interface AIAnalysisResultProps {
  content: string;
}

function normalizeAnalysisMarkdown(content: string) {
  return content
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/^(#{1,6})([^\s#])/gm, '$1 $2')
    .trim();
}

export function AIAnalysisResult({ content }: AIAnalysisResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerAccent}
        />
        <View>
          <Text style={styles.eyebrow}>分析结果</Text>
          <Text style={styles.title}>今日护理建议</Text>
        </View>
      </View>

      <Markdown style={markdownStyles}>{normalizeAnalysisMarkdown(content)}</Markdown>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: Colors.text,
    fontSize: FontSize.md,
    lineHeight: 25,
  },
  heading1: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    lineHeight: 34,
    fontWeight: '800',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  heading2: {
    color: Colors.text,
    fontSize: FontSize.xl,
    lineHeight: 28,
    fontWeight: '800',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  heading3: {
    color: Colors.text,
    fontSize: FontSize.lg,
    lineHeight: 26,
    fontWeight: '800',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    color: Colors.text,
    fontSize: FontSize.md,
    lineHeight: 25,
    marginTop: 0,
    marginBottom: Spacing.sm,
  },
  strong: {
    color: Colors.text,
    fontWeight: '800',
  },
  bullet_list: {
    marginTop: 0,
    marginBottom: Spacing.sm,
  },
  ordered_list: {
    marginTop: 0,
    marginBottom: Spacing.sm,
  },
  list_item: {
    marginBottom: Spacing.xs,
  },
  bullet_list_icon: {
    color: Colors.primary,
    fontSize: FontSize.md,
    lineHeight: 25,
  },
  ordered_list_icon: {
    color: Colors.primary,
    fontSize: FontSize.md,
    lineHeight: 25,
    fontWeight: '800',
  },
  hr: {
    backgroundColor: Colors.border,
    height: 1,
    marginVertical: Spacing.md,
  },
  fence: {
    backgroundColor: Colors.cardMuted,
    borderRadius: BorderRadius.md,
    color: Colors.text,
    padding: Spacing.md,
  },
  code_inline: {
    backgroundColor: Colors.cardMuted,
    color: Colors.text,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerAccent: {
    width: 8,
    height: 42,
    borderRadius: BorderRadius.full,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
});
