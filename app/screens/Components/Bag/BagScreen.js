import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { auth } from "../../../../Firebase/firebase";
import { getBagItems, removeFromBag, handleSellerPress } from "./BagLogic";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


const Bag = () => {
    const navigation = useNavigation();

    const [editMode, setEditMode] = useState(false);
    const [groupedItems, setGroupedItems] = useState([]);
    const [selectedToDelete, setSelectedToDelete] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }, []);

      useEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity onPress={toggleEditMode}>
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
                const result = await getBagItems(user.email);
                const fetchedItems = result.items;

                if (fetchedItems && Array.isArray(fetchedItems)) {
                    const groupedItems = groupItemsBySeller(fetchedItems);
                    setGroupedItems(groupedItems);
                } else {
                    console.error("Problem fetching items :(", fetchedItems);
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
                        email: item.sellerEmail,
                        name: item.sellerDetails ? `${item.sellerDetails.firstName} ${item.sellerDetails.lastName}` : 'Unknown Seller',
                        image: item.sellerDetails?.profilePic
                    },
                    items: []
                };
            }
            acc[key].items.push(item);
            //console.log("Group being created/updated: ", acc[key])
            return acc;
        }, {});
        //console.log("Groups from groupItemsBySeller: ", groups)
        return Object.values(groups);
    };

    const handleRemoveFromBag = async (itemId) => {
        const user = auth.currentUser;
        if (user) {
            await removeFromBag(user.email, itemId);

            setGroupedItems((currentitems) =>
                currentitems.map(group => ({
                    ...group,
                    items: group.items.filter((item) => item.id !== itemId)
                }))
            );
        }
    };

    // const handleIndSelectedItem = (itemId, isSelected) => {
    //     setSelectedToDelete((currentSelected) => {
    //         const newSelected = { ...currentSelected };
    //         if (isSelected) {
    //             newSelected[itemId] = true;
    //         } else {
    //             delete newSelected[itemId];
    //         }
    //         return newSelected;
    //     });
    // };

    const handleDeleteAllSellerItems = async (sellerEmail) => {
        console.log("sellerEmail from handleDeleteAllSellerItems: ", sellerEmail)
        const user = auth.currentUser;
        if (user) {
            const itemIds = groupedItems.find(group => group.sellerInfo.email === sellerEmail).items.map(item => item.id);
            for (const itemId of itemIds) {
                await removeFromBag(user.email, itemId);
            }
            setGroupedItems(prevGroupedItems => prevGroupedItems.filter(group => group.sellerInfo.email !== sellerEmail));
            setSelectedToDelete(prevSelected => {
                const updatedSelection = {...prevSelected};
                delete updatedSelection[sellerEmail];
                return updatedSelection;
            });
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
        if (editMode) {
            setSelectedToDelete({});
        }
    };

    const navigateToOffer = (sellerItems) => {
        navigation.navigate("Offer", { listings: sellerItems });
    };

    return (
        <ScrollView 
            style={{backgroundColor:"white"}}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}/>   
            }
        >
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
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {group.items.map((item) => (    
                            <View key={item.id} style={styles.listingContainer}>
                                <TouchableOpacity 
                                    style={styles.listingImageContainer}
                                    onPress={() => navigation.navigate("Listing", { listing: item, sourceScreen: "Bag"})}
                                >
                                    <Image
                                        source={{ uri: item.listingImg1 || "https://via.placeholder.com/150" }}
                                        style={styles.listingImage}
                                    />
                                    {editMode && (
                                        <View style={styles.deleteIconContainer}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    handleRemoveFromBag(item.id);
                                                  }}
                                                style={styles.deleteIcon}
                                            >
                                                <Ionicons 
                                                    name="remove-circle" 
                                                    size={25} 
                                                    color="#e8594f"/>
                                            </TouchableOpacity>
                                        </View>    
                                    )}
                                </TouchableOpacity> 
                                <Text style={styles.listingTitle}>
                                    {item.title}
                                </Text>
                                <Text style={styles.listingPrice}>Price: ${item.price}</Text>
                            </View>
                            ))}
                         </ScrollView>

                        {/* ======== CHECKOUT ======== */}
                        {editMode ? (
                            <TouchableOpacity
                                style={styles.checkoutContainer}
                                onPress={() => handleDeleteAllSellerItems(group.sellerInfo.email)}
                            >
                                <Text style={styles.deleteAllItemsBtn}>Delete All Items</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.checkoutContainer}
                                onPress={() => navigateToOffer(group.items)}
                            >
                                <Text style={styles.checkoutButton}>Checkout</Text>
                            </TouchableOpacity>
                        )}

                        {/* ======== DIVIDER ======== */}
                        {index !== groupedItems.length - 1 && (
                            <View style={styles.divider} />
                        )}
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
    deleteIconContainer: {
        position: "absolute",
        top: 0,
        right: -10,
        zIndex: 1,
    },
    deleteIcon: {
        //position: "absolute",
        //top: -105,
        //right: -60,
        //top: 0,
        //right: 0,
        //zIndex: 1,
        //padding: 10,
        //backgroundColor: "yellow",
    },
    deleteAllItemsBtn: {
        backgroundColor: "#e8594f", //received offers red
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        width: "90%",
        padding: 8,
        margin: 10,
        borderRadius: 10,
        overflow: "hidden",
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
        position: "relative",
        //alignItems: "center",
        padding: 10,
        //alignItems: "flex-start",
        //flex: 1,
        //overflow: "hidden",
        //backgroundColor: "pink",
        width: 210,
    },
    listingImageContainer: {
        //position: "relative",
        width: 100,
        height: 100,
        padding: 10,
        alignItems: "center",
        //justifyContent: "space-between",
        overflow: "visible",
        //flexDirection: "row",
        flex: 1,
    },
    listingImage: {
        width: 100,
        height: 100,
        borderRadius: 15,
        resizeMode: "contain",
        borderRadius: 15,
    },
    listingTitle: {
        paddingTop: 15,
        paddingBottom: 10,
        fontSize: 18,
        fontWeight: "bold",
        flexShrink: 1,
    },
    listingPrice: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#3f9eeb"
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
