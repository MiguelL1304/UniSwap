import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Dimensions, RefreshControl } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { collection, doc, getDocs } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import defaultImg from "../../assets/defaultImg.png";

const windowWidth = Dimensions.get("window").width;

function Sold() {
  const navigation = useNavigation();
  const [userListings, setUserListings] = useState({});
  const [numColumns, setNumColumns] = useState(3);
  const isFocused = useIsFocused();

  const handleListing = (listingDoc) => {
    navigation.navigate("ListingDetails", { listing: listingDoc });
  };

  useEffect(() => {
    if (isFocused) {
      fetchSold();
    }
  }, [isFocused]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSold();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const fetchSold = async () => {
    const currentUserEmail = auth.currentUser ? auth.currentUser.email : null;
    if (!currentUserEmail) {
      throw new Error("Current user is null or email is undefined.");
    }
    try {
      const sellerProfileDocRef = doc(firestoreDB, 'profile', currentUserEmail);
      const soldListingsRef = collection(sellerProfileDocRef, 'sold');
      const snapshot = await getDocs(soldListingsRef);
      const listingsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserListings(listingsArray);
    } catch (error) {
      console.error("Failed to fetch sold listings:", error);
    }
  };


  
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
      />
    </View>
  );
}

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
});

export default Sold;