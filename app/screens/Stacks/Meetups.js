import React, { useRef, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, FlatList, Text, Dimensions, Modal } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";

const Meetups = () => {
  const images = [
    {
      url: "https://svite-league-apps-content.s3.amazonaws.com/21982/30250/cb50a419-6b44-445b-847f-e6d3dd7a8e70.jpeg", // Replace with your image URL
    },
  ];

   const data = [
     { id: "1", text: "Meetup 1: Building B", positionX: 185, positionY: 150 },
     { id: "2", text: "Meetup 2: Building A", positionX: 270, positionY: 170 },
     { id: "3", text: "Meetup 3: Building L", positionX: 205, positionY: 180 },
   ];

   const [selectedItem, setSelectedItem] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);
   const [modalText, setModalText] = useState("");

   const imageZoomRef = useRef();

   const dot = (index, positionX, positionY) => {
    if (selectedItem !== index) return null;

    return (
      <View
        key={index}
        style={[styles.dot, { left: positionX, top: positionY }]}
      >
        <View style={styles.dotContainer}>
          <Text style={styles.dotText}>{modalText}</Text>
        </View>
      </View>
    );
   };

   const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setSelectedItem(item.id);
      setModalText(item.text);
      setModalVisible(true);
    }}>
       <View style={[styles.item, selectedItem === item.id && styles.selectedItem]}>
         <Text>{item.text}</Text>
       </View>
     </TouchableOpacity>
   );

  return (
    <View style={styles.container}>
        <ImageZoom 
        ref={imageZoomRef}
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height/3}
        imageWidth={Dimensions.get('window').width}
        imageHeight={Dimensions.get('window').height/2}
        >
        <Image source={{ uri: images[0].url }} style={styles.image} resizeMode="stretch" />
        {data.map((item) => dot(item.id, item.positionX, item.positionY))}
        </ImageZoom>
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
    backgroundColor: "white", // Set background color for image viewer
  },
  image: {
    width: "100%",
    height: "70%", // Adjust height as needed
    marginLeft: 50,
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  selectedItem: {
    backgroundColor: "#3f9eeb",
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#3f9eeb",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "white",
  },
  dotContainer: {
    flexDirection: "row",
    flexGrow: 1,
  },
  dotText: {
    position: "absolute",
    fontSize: 12,
    top: -35,
    left: -60,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default Meetups;
