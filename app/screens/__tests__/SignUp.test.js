import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUp from "../Stacks/SignUp";
import { NavigationContainer } from "@react-navigation/native";

// Mock AsyncStorage functions
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Store original alert function
const originalAlert = global.alert;

beforeEach(() => {
  // Mock the alert function
  global.alert = jest.fn();
});

afterEach(() => {
  // Restore original alert function
  global.alert = originalAlert;
});

describe("<SignUp />", () => {
  test("renders all components", () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    // Check if each input field is rendered
    expect(getByPlaceholderText("First Name")).toBeTruthy();
    expect(getByPlaceholderText("Last Name")).toBeTruthy();
    expect(getByPlaceholderText("College / University")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();

    // Check if the register button is rendered
    expect(getByText("Register Account")).toBeTruthy();
  });

  describe("<SignUp />", () => {
    test("allows registration with valid .edu email", async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <NavigationContainer>
          <SignUp />
        </NavigationContainer>
      );

      // Fill out the registration form
      const firstNameInput = getByPlaceholderText("First Name");
      fireEvent.changeText(firstNameInput, "John");

      const lastNameInput = getByPlaceholderText("Last Name");
      fireEvent.changeText(lastNameInput, "Doe");

      const collegeInput = getByPlaceholderText("College / University");
      fireEvent.changeText(collegeInput, "Example University");

      const emailInput = getByPlaceholderText("Email");
      fireEvent.changeText(emailInput, "john.doe@example.edu"); // Valid .edu email

      const passwordInput = getByPlaceholderText("Password");
      fireEvent.changeText(passwordInput, "password123");

      // Click the registration button
      const registerButton = getByText("Register Account");
      fireEvent.press(registerButton);

      // Ensure no alert is shown (indicating successful registration)
      expect(global.alert).not.toHaveBeenCalled();
    });

    test("disallows registration with invalid email", async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <NavigationContainer>
          <SignUp />
        </NavigationContainer>
      );

      // Fill out the registration form with an invalid email
      const emailInput = getByPlaceholderText("Email");
      fireEvent.changeText(emailInput, "john.doe@example.com"); // Invalid email

      // Click the registration button
      const registerButton = getByText("Register Account");
      fireEvent.press(registerButton);

      // Ensure alert is shown
      expect(global.alert).toHaveBeenCalled();
    });
  });
});
