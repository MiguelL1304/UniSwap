import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Dimensions, RefreshControl, Text } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { collection, doc, getDocs } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import defaultImg from "../../assets/defaultImg.png";

const windowWidth = Dimensions.get("window").width;

function Bought() {
  const navigation = useNavigation();
  const [userListings, setUserListings] = useState({});
  const [numColumns, setNumColumns] = useState(3);
  const isFocused = useIsFocused();

  const handleListing = (listingDoc) => {
    navigation.navigate("ListingDetails", { listing: listingDoc });
  };

  useEffect(() => {
    if (isFocused) {
      fetchBought();
    }
  }, [isFocused]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBought();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const fetchBought = async () => {
    const currentUserEmail = auth.currentUser ? auth.currentUser.email : null;
    if (!currentUserEmail) {
      throw new Error("Current user is null or email is undefined.");
    }
    try {
      const buyerProfileDocRef = doc(firestoreDB, 'profile', currentUserEmail);
      const boughtListingsRef = collection(buyerProfileDocRef, 'bought');
      const snapshot = await getDocs(boughtListingsRef);
      const listingsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserListings(listingsArray);
    } catch (error) {
      console.error("Failed to fetch bought listings:", error);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No listings found.</Text>
    </View>
  );

  
  return (
    <View style={styles.container}>
      <FlatList
        data={userListings}
        numColumns={numColumns}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}/>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleListing(item)}>
            <Image
              source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
              style={[styles.galleryImage, { width: windowWidth / numColumns }]}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const screenHeight = Dimensions.get('window').height * 0.6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  galleryImage: {
    height: 130, // Set height as needed
    width: 130,
    margin: 0.5, 
    resizeMode: "cover", // Maintain aspect ratio and cover the area
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: "flex-start", // Align content to the top
    paddingTop: 1, 
    
  },
  emptyContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
    height: screenHeight,
  },
  emptyText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "gray",
    flexWrap: "wrap",
    paddingBottom: 100,
  },
});

export default Bought;