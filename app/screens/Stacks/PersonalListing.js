import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Button
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

const PersonalListing = ({ route }) => {
  const navigation = useNavigation();
  // const isFocused = useIsFocused();
  

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
    
        const userListingRef = doc(firestoreDB, "userListing", email);
        const userListingSnapshot = await getDoc(userListingRef);
    
        if (userListingSnapshot.exists()) {
          const userListingData = userListingSnapshot.data();
          const listingIds = Object.keys(userListingData);
    
          if (!Array.isArray(listingIds)) {
            throw new Error("Listing IDs is not an array.");
          }
    
          const itemPromises = listingIds.map(async (listingId) => {
            const listingDocRef = doc(firestoreDB, "listing", listingId);
            const listingDocSnapshot = await getDoc(listingDocRef);
    
            if (listingDocSnapshot.exists()) {
              const listingData = listingDocSnapshot.data();
              return { id: listingId, ...listingData};
            } else {
              console.log("Listing document not found");
              return null;
            }
          });
    
          const items = await Promise.all(itemPromises);
          console.log("Fetched user listings:", items);
          const filteredItems = items.filter((item) => item !== null);
          setUserListings(filteredItems);
        } else {
          console.warn("User listing document not found")
        }
      } catch (error) {
        console.error('Error fetching user listings:', error);
      }
    };
  fetchUserListings();
}, []);


  

  return (
    // <View style={styles.container}>
    //   <Text>Your personal Listing</Text>
    //   <Button title="Edit" onPress={handleListing}/>
    // </View>

    <View style={styles.container}>
    <ScrollView>
      <FlatList
        horizontal
        data={userListings}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleListing(item.id)}>
            <View style={styles.imagesWrapper}>
              <Image
                source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
                style={styles.galleryImage}
              />     
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </ScrollView>
  </View>
    
  );
};



export default PersonalListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: "white",
  },


});
