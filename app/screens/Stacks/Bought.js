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

  return (
    
    <View style={styles.container}>
      <Text>TESTING PLACEMENT</Text>

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