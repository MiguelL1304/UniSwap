import React, { useState } from "react";
import { StyleSheet, Text, SafeAreaView, View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
//import { TextInput } from "react-native-gesture-handler";

const Home = () => {

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
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
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    backgroundColor: "#e6f2ff", // Color for the header bar
  },
  headerBar: {
    //paddingHorizontal: 10,
    paddingVertical: 15,
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
    paddingVertical: 5,
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
  }
});
