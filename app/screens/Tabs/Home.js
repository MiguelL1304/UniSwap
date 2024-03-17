import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  Image,
} from "react-native";
import { firestoreDB } from "../../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import HomeHeader from "../Components/HomeHeader";

//default img if no img posted with listing
import defaultImg from "../../assets/defaultImg.png";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

const Home = () => {
  // search bar
  const [searchQuery, setSearchQuery] = useState("");

  // getting & setting listings from firestore
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestoreDB, "listing"));
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //console.log(documents);
        setListings(documents);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    // header area + search bar
    
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={24} color="#3f9eeb" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Seach here!"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>
      
      <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* // display  of listings */}
        <FlatList
          style={styles.listings}
          data={listings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listingItem}>
                <Image 
                source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
                style={styles.listingImage}
                />
              <Text style={styles.listingTitle}>{item.title}</Text>
              <Text style={styles.listingPrice}>${item.price}</Text>
            </View>
          )}
          contentContainerStyle={styles.listingsContainer}
        />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f2ff",
  },
  listingsContainer: {
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  listingItem: {
    flex: 1,
    flexDirection: "column",
    padding: 15,
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
