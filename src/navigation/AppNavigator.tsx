import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import {
  Home,
  BookOpen,
  Radio,
  Heart,
  Bookmark,
} from "lucide-react-native";

import { HomeScreen } from "../screens/HomeScreen";
import { QuranScreen } from "../screens/QuranScreen";
import { RadioScreen } from "../screens/RadioScreen";
import { AdhkarScreen } from "../screens/AdhkarScreen";
import { LibraryScreen } from "../screens/LibraryScreen";
import { SurahDetailScreen } from "../screens/SurahDetailScreen";
import { BookDetailScreen } from "../screens/BookDetailScreen";
import { QuranSearchScreen } from "../screens/QuranSearchScreen";

import { MiniAudioPlayer } from "../components/MiniAudioPlayer";
import { usePreferencesStore } from "../store/preferencesStore";
import { lightTheme, darkTheme } from "../constants/theme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  const { isDarkMode } = usePreferencesStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: "الرئيسية",
            tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
          }}
        />
        <Tab.Screen
          name="QuranTab"
          component={QuranScreen}
          options={{
            tabBarLabel: "المصحف",
            tabBarIcon: ({ color, size }) => <BookOpen size={22} color={color} />,
          }}
        />
        <Tab.Screen
          name="RadioTab"
          component={RadioScreen}
          options={{
            tabBarLabel: "الإذاعات",
            tabBarIcon: ({ color, size }) => <Radio size={22} color={color} />,
          }}
        />
        <Tab.Screen
          name="AdhkarTab"
          component={AdhkarScreen}
          options={{
            tabBarLabel: "الأذكار",
            tabBarIcon: ({ color, size }) => <Heart size={22} color={color} />,
          }}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryScreen}
          options={{
            tabBarLabel: "المعرفة",
            tabBarIcon: ({ color, size }) => <Bookmark size={22} color={color} />,
          }}
        />
      </Tab.Navigator>

      {/* Floating Mini Player above Bottom Tab Bar */}
      <MiniAudioPlayer />
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
        <Stack.Screen name="BookDetail" component={BookDetailScreen} />
        <Stack.Screen name="QuranSearch" component={QuranSearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
  },
});
