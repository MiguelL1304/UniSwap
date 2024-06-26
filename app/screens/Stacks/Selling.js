import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Dimensions, RefreshControl, Text } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import defaultImg from "../../assets/defaultImg.png";

const windowWidth = Dimensions.get("window").width;

function Selling() {
  const navigation = useNavigation();
  const [userListings, setUserListings] = useState({});
  const [numColumns, setNumColumns] = useState(3);
  const isFocused = useIsFocused();

  const handleListing = (listingDoc) => {
    navigation.navigate("EditListing", { listingDoc: listingDoc });
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserListings();
    }
  }, [isFocused]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserListings();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const fetchUserListings = async () => {
    try {
      const email = auth.currentUser ? auth.currentUser.email : null;
      if (!email) {
        throw new Error("Current user is null or email is undefined.");
      }
      
      const userListingRef = doc(firestoreDB, "userListing", email);
      const userListingSnapshot = await getDoc(userListingRef);
      
      if (userListingSnapshot.exists()) {
        const userListingData = userListingSnapshot.data();
        const listingIds = Object.keys(userListingData);
      
        if (!Array.isArray(listingIds)) {
          throw new Error("Listing IDs is not an array.");
        }
            
        const items = await Promise.all(listingIds.map(async (listingId) => {
          const listingDocRef = doc(firestoreDB, "listing", listingId);
          const listingDocSnapshot = await getDoc(listingDocRef);
    
          if (listingDocSnapshot.exists()) {
            const listingData = listingDocSnapshot.data();
            return { id: listingId, ...listingData };
          } else {
            console.log("Listing document not found");
            return null;
          }
        }));
    
        const filteredItems = items.filter(item => item !== null && item.status === "available")
        const sortedListings = filteredItems.sort((a, b) => b.createdAt - a.createdAt);

        setUserListings(sortedListings);
      } else {
        console.warn("User listing document not found")
      }
    } catch (error) {
      console.error('Error fetching user listings:', error);
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
          <TouchableOpacity onPress={() => handleListing(item.id)}>
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

export default Selling;
