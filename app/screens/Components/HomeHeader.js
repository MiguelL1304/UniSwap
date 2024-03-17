import React, { useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  TextInput,
  Text,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const HomeHeader = ({ searchQuery, setSearchQuery, onFilterPress, handlePresentModal }) => {
  const categories = [
    {
      name: "Condition",
      //icon: "pricetag-outline",
    },
    {
      name: "Category",
      //icon: "pricetag-outline",
    },
    {
      name: "Subject",
      //icon: "pricetag-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={24}
            //color="#3f9eeb"
            color="black"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Seach here!"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handlePresentModal}>
          <Ionicons name="options-outline" size={25} color="grey"></Ionicons>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={{
          alignItems: "center",
          gap: 20,
          paddingHorizontal: 15,
          //backgroundColor: "red",
        }}
      >
        {categories.map((item, index) => (
          <TouchableOpacity style={styles.tagButtons} key={index}
          >
            {/* <Ionicons size="20" name={item.icon} /> */}
            <Text style={styles.tagText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e6f2ff",
    //backgroundColor: "red",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //backgroundColor: "pink",
    backgroundColor: "#e6f2ff",
    height: 80,
  },
  searchIcon: {
    position: "absolute",
    marginLeft: 25,
    gap: 10,
  },
  searchContainer: {
    //position: "relative",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderRadius: 25,
    marginLeft: 15,
    //backgroundColor: "transparent",
    //backgroundColor: "pink",
    backgroundColor: "#e6f2ff",
    elevation: 2,
    shadowColor: "black",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "transparent",
    //borderColor: "#3f9eeb",
    //borderWidth: 2,
    borderRadius: 10,
    paddingLeft: 55,
  },
  filterButton: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 30,
    //backgroundColor: "yellow",
  },
  tagButtons: {
    //backgroundColor: "#3f9eeb",
    //borderRadius: 10,
    //borderWidth: 1,
    padding: 3,
    margin: 3,
    alignItems: "center",
  },
  tagText: {
    fontSize: 10,
    color: "grey",
    padding: 10,
  },
});

export default HomeHeader;
