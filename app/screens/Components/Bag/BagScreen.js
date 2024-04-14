import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from "react-native";
import { auth } from "../../../../Firebase/firebase";
import { getBagItems, removeFromBag } from "./BagLogic";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';


const Bag = () => {
    const navigation = useNavigation();

    const [editMode, setEditMode] = useState(false);
    const [groupedItems, setGroupedItems] = useState([]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Text style={styles.editButton}>
                {editMode ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          ),
        });
      }, [navigation, editMode]);

    // adding + grouping item(s)
    useEffect(() => {
        const groupItemsBySeller = (items) => {
            const grouped = items.reduce((acc, item) => {
                const key = item.sellerEmail; 
                if (!acc[key]) {
                    acc[key] = {
                        sellerInfo: {
                            name: `${item.sellerFirstName} ${item.sellerLastName}`,
                            image: item.sellerImg
                        },
                        items: []
                    };
                }
                acc[key].items.push(item);
                return acc;
            }, {});

            return Object.values(grouped);
        };

        const fetchItems = async () => {
            const user = auth.currentUser;
            if (user) {
                const fetchedItems = await getBagItems(user.email);
                const groupedItems = groupItemsBySeller(fetchedItems);
                setGroupedItems(groupedItems);
            }
        };

        fetchItems();
    }, []);

    const handleRemoveFromBag = async (itemId) => {
        const user = auth.currentUser;
        if (user) {
          await removeFromBag(user.email, itemId);
          setGroupedItems(prevGroupedItems =>
            prevGroupedItems.reduce((acc, group) => { //acc = accumulator 
              const filteredItems = group.items.filter(item => item.id !== itemId);
              if (filteredItems.length > 0) {
                acc.push({
                  ...group,
                  items: filteredItems
                });
              }
              return acc;
            }, [])
          );
        }
      };

      const navigateToOffer = (sellerItems) => {
        navigation.navigate("Offer", { listings: sellerItems });
      };

    return (
        <ScrollView>
            <View style={{backgroundColor: "white"}}>
                {groupedItems.map((group, index) => (
                    <View key={index}>
                        <View style={styles.sellerContainer}>

                        {/*  ======== SELLER INFO ======== */}
                        <Image
                            source={{ uri: group.sellerInfo.image || "https://via.placeholder.com/150" }}
                            style={styles.sellerImage}
                        />
                        <Text style={styles.sellerName}>{group.sellerInfo.name}</Text>
                        </View>
                        
                        {/* ======== LISTINGS ======== */}
                        {group.items.map((item) => (
                            <View key={item.id} style={styles.listingContainer}>
                                <Image
                                source={{ uri: item.listingImg1 || "https://via.placeholder.com/150" }}
                                style={styles.listingImage}
                                />
                                <Text>Title: {item.title}</Text>
                                <Text>Price: ${item.price}</Text>
                                {editMode && (
                                    <TouchableOpacity onPress={() => handleRemoveFromBag(item.id)}>
                                        <Text style={styles.deleteItemButton}>Delete Item</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        {/* ======== CHECKOUT ======== */}
                        <TouchableOpacity 
                            style={styles.checkoutContainer}
                            onPress={() => navigateToOffer(group.items)}
                        >
                            <Text style={styles.checkoutButton}>Checkout</Text>
                        </TouchableOpacity>

                        {/* ======== DIVIDER ======== */}
                        <View style={styles.divider} />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default Bag;

const styles = StyleSheet.create({
    divider: {
        borderBottomColor: "#e6f2ff",
        borderBottomWidth: 8,
        marginVertical: 8,
    },
    editButton: {
        fontWeight: "700",
        fontSize: 16,
        color: "#3f9eeb"
    },
    sellerContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    sellerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        margin: 10,
    },
    sellerName: {
        fontWeight: "700",
        fontSize: 18,
        margin: 10,
    },
    listingContainer: {
        //flexDirection: "row",
        padding: 10,
    },
    listingImage: {
        width: 100,
        height: 100,
        resizeMode: "contain",
    },
    checkoutContainer: {
        //alignContent: "center",
        alignItems: "center",
        paddingBottom: 10,
        //flex: 1,
    },
    checkoutButton: {
        backgroundColor: "#3f9eeb",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        width: "90%",
        padding: 8,
        margin: 10,
        borderRadius: 10,
        overflow: "hidden",
    }
})
