import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";

// Import screens for each tab
import Meetups from "../Stacks/Meetups";
import ReceivedOffers from "../Stacks/ReceivedOffers";
import SentOffers from "../Stacks/SentOffers";

const Tab = createMaterialTopTabNavigator();

const Inbox = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Meetups"
        component={Meetups}
        listeners={{
          tabPress: () => {
            // Navigate or perform actions when Meetups tab is pressed
            // For example:
            // navigation.navigate('Meetups');
          },
        }}
      />
      <Tab.Screen name="Received Offers" component={ReceivedOffers} />
      <Tab.Screen name="Sent Offers" component={SentOffers} />
    </Tab.Navigator>
  );
};

export default Inbox;
