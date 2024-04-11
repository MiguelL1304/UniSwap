import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { auth } from "../../../../Firebase/firebase";
import { getBagItems, removeFromBag } from "./BagLogic";
import { TouchableOpacity } from "react-native-gesture-handler";

const Bag = () => {
    const [editMode, setEditMode] = useState(false);
    const [groupedItems, setGroupedItems] = useState([]);

    // adding + grouping item(s)
    useEffect(() => {
        const groupItemsBySeller = (items) => {
            const grouped = items.reduce((acc, item) => {
                const key = item.sellerEmail; // or any unique identifier
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

            return Object.values(grouped); // Convert the dictionary to an array for rendering
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
                prevGroupedItems.map(group => ({
                    ...group,
                    items: group.items.filter(item => item.id !== itemId)
                }))
            );
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                <Text>{editMode ? "Done" : "Edit"}</Text>
            </TouchableOpacity>
            {groupedItems.map((group, index) => (
                <View key={index}>
                    <TouchableOpacity>
                        <Image
                            source={{ uri: group.sellerInfo.image || "https://via.placeholder.com/150" }}
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                        />
                        <Text>{group.sellerInfo.name}</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={group.items}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View>
                                <Image
                                    source={{ uri: item.listingImg1 || "https://via.placeholder.com/150" }}
                                    style={{ width: 100, height: 100 }}
                                />
                                <Text>Title: {item.title}</Text>
                                <Text>Price: ${item.price}</Text>
                                {editMode && (
                                    <TouchableOpacity onPress={() => handleRemoveFromBag(item.id)}>
                                        <Text>Delete Item</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                </View>
            ))}
        </View>
    );
}

export default Bag;
