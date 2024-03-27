import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import defaultImg from "../../assets/defaultImg.png";
import { ScrollView } from "react-native-gesture-handler";

function Selling() {

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [userListings, setUserListings] = useState({});

  const handleListing = (listingDoc) => {
    navigation.navigate("EditListing", { listingDoc: listingDoc });
  };

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const email = auth.currentUser ? auth.currentUser.email : null;
      if (!email) {
        throw new Error("Current user is null or email is undefined.");
      }

      const userListingRef = collection(firestoreDB, "userListing");
      const userListingDocRef = doc(userListingRef, email);
      const userListingSnapshot = await getDoc(userListingDocRef);

      if (userListingSnapshot.exists()) {
        const userListingData = userListingSnapshot.data();
        const listingNames = Object.keys(userListingData);

        const itemPromises = listingNames.map(async (itemId) => {
          const listingDocRef = doc(firestoreDB, "listing", itemId);
          const listingDocSnapshot = await getDoc(listingDocRef);

          if (listingDocSnapshot.exists()) {
            const listingData = listingDocSnapshot.data();
            return { id: itemId, ...listingData};
          } else {
            console.log("User listing document not found");
          }
        });

        const items = await Promise.all(itemPromises);
        console.log("Fetched user listing:", items);
        const filteredItems = items.filter((item) => item !== null);
        setUserListings(filteredItems);
      } else {
        console.warn("User listing not found")
      }
      } catch (error) {
        console.error('Error fetching user listings:', error);
      }
  };
  fetchUserListings();
}, []);



  
  return (
    
    <View style={styles.container}>
     <ScrollView>

      {/* Fetch the user document in the userListing collection */}
      {/* <Text>User Listings:</Text> */}
      <View>
      <FlatList
        horizontal
        data={userListings}
        renderItem={({ item }) => (
          
          <View style={styles.imagesWrapper}>
            <TouchableOpacity onPress={() => handleListing(item)}>
            <Image
              source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
              style={styles.galleryImage}
            />     
            </TouchableOpacity>
          </View>
          
        )}
        keyExtractor={(item) => item.id}
        
      />
      </View>
      </ScrollView>
      
    </View>

  );
}

export default Selling;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "center",
    // display: 'flex',
    backgroundColor: "white",
  },
  imagesWrapper: {
    flexDirection: 'row',
  },
  galleryImage: {
    // display: 'flex',
      flex:1,
      height: 125,
      width: 125,
      margin: 1,
  }
});