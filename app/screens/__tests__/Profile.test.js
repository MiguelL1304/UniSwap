import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "../Tabs/Profile";

// Mock AsyncStorage functions
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("<Profile />", () => {
  test("renders all components", () => {
    const { getByText } = render(
      <NavigationContainer>
        <Profile />
      </NavigationContainer>
    );

    // Check if the email text is rendered
    expect(getByText("Email:")).toBeTruthy();

    // Check if the Update Profile button is rendered
    expect(getByText("Update Profile")).toBeTruthy();

    // Check if the Sign Out button is rendered
    expect(getByText("Sign Out")).toBeTruthy();
  });
});
