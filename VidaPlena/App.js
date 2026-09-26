import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import './src/i18n/config';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { TherapyScreen } from './src/screens/TherapyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
    </Stack.Navigator>
  );
};

const TherapyStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TherapyList"
        component={TherapyScreen}
      />
    </Stack.Navigator>
  );
};

const BottomTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E5DD',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#2D7A4A',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Therapy"
        component={TherapyStack}
        options={{
          title: t('tabs.therapy'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsPlaceholder}
        options={{
          title: t('tabs.bookings'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityPlaceholder}
        options={{
          title: t('tabs.community'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePlaceholder}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const SessionsPlaceholder = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>📅 {t('tabs.bookings')}</Text>
      <Text style={styles.placeholderSubtext}>Coming Soon</Text>
    </View>
  );
};

const CommunityPlaceholder = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>👥 {t('tabs.community')}</Text>
      <Text style={styles.placeholderSubtext}>Coming Soon</Text>
    </View>
  );
};

const ProfilePlaceholder = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>👤 {t('tabs.profile')}</Text>
      <Text style={styles.placeholderSubtext}>Coming Soon</Text>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBF8',
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#999',
  },
});
