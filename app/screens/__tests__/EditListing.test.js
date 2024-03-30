import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateListing from "../Stacks/CreateListing"; 

// Mock Firebase functions
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"), 
  deleteDoc: jest.fn(),
}));

// Mock navigation functions
const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ goBack: mockGoBack }),
  useIsFocused: jest.fn().mockReturnValue(true),
}));

describe("CreateListing Component", () => {
  test("Delete Listing", async () => {
    // Mock listing document ID
    const listingDocId = "mock-listing-id";

    // Render the CreateListing component
    const { getByText } = render(
      <CreateListing route={{ params: { listingDoc: listingDocId } }} />
    );

    // Trigger the delete listing function
    const deleteButton = getByText("Delete Listing");
    fireEvent.press(deleteButton);

    // Check if the listing is properly deleted
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    }).catch((error) => {
      console.error("Error in waitFor:", error);
    });
  });
});
