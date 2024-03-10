import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Login from "../screens/Stacks/Login";
import SignUp from "../screens/Stacks/SignUp";
import Home from "../screens/Tabs/Home";
import Profile from "../screens/Tabs/Profile";
import Wishlist from "../screens/Tabs/Wishlist";
import Meetups from "../screens/Tabs/Meetups";
//import PostListing from "../screens/Tabs/CreateListing";
// import OnboardingScreen from "react-native-onboarding-swiper";
import OnboardingScreen from "../screens/Stacks/OnboardingScreen";
import UpdateProfile from "../screens/Stacks/UpdateProfile";
import ForgotPassword from "../screens/Stacks/ForgotPassword";
import CreateListing from "../screens/Stacks/CreateListing";
import { View } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Screen names
const homeName = "Home";
const profileName = "Profile";
const wishlistName = "Wishlist";
const meetupsName = "Meetups";
const postListing = "CreateListing";

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

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
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
          options={{
            headerTitle: "Update Profile",
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{
            headerTitle: "Reset Password",
          }}
        />
        <Stack.Screen
          name="CreateListing"
          component={CreateListing}
          options={{
            headerTitle: "Create Listing",
            headerBackVisible: false,
          }}
        />
      </Stack.Navigator>
    );
  }

  function MyTabs() {
    return (
      <Tab.Navigator
        initialRouteName={homeName}
        screenOptions={({ route }) => ({
          tabBarShowLabel: false, // "home", "wishlist", etc. do not appear
          //tabBarActiveBackgroundColor: "#d4e9fa",
          //tabBarLabelPosition: "absolute",
          tabBarActiveTintColor: "#3f9eeb",
          tabBarIcon: ({ focused, size, color }) => {
            let iconName;
            let rn = route.name;

            if (rn === homeName) {
              iconName = focused ? "home" : "home-outline";
            } else if (rn === profileName) {
              iconName = focused ? "person" : "person-outline";
            } else if (rn === wishlistName) {
              iconName = focused ? "heart" : "heart-outline";
            } else if (rn === meetupsName) {
              iconName = focused
                ? "calendar-number"
                : "calendar-number-outline";
            }

            return <Ionicons name={iconName} size={size} color={"#3f9eeb"} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Wishlist" component={Wishlist} />
        <Tab.Screen
          name="CreateListing"
          component={CreateListing}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  bottom: 15, // Position the icon above the tab bar for emphasis
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused ? "#3f9eeb" : "#fff",
                  borderRadius: 50,
                  width: 60, // Larger width for the floating effect
                  height: 60, // Larger height for the floating effect
                  elevation: 5, // Add shadow for better visibility on Android
                  shadowColor: "#000", // Shadow color for iOS
                  shadowOffset: { width: 0, height: 2 }, // Shadow position for iOS
                  shadowOpacity: 0.5, // Shadow opacity for iOS
                  shadowRadius: 3.84, // Shadow blur radius for iOS
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={60} // Larger icon size
                  color={focused ? "#fff" : "#3f9eeb"}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen name="Meetups" component={Meetups} />
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
