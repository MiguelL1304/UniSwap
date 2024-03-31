import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, FlatList } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";
import defaultImg from "../../assets/defaultImg.png";
import { ScrollView } from "react-native-gesture-handler";

function Bought() {
  const navigation = useNavigation();
  const [userListings, setUserListings] = useState({});
  const [numColumns, setNumColumns] = useState(3);

  const handleListing = (listingDoc) => {
    navigation.navigate("EditListing", { listingDoc: listingDoc });
  };

  // const handleListing = (listing) => {
  //   navigation.navigate("Listing", { listing: listing });
  // };

  // const handleListingPress = (listingId) => {
  //   navigation.navigate("PersonalListing", { listingId : userListings });
  // };

  
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

// const handleListingPress = (listingId) => {
//   navigation.navigate("PersonalListing", { listingId });
// };

  
  return (
    <View style={styles.container}>
      
      <FlatList
        // horizontal
        data={userListings}
        numColumns={numColumns}
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
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    // display: 'flex',
    flex: 1,
    backgroundColor: "white",
    // paddingHorizontal: 0,
    // paddingTop: 10,
    alignItems: "center", // Center items horizontally
  },
  imagesWrapper: {
    flexDirection: 'row',
  },
  galleryImage: {
    height: 125,
    width: 125,
    margin: 1,
  }
});


export default Bought;
