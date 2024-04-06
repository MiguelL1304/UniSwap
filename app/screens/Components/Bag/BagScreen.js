import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { auth } from "../../../../Firebase/firebase";
import { getBagItems } from "./BagLogic";

const Bag = () => {
    const [items, setItems] = useState([]);

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

    return (
        <View>
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View>
                        <Text>Title: {item.title}</Text>
                        <Text>Price: ${item.price}</Text>
                    </View>    
                )}
            />
        </View>
    )
}

export default Bag;
