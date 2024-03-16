import React from "react";
import { StyleSheet, SafeAreaView, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeHeader = ({ searchQuery, setSearchQuery }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={24}
              color="#3f9eeb"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Seach here!"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e6f2ff",
  },
  header: {
    paddingTop: 10,
    backgroundColor: "#e6f2ff", // Color for the header bar
    paddingBottom: 10,
  },
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
});

export default HomeHeader;
