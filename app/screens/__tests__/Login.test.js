import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import Login from "../Stacks/Login";

// Mock AsyncStorage functions
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("<Login />", () => {
  test("renders all components", () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );

    // Check if each input field is rendered
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();

    // Check if the login button is rendered
    expect(getByText("Login")).toBeTruthy();

    // Check if the register button is rendered
    expect(getByText("Register")).toBeTruthy();
  });
});
