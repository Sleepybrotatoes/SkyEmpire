import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useGameStore } from '../src/store/useGameStore';
import { useGameLoop } from '../src/hooks/useGameLoop';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const hasHydrated = useGameStore((state) => state._hasHydrated);
  useGameLoop();

  if (!fontsLoaded || !hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size, focused }) => {
              const icons: Record<string, string> = {
                dashboard: 'home',
                map: 'globe-outline',
                airports: 'business',
                fleet: 'airplane',
                routes: 'navigate',
              };
              const iconName = icons[route.name] ?? 'ellipse';
              return (
                <View style={styles.iconWrapper}>
                  <Ionicons name={iconName as any} size={size} color={color} />
                  <View style={[styles.dot, focused && styles.dotActive]} />
                </View>
              );
            },
          })}
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0F1E',
  },
  tabBar: {
    backgroundColor: '#0B1224',
    borderTopColor: '#111827',
    height: 78,
    paddingBottom: 10,
    paddingTop: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: '#3B82F6',
  },
});
