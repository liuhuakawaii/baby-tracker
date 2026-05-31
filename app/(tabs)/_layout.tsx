import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Animation, BorderRadius, Colors, FontSize, Glass, Gradients, Shadows } from '../../src/constants/theme';
import { TouchableOpacity } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AddTabButton({ focused }: { focused: boolean }) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ marginTop: -30 }, animatedStyle]}>
      <AnimatedTouchable
        activeOpacity={0.9}
        onPressIn={() => {
          scale.value = withSpring(Animation.pressScale, { damping: 12, stiffness: 500, mass: 0.6 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 500, mass: 0.6 });
        }}
        onPress={() => router.push('/add')}
      >
        <LinearGradient
          colors={focused ? (['#FF6B8E', '#FF8BA0'] as [string, string]) : Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={36} color={Colors.white} />
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarBackground: () => (
          <BlurView
            intensity={Glass.blurIntensity}
            tint={Glass.tint}
            style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.xxl, overflow: 'hidden' }]}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 88,
          paddingTop: 12,
          paddingBottom: 16,
          backgroundColor: Glass.background,
          borderTopWidth: 0,
          borderRadius: BorderRadius.xxl,
          borderWidth: 1,
          borderColor: Glass.border,
          ...Shadows.card,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '700',
          marginTop: 6,
        },
        sceneStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: '月历',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <AddTabButton focused={focused} />,
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{
          title: '知识',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size + 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
});
