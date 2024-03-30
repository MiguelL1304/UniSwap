import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { collection, addDoc, setDoc, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import CreateListing from "../Stacks/CreateListing"; 

// Mock AsyncStorage functions
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
}));

describe("CreateListing Component", () => {
  test("Create Listing", async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <CreateListing />
      </NavigationContainer>
    );

    // Fill in the listing details
    const titleInput = getByPlaceholderText("Enter title...");
    const descriptionInput = getByPlaceholderText("Enter description...");
    const priceInput = getByPlaceholderText("Enter price...");
    const categoryInput = getByPlaceholderText("Enter category...");
    const subjectInput = getByPlaceholderText("Enter subject...");
    const courseInput = getByPlaceholderText("Enter course...");
    const conditionInput = getByPlaceholderText("Enter condition...");

    fireEvent.changeText(titleInput, "Test Title");
    fireEvent.changeText(descriptionInput, "Test Description");
    fireEvent.changeText(priceInput, "100");
    fireEvent.changeText(categoryInput, "Test Category");
    fireEvent.changeText(subjectInput, "Test Subject");
    fireEvent.changeText(courseInput, "Test Course");
    fireEvent.changeText(conditionInput, "Test Condition");

    // Trigger the create listing function
    const createButton = getByText("Create Listing");
    fireEvent.press(createButton);

    // Check if the listing is created
    await waitFor(() => {
        expect(collection).toHaveBeenCalled();
        expect(addDoc).toHaveBeenCalled();
        expect(setDoc).toHaveBeenCalled();
    });
  });
});

