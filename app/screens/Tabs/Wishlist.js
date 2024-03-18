import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from "react-native";
import { firestoreDB } from "../../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Checkbox } from "expo-checkbox";

//default img if no img posted with listing
import defaultImg from "../../assets/defaultImg.png";

const Wishlist = () => {
  const [listings, setListings] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestoreDB, "listing"));
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          selected: false,
        }));
        //console.log(documents);
        setListings(documents);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleListingPress = (listingId) => {
    if (isSelecting) {
    // Toggle the selected state of the item
    const updatedListings = listings.map((item) =>
      item.id === listingId ? { ...item, selected: !item.selected } : item
    );
    setListings(updatedListings);

    // Update the selectedItems state with the selected item's ID
    const selectedItemIds = updatedListings
      .filter((item) => item.selected)
      .map((item) => item.id);
    setSelectedItems(selectedItemIds);
    }
  };

  const toggleSelection = () => {
    setIsSelecting(!isSelecting);
    if (!isSelecting) {
      // Unselect all checkboxes
      const updatedListings = listings.map((item) => ({
        ...item,
        selected: false,
      }));
      setListings(updatedListings);
      setSelectedItems([]);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select items to delete.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete the selected items?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedListings = listings.filter(
              (item) => !selectedItems.includes(item.id)
            );
            setListings(updatedListings);
            setSelectedItems([]);
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleListingPress(item.id)}>
      <View style={styles.listingItem}>
        {isSelecting && (
        <Checkbox
          value={item.selected}
          onValueChange={() => handleListingPress(item.id)}
          color={item.selected ? '#3f9eeb' : undefined}
        />
        )}
        <Image
          source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
          style={styles.listingImage}
        />
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.listingPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSelection} style={styles.selectButton}>
          <Text style={styles.selectButtonText}>
            {isSelecting ? "Cancel" : "Select"}
          </Text>
        </TouchableOpacity>
        {isSelecting && (
          <TouchableOpacity
            onPress={handleRemoveSelected}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Remove Selected</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.mainContainer}>
        {/* display of listings */}
        <FlatList
          style={styles.listings}
          data={listings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listingsContainer}
        />
      </View>
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f2ff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectButton: {
    backgroundColor: "#3f9eeb",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 5,
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainContainer: {
    flex: 1,
  },
  listingsContainer: {
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  listingItem: {
    flex: 1,
    flexDirection: "column",
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listingPrice: {
    fontSize: 16,
    color: "green",
  },
  listingImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    margin: 15,
    borderRadius: 15,
  },
});