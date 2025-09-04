import { Tabs } from "expo-router";
import { BarChart3, PlusCircle, MessageCircle, User } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 88,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "ダッシュボード",
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "記録",
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI相談",
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
