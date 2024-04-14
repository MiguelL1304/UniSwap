import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import Login from "../screens/Stacks/Login";
import SignUp from "../screens/Stacks/SignUp";
import Home from "../screens/Tabs/Home";
import Profile from "../screens/Stacks/Profile";
import Wishlist from "../screens/Tabs/Wishlist";
import Inbox from "../screens/Tabs/Inbox";
import Meetups from "../screens/Stacks/Meetups";
import ReceivedOffers from "../screens/Stacks/ReceivedOffers";
import SentOffers from "../screens/Stacks/SentOffers";
//import PostListing from "../screens/Tabs/CreateListing";
// import OnboardingScreen from "react-native-onboarding-swiper";
import OnboardingScreen from "../screens/Stacks/OnboardingScreen";
import UpdateProfile from "../screens/Stacks/UpdateProfile";
import ForgotPassword from "../screens/Stacks/ForgotPassword";
import CreateListing from "../screens/Stacks/CreateListing";
import EditListing from "../screens/Stacks/EditListing";
import Listing from "../screens/Stacks/Listing";
import { View } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Overview from "../screens/Tabs/Overview";
import Selling from "../screens/Stacks/Selling";
import Bought from "../screens/Stacks/Bought";
import Trade from "../screens/Stacks/Trade";
import SellerProfile from "../screens/Stacks/SellerProfile";
import Offer from "../screens/Stacks/Offer";
import Bag from "../screens/Components/Bag/BagScreen";
import AnswerOffer from "../screens/Stacks/AnswerOffer";
import Chat from "../screens/Stacks/Chat";
import Messages from "../screens/Stacks/Messages";



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Screen names
const homeName = "Home";
const profileName = "Profile";
const wishlistName = "Wishlist";
const inboxName = "Inbox";
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
        <Stack.Screen
          name="EditListing"
          component={EditListing}
          options={{
            headerTitle: "Edit Listing",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Meetups"
          component={Meetups}
          options={{
          headerTitle: "Meetups",
          }}
        />
        <Stack.Screen
          name="ReceivedOffers"
          component={ReceivedOffers}
          options={{
          headerTitle: "ReceivedOffers",
          }}
        />
        <Stack.Screen
          name="SentOffers"
          component={SentOffers}
          options={{
          headerTitle: "SentOffers",
          }}
        />
        <Stack.Screen
          name="Selling"
          component={Selling}
          options={{
          headerTitle: "Selling",
          }}
        />
         <Stack.Screen
          name="Bought"
          component={Bought}
          options={{
          headerTitle: "Bought",
          }}
        />
         <Stack.Screen
          name="Trade"
          component={Trade}
          options={{
          headerTitle: "Settings",
          }}
        />
         <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerTitle: "Profile",
         }}
        />
         <Stack.Screen
          name="Listing"
          component={Listing}
          options={{
            headerTitle: "Listing",
            headerBackVisible: true,
          }}
        />
        <Stack.Screen
          name="SellerProfile"
          component={SellerProfile}
          options={{
            headerTitle: "Seller Profile",
            headerBackVisible: true,
          }}
        />
        <Stack.Screen
          name="Offer"
          component={Offer}
          options={{
            headerTitle: "Offer",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="AnswerOffer"
          component={AnswerOffer}
          options={{
            headerTitle: "Offer Details",
            headerBackVisible: true,
          }}
        />
        <Stack.Screen
          name="Bag"
          component={Bag}
          options={{
            headerTitle: "Bag",
            headerBackVisible: true,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          // options={{
          //   headerTitle: "Chat",
          //   headerBackVisible: true,
          // }}
        />
        <Stack.Screen
          name="Messages"
          component={Messages}
          // options={{
          //   headerTitle: "Messages",
          //   headerBackVisible: true,
          // }}
        />
      </Stack.Navigator>
    );
  }

  function MyTabs() {
    const navigation = useNavigation();

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
            } else if (rn === inboxName) {
              iconName = focused ? "mail" : "mail-outline";
            }

            return <Ionicons name={iconName} size={size} color={"#3f9eeb"} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen name="Wishlist" component={Wishlist} />
        <Tab.Screen
          name="CreateListing"
          options={{
            tabBarIcon: ({ focused }) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("CreateListing");
                }}
                style={{
                  bottom: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused ? "#3f9eeb" : "#fff",
                  borderRadius: 50,
                  width: 60,
                  height: 60,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 3.84,
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={60} // Larger icon size
                  color={focused ? "#fff" : "#3f9eeb"}
                />
              </TouchableOpacity>
            ),
          }}
        >
          {() => null}
        </Tab.Screen>
        <Tab.Screen name="Inbox" component={Inbox} />
        <Tab.Screen name="Profile" component={Overview} options={{
            headerShown: false,
          }} />
      </Tab.Navigator>
    );
  }


  return (
    <GestureHandlerRootView style={{ flex:1 }}>
      <BottomSheetModalProvider>
        <NavigationContainer>
          <MyStack />
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>  
  );
}