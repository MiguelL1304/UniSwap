import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

// Import screens for each tab
import Meetups from "../Stacks/Meetups";
import ReceivedOffers from "../Stacks/ReceivedOffers";
import SentOffers from "../Stacks/SentOffers";

const Inbox = () => {
  const Tab = createMaterialTopTabNavigator();
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: "#D4E9FA",
      },
      headerTintColor: "#3f9eeb",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 25,
      },
      headerRight: () => ( 
        <TouchableOpacity 
          style={styles.chatIcon}
          onPress={() => navigation.navigate("Messages")}
        >
          <Ionicons name="chatbubble" size={28} color="#3f9eeb" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#3f9eeb",
          tabBarInactiveTintColor: "black",
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: "white" },
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
  chatIcon: {
    padding: 5,
    paddingRight: 10,
  },
});

export default Inbox;
