import React from "react";
import { View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";

// Import screens for each tab
import Meetups from "../Stacks/Meetups";
import ReceivedOffers from "../Stacks/ReceivedOffers";
import SentOffers from "../Stacks/SentOffers";

const Inbox = () => {
  const Tab = createMaterialTopTabNavigator();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#3f9eeb",
          tabBarInactiveTintColor: "black",
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: "#e6f2ff" },
          tabBarIndicatorStyle: { backgroundColor: "#3f9eeb"},
        })}
      >
      <Tab.Screen name="Meetups" component={Meetups} />
      <Tab.Screen name="Received Offers" component={ReceivedOffers} />
      <Tab.Screen name="Sent Offers" component={SentOffers} />
    </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: "#3f9eeb",
  },
});

export default Inbox;
