import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { auth } from "../../../../Firebase/firebase";
import { getBagItems, removeFromBag } from "./BagLogic";
import { TouchableOpacity } from "react-native-gesture-handler";

const Bag = () => {
    const [items, setItems] = useState([]);
    const [editMode, setEditMode] = useState(false);

    // adding item
    useEffect(() => {
        const fetchItems = async () => {
            const user = auth.currentUser;
            if (user) {
                const fetchedItems = await getBagItems(user.email);
                setItems(fetchedItems);
            }
        };

        fetchItems();
    }, []);

    const handleRemoveFromBag = async (itemId) => {
        const user = auth.currentUser;
        if (user) {
            await removeFromBag(user.email, itemId);
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        }
    }

    return (
        <View>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Text>{editMode ? "Done" : "Edit"}</Text>
            </TouchableOpacity>
            <FlatList
                data={items}
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
    );
}

export default Bag;
