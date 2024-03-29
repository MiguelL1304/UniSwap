import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import defaultImg from "../../assets/defaultImg.png";
import { ScrollView } from "react-native-gesture-handler";

function Bought() {
        // listingNames is the name of the document data --> list of data links in the profile currently
        // userListing --> listingNames
        // listing names in 3rd col userListing is same as 2nd col in listing 
        // listing names is already fetched (in profile tab)
        // you need to take that fetched data and reference listingImg1 in listing collection to display the images

// gallery view
// click on listing and bring to listing page
// add edit and delete buttons when you click on your own listing
// update profile UI
const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [userListings, setUserListings] = useState({});
    useEffect(() => {
        if (isFocused) {
        //   fetchProfile(); // Fetch profile data when screen is focused
          fetchUserListings();
        }
      }, [isFocused]);

      //Fetch the user document in the userListing collection. TO BE DELETED LATER
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
        const listingNames = Object.keys(userListingData);
        setUserListings(listingNames);
        console.log(userListings);

      } else {
        console.log("User listing document does not exist");
      }
    } catch (error) {
      console.error('Error fetching user listings:', error);
    }
  };

  const handleListing = (listingDoc) => {
    navigation.navigate("EditListing", { listingDoc: listingDoc });
  };


  return (
    
    // <View style={styles.container}>
    //   <Text>TESTING PLACEMENT</Text>
     

    // </View>
    <View>
      <Text>Items the user has purchased</Text>
    

      {/* Fetch the user document in the userListing collection. TO BE DELETED LATER */}
      {/* <Text style={styles.userInfoText}>User Listings:</Text>
      <FlatList
        data={userListings}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleListing(item)}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      /> */}
    </View>

  );
}
export default Bought;

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