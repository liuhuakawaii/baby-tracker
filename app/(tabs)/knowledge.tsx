import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      {knowledgeCards.map((card) => (
        <View key={card.id} style={styles.knowledgeCard}>
          <LinearGradient
            colors={[card.tint, 'rgba(255,255,255,0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryPill}
          >
            <Text style={styles.categoryText}>{card.category}</Text>
          </LinearGradient>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>
          <View style={styles.bulletGroup}>
            {card.bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <LinearGradient
                  colors={['#FF8BA0', '#FFB88E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bulletDot}
                />
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
    gap: Spacing.xxl,
  },
  knowledgeCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.clayHighlight,
    ...Shadows.clay,
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
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
