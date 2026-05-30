import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { knowledgeCards } from '../../src/constants/content';
import { BorderRadius, Colors, FontSize, Shadows, Spacing } from '../../src/constants/theme';

export default function KnowledgeScreen() {
  const insets = useSafeAreaInsets();

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
      <View style={styles.header}>
        <Text style={styles.title}>{'\u77e5\u8bc6'}</Text>
      </View>

      {knowledgeCards.map((card) => (
        <View key={card.id} style={styles.knowledgeCard}>
          <View style={[styles.categoryPill, { backgroundColor: card.tint }]}>
            <Text style={styles.categoryText}>{card.category}</Text>
          </View>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>
          <View style={styles.bulletGroup}>
            {card.bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
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
  header: {
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: 36,
    fontWeight: '700',
    color: Colors.text,
  },
  knowledgeCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  bulletGroup: {
    gap: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
