import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAIAnalysisStore } from '../src/stores/aiAnalysisStore';
import { useBabyStore } from '../src/stores/babyStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const loadAIHistory = useAIAnalysisStore((state) => state.loadHistory);
  const loadBaby = useBabyStore((state) => state.loadBaby);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    void loadAIHistory();
    void loadBaby();
    void loadSettings();
  }, [loadAIHistory, loadBaby, loadSettings]);

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
        <Stack.Screen
          name="ai-analysis-result"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
