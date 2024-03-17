import React, { useEffect, useState } from "react";
import { StyleSheet, Text, SafeAreaView, View, TextInput, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDB } from "../../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

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
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(documents);
        setListings(documents);
      } catch (error) {
        console.error('Error fetching data: ', error);
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

      {/* // display  of listings */}
        <FlatList
          style={{backgroundColor:"white"}}
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
  header: {
    paddingTop: 10,
    backgroundColor: "#e6f2ff", // Color for the header bar
    paddingBottom: 10,
  },
  headerBar: {
    //paddingHorizontal: 10,
  },
  // searchIcon: {
  //   marginRight: 10,
  // },
  searchIcon: {
    position: "absolute",
    marginLeft: 25,
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    margin: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "transparent",
    borderColor: "#3f9eeb",
    borderWidth: 2,
    borderRadius: 10,
    paddingLeft: 40,
  },
  mainContainer: {
    flex: 1,
    //backgroundColor: "red", 
  },
  listingsContainer: {
    paddingHorizontal: 10,
    //backgroundColor: "white",
  },
  listingItem: {
    flex: 1,
    flexDirection: "column",
    padding: 15,
    //alignItems: "center",
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
