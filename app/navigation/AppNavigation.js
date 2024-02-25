import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

import Login from "../screens/Stacks/Login";
import SignUp from "../screens/Stacks/SignUp";
import Home from "../screens/Tabs/Home";
import Profile from "../screens/Tabs/Profile";
import Wishlist from "../screens/Tabs/Wishlist";
import Cart from "../screens/Tabs/Cart";
// import OnboardingScreen from "react-native-onboarding-swiper";
import OnboardingScreen from "../screens/Stacks/OnboardingScreen";
import UpdateProfile from "../screens/Stacks/UpdateProfile";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  function MyStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
          backgroundColor: "#d4e9fa", // Set the header background color
        },
        headerTintColor: "#3f9eeb", // Set the header text color
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 25,
        },
      }}
      >
        <Stack.Screen
          name="OnboardingScreen"
          component={OnboardingScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
        />
        <Stack.Screen
          name="Tabs"
          component={MyTabs}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UpdateProfile"
          component={UpdateProfile}
        />
      </Stack.Navigator>
    );
  }

  function MyTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Wishlist" component={Wishlist} />
        <Tab.Screen name="Cart" component={Cart} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}
