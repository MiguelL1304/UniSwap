import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";

const ReceivedOffers = () => {
  const data = [
    {
      id: 1,
      username: "Christine Kommu",
      profilePic: require("../../assets/splash.png"),
      price: "$50",
      productImage: require("../../assets/favicon.png"),
      productName: "Mathematics Book",
      offerPrice: "$40",
    },
    {
      id: 2,
      username: "Miguel Leon",
      profilePic: require("../../assets/splash.png"),
      price: "$80",
      productImage: require("../../assets/favicon.png"),
      productName: "Chemistry Textbook",
      offerPrice: "$70",
    },
  ];

    const renderItem = ({ item }) => (
      <View style={styles.itemContainer}>
        <View style={styles.productInfo}>
          <Image source={item.productImage} style={styles.productImage} />
          <View style={styles.detailsContainer}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Image source={item.profilePic} style={styles.profilePic} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <Text style={styles.offerPrice}>{item.offerPrice}</Text>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.counterButton}>
            <Text style={styles.buttonText}>Counter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    borderBottomWidth: 1,
    paddingBottom: 50,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 50,
  },
  productImage: {
    position: "absolute",
    width: 50,
    height: 50,
    right: 300,
  },
  price: {
    position: "absolute",
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 300,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  profilePic: {
    position: "absolute",
    top: 18,
    left: 80,
    backgroundColor: "#3f9eeb",
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 120,
    paddingTop: 20,
  },
  offerPrice: {
    position: "absolute",
    right: 20,
    top: 48,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  acceptButton: {
    position: "absolute",
    top: 85,
    backgroundColor: "#3f9eeb",
    paddingVertical: 5,
    paddingHorizontal: 60,
    borderRadius: 5,
    marginBottom: 5,
  },
  counterButton: {
    position: "relative",
    top: 30,
    right: 8,
    backgroundColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  rejectButton: {
    position: "relative",
    top: 30,
    left: 8,
    backgroundColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ReceivedOffers;
