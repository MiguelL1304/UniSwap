import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Onboarding from "react-native-onboarding-swiper";

const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      onSkip={() => navigation.replace("Login")}
      onDone={() => navigation.navigate("Login")}
      pages={[
        {
          backgroundColor: "#A2CBF8",
          image: <Image source={require("../../assets/trade.png")} />,
          title: "Swap & Sell",
          subtitle: "Trade, sell, and buy from students on campus ",
        },
        {
          backgroundColor: "#FF9494",
          image: <Image source={require("../../assets/clock.png")} />,
          title: "Schedule Meetups",
          subtitle: "Select dates, times, and locations\nthat work for you",
        },
        {
          backgroundColor: "#FFBD59",
          image: <Image source={require("../../assets/check.png")} />,
          title: "Safe on Campus",
          subtitle: "Meet at well known locations across campus",
        },
      ]}
    />
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
