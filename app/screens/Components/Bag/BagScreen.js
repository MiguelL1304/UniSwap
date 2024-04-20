import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from "react-native";
import { auth } from "../../../../Firebase/firebase";
import { getBagItems, removeFromBag, handleSellerPress } from "./BagLogic";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';


const Bag = () => {
    const navigation = useNavigation();

    const [editMode, setEditMode] = useState(false);
    const [groupedItems, setGroupedItems] = useState([]);
    //const [renderedSellers, setRenderedSellers] = useState({});

      useEffect(() => {
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

    useEffect(() => {
        const fetchItems = async () => {
            const user = auth.currentUser;
            if (user) {
                const fetchedItems = await getBagItems(user.email);
                console.log("Fetched Items from BagScreen.js: ", fetchedItems)
                fetchedItems.forEach(item => {
                    console.log("Seller Details for item: ", item.sellerDetails)
                })
                if (fetchedItems && Array.isArray(fetchedItems)) {
                    const groupedItems = groupItemsBySeller(fetchedItems);
                    setGroupedItems(groupedItems);
                } else {
                    console.error("Problem fetching items :(")
                }

            }
        };

        fetchItems();
    }, []);

    const groupItemsBySeller = (items) => {
        const groups = items.reduce((acc, item) => {
            const key = item.sellerEmail;
            if (!acc[key]) {
                acc[key] = {
                    sellerInfo: {
                        name: item.sellerDetails ? `${item.sellerDetails.firstName} ${item.sellerDetails.lastName}` : 'Unknown Seller',
                        image: item.sellerDetails?.profilePic
                    },
                    items: []
                };
            }
            acc[key].items.push(item);
            console.log("Group being created/updated: ", acc[key])
            return acc;
        }, {});
        console.log("Groups from groupItemsBySeller: ", groups)
        return Object.values(groups);
    };

    const handleRemoveFromBag = async (itemId) => {
        const user = auth.currentUser;
        if (user) {
            await removeFromBag(user.email, itemId);
            setGroupedItems(prev => prev.map(group => ({
                ...group,
                items: group.items.filter(item => item.id !== itemId)
            })));
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
                    {/* ======== SELLER INFO ======== */}
                    {/* Render seller info only once per group */}
                    <TouchableOpacity 
                        style={styles.sellerContainer}
                        onPress={() => handleSellerPress(navigation, group.items[0])}
                    >
                        <Image
                            source={{ uri: group.sellerInfo.image || "https://via.placeholder.com/150" }}
                            style={styles.sellerImage}
                        />
                        <Text style={styles.sellerName}>{group.sellerInfo.name}</Text>
                    </TouchableOpacity>
                    
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
