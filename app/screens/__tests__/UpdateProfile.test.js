import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { useNavigation, goBack, NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdateProfile from "../Stacks/UpdateProfile";

// Mock AsyncStorage functions
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the useNavigation hook
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => ({
    goBack: jest.fn(),
  })),
}));

// Mock the currentUser email
jest.mock("firebase/auth", () => ({
  auth: {
    currentUser: {
      email: "john.doe@example.edu",
    },
  },
}));

// Mock the setDoc function
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getFirestore: jest.fn(),
}));

describe("<UpdateProfile />", () => {
  test("updates profile with new data", async () => {
    const mockProfileData = {
      firstName: "John",
      lastName: "Doe",
      college: "Example University",
      bio: "Lorem ipsum dolor sit amet",
    };
    const { getByPlaceholderText, getByText } = render(
      <UpdateProfile route={{ params: { profileData: mockProfileData } }} />
    );

    // Change the values in the input fields
    const firstNameInput = getByPlaceholderText("First Name");
    fireEvent.changeText(firstNameInput, "Updated John");

    const lastNameInput = getByPlaceholderText("Last Name");
    fireEvent.changeText(lastNameInput, "Updated Doe");

    const collegeInput = getByPlaceholderText("College / University");
    fireEvent.changeText(collegeInput, "Updated University");

    const bioInput = getByPlaceholderText("Bio");
    fireEvent.changeText(bioInput, "Updated bio");

    // Click the update button
    const updateButton = getByText("Update Account");
    fireEvent.press(updateButton);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if the updated values are reflected in the inputs
    expect(firstNameInput.props.value).toBe("Updated John");
    expect(lastNameInput.props.value).toBe("Updated Doe");
    expect(collegeInput.props.value).toBe("Updated University");
    expect(bioInput.props.value).toBe("Updated bio");
  });
});
