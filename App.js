import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./app/screens/Stacks/Login";
// import Listing from "./app/screens/Listing";
import SignUp from "./app/screens/Stacks/SignUp";
import Profile from "./app/screens/Tabs/Profile";
import OnboardingScreen from "./app/screens/Stacks/OnboardingScreen";
import { AsyncStorage } from "@react-native-async-storage/async-storage";

// import * as React from "react";
// import { StyleSheet, Text, View } from "react-native";
import AppNavigation from "./app/navigation/AppNavigation";

const Stack = createNativeStackNavigator();

// shows splash screen on first lauch only
const lauch = () => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  React.useEffect(() => {
    AsyncStorage.getItem("alreadyLaunched").then((value) => {
      if ((value = null)) {
        AsyncStorage.setItem("alreadyLaunched", "true");
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch == null) {
    return null;
  } else if (isFirstLaunch == true) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="OnboardingScreen"
            component={OnboardingScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    <Login />;
  }
  // return (
  //   <NavigationContainer>
  //       <Stack.Navigator>
  //       <Stack.Screen
  //           name="OnboardingScreen"
  //           component={OnboardingScreen}
  //           options={{
  //             headerShown: false,
  //           }}
  //         />
  //       </Stack.Navigator>
  //     </NavigationContainer>
  // )
};

export default function App() {
  return <AppNavigation />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
