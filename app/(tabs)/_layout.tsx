import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 20,
          height: 82,
          paddingTop: 10,
          paddingBottom: 14,
          backgroundColor: Colors.card,
          borderTopWidth: 0,
          borderRadius: BorderRadius.xl,
          ...Shadows.card,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        sceneStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '\u9996\u9875',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: '\u7edf\u8ba1',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 66,
                height: 66,
                borderRadius: 33,
                backgroundColor: focused ? '#FF5E94' : Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -26,
                ...Shadows.card,
              }}
            >
              <Ionicons name="add" size={34} color={Colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{
          title: '\u77e5\u8bc6',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '\u6211\u7684',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
