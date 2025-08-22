import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 88,
          paddingTop: 6,
          paddingBottom: 18,
          backgroundColor: 'white',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ transform: [{ translateY: 6 }] }}>
              <Ionicons name="home" size={32} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ transform: [{ translateY: 6 }] }}>
              <Ionicons name="chatbubbles" size={32} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ transform: [{ translateY: 6 }] }}>
              <Ionicons name="person" size={32} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}


