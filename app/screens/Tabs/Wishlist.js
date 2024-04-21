import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { collection, doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { Checkbox } from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";

//default img if no img posted with listing
import defaultImg from "../../assets/defaultImg.png";
import { useIsFocused, useNavigation } from "@react-navigation/native";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

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
        <TouchableOpacity style={styles.selectButton} onPress={toggleSelection}>
          <Text style={styles.selectButtonText}>
            {isSelecting ? "Cancel" : "Select"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isSelecting]);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      //check for user's email 
      try {
        const email = auth.currentUser ? auth.currentUser.email : null;
        if (!email) {
          throw new Error("Current user is null or email is undefined.");
        }

        //references the wishlist collection tied to the user's email
        const wishlistRef = doc(collection(firestoreDB, "wishlist"), email);
        const userWishlistSnap = await getDoc(wishlistRef);

        if (userWishlistSnap.exists()) {
          const data = userWishlistSnap.data();
          const wishlistItemIds = Object.keys(data);

          //uses the item IDs in a wishlist to find their listing page 
          const itemsPromises = wishlistItemIds.map(async (itemId) => {
            const listingDocRef = doc(firestoreDB, "listing", itemId);
            const listingDocSnap = await getDoc(listingDocRef);

            if (listingDocSnap.exists()) {
              const listingData = listingDocSnap.data();
              return { id: itemId, ...listingData };
            } else {
              console.log("Listing document not found for:", itemId);
              return null;
            }
          });

          //returns all the data of associated with an item ID (title, image, price)
          const items = await Promise.all(itemsPromises);
          console.log("Fetched wishlist items:", items);
          const filteredItems = items.filter((item) => item !== null);
          setWishlistItems(filteredItems);
        } else {
          console.warn("User wishlist not found.");
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
      }
    };

    if (isFocused) {
      fetchWishlistItems();
    }
  }, [isFocused]);

  const handleListingPress = (listingId) => {
    // Toggle the selected state of the item
    if (isSelecting) {
      const updatedWishlistItems = wishlistItems.map((item) =>
        item.id === listingId ? { ...item, selected: !item.selected } : item
      );
      setWishlistItems(updatedWishlistItems);

      // Update the selectedItems state with the selected item's ID, otherwise pressing an item will lead to its listing page
      const selectedItemIds = updatedWishlistItems
        .filter((item) => item.selected)
        .map((item) => item.id);
      setSelectedItems(selectedItemIds);
    } else {
      navigation.navigate("Listing", { listing: listingId });
    }
  };

  const toggleSelection = () => {
    setIsSelecting(!isSelecting);
    if (!isSelecting) {
      // Unselect all checkboxes 
      const updatedWishlistItems = wishlistItems.map((item) => ({
        ...item,
        selected: false,
      }));
      setWishlistItems(updatedWishlistItems);
      setSelectedItems([]);
    }
  };

  //removes selected items from a user's wishlist
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
          //removes the data of an item ID and checks to make sure deletion was completed or not
          onPress: async () => {
            try {
              const email = auth.currentUser ? auth.currentUser.email : null;
              if (!email) {
                throw new Error("Current user is null or email is undefined.");
              }

              const wishlistRef = collection(firestoreDB, "wishlist");
              const wishlistDocRef = doc(wishlistRef, email);
              const wishlistDocSnap = await getDoc(wishlistDocRef);

              if (wishlistDocSnap.exists()) {
                const userData = wishlistDocSnap.data();

                selectedItems.forEach((item) => {
                  if (userData.hasOwnProperty(item)) {
                    delete userData[item];
                    console.log("Item deleted from wishlist:", item);
                  } else {
                    console.error(
                      "Item to delete does not exist in wishlist:",
                      item
                    );
                  }
                });

                await setDoc(wishlistDocRef, userData);
                console.log("Items deleted from wishlist:", selectedItems);

                const updatedWishlistItems = wishlistItems.filter(
                  (item) => !selectedItems.includes(item.id)
                );
                setWishlistItems(updatedWishlistItems);
                setSelectedItems([]);
                setIsSelecting(false);
              } else {
                console.error("Wishlist document does not exist.");
              }
            } catch (error) {
              console.error("Error deleting items:", error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleListingPress(item)}>
      <View style={styles.listingItem}>
        <View style={styles.imageContainer}>
          <Image
            source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
            style={styles.listingImage}
          />
          {isSelecting && (
            <Checkbox
              value={item.selected}
              onValueChange={() => handleListingPress(item.id)}
              color={item.selected ? "#3f9eeb" : undefined}
              style={styles.checkbox}
            />
          )}
          <View style={styles.heartContainer}>
            <Ionicons name="heart" size={24} color="red" />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.listingTitle}>{item.title}</Text>
          <Text style={styles.listingPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Your wishlist is empty. Press "♡" on an item to add it to the
          wishlist!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {/* display of listings */}
        <FlatList
          style={styles.wishlistItems}
          data={wishlistItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listingsContainer}
        />
      </View>
      <View style={styles.deleteBtnContainer}>
        {isSelecting && (
            <TouchableOpacity
              onPress={handleRemoveSelected}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectButton: {
    //backgroundColor: "#3f9eeb",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 5,
  },
  selectButtonText: {
    color: "#3f9eeb",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteBtnContainer: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "center",
    paddingBottom: 30,
    //zIndex: 1,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: 150,
    //position: "absolute",
    //bottom: 10,
    //left: 0,
    //right: 0,
    justifyContent: "center",
    //paddingVertical: 5,
    //paddingHorizontal: 10,
    //marginLeft: 5,
    //width: 80,
    alignItems: "center",
    zIndex: 10,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainContainer: {
    flex: 1,
    //paddingBottom: 40,
  },
  listingsContainer: {
    backgroundColor: "white",
  },
  imageContainer: {
    position: "relative",
  },
  heartContainer: {
    position: "absolute",
    bottom: 5,
    left: 5,
    borderRadius: 50,
    padding: 20,
  },
  listingItem: {
    flex: 1,
    flexDirection: "column",
    padding: 15,
    alignItems: "center",
    width: 195,
    flexWrap: "wrap",
  },
  textContainer: {
    flex: 1,
    width: "100%",
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 5,
  },
  listingPrice: {
    fontSize: 16,
    color: "green",
    paddingLeft: 5,
  },
  listingImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    margin: 15,
    borderRadius: 15,
  },
  checkbox: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
  },
  emptyContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
  },
  emptyText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "gray",
    width: 200,
    flexWrap: "wrap",
  },
});