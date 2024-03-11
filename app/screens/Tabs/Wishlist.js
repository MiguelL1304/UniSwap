import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Checkbox } from "expo-checkbox";

const Wishlist = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Item 1",
      image: "https://fakeimg.pl/100x100/ff0000/000000?text=Book+1",
      checked: false,
    },
    {
      id: 2,
      name: "Item 2",
      image: "https://fakeimg.pl/100x100/00ff0d/000000?text=Book+2",
      checked: false,
    },
    {
      id: 3,
      name: "Item 3",
      image: "https://fakeimg.pl/100x100/ff5500/000000?text=Book+3",
      checked: false,
    },
    {
      id: 4,
      name: "Item 4",
      image: "https://fakeimg.pl/100x100/9d00ff/000000?text=Book+4",
      checked: false,
    },
    {
      id: 5,
      name: "Item 5",
      image: "https://fakeimg.pl/100x100/00d0ff/000000?text=Book+5",
      checked: false,
    },
    {
      id: 6,
      name: "Item 6",
      image: "https://fakeimg.pl/100x100/fffb00/000000?text=Book+6",
      checked: false,
    },
  ]);

  const toggleItem = (itemId) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  const removeCheckedItems = () => {
    setItems(items.filter((item) => !item.checked));
  };

  const renderWishlistItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleItem(item.id)}
      style={[styles.item, { borderBottomWidth: 1 }]}
    >
      <Checkbox
        value={item.checked}
        onValueChange={() => toggleItem(item.id)}
        color={item.checked ? '#3f9eeb' : undefined}
      />
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>
      <FlatList
        data={items}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
      <TouchableOpacity
        onPress={removeCheckedItems}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>Remove Checked Items</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  list: {
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomColor: "black",
  },
  itemImageContainer: {
    marginLeft: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
    marginLeft: 40,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 70,
  },
  removeButton: {
    backgroundColor: "#3f9eeb",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Wishlist;
