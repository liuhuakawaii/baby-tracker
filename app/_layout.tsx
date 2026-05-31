import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useBabyStore } from '../src/stores/babyStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const loadBaby = useBabyStore((state) => state.loadBaby);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    void loadBaby();
    void loadSettings();
  }, [loadBaby, loadSettings]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="baby/profile"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ai-analysis"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
