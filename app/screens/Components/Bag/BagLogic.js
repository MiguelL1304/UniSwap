import React from "react";
import { firestoreDB } from "../../../../Firebase/firebase";
import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, Timestamp, onSnapshot } from "firebase/firestore";

export const addToBag = async (userEmail, itemDetails) => {

    // referencing SUBCOLLECTION "bag" under user's document in "profile" collection
    const bagRef = collection(firestoreDB, "profile", userEmail, "bag");

    // itemRef points to specific doc in user's "bag" subcollection corresponding to the item being added
    const itemRef = doc(bagRef, itemDetails.id);

    try {
        await setDoc(itemRef, {
            ...itemDetails,
            addedAt: Timestamp.fromDate(new Date()),
        });
        console.log("ITEM ADDED");
    } catch (error) {
        console.error("Error adding item to bag: ", error);
    }
};


export const removeFromBag = async (userEmail, itemID) => {
    const itemRef = doc(firestoreDB, "profile", userEmail, "bag", itemID);
    try {
        await deleteDoc(itemRef);
        console.log("ITEM REMOVED");
    } catch (error) {
        console.error("Problem removing item from bag: ", error);
    }
}

const fetchSellerDetails = async (sellerEmail) => {
    const sellerDocRef = doc(firestoreDB, "profile", sellerEmail);
    const sellerDocSnap = await getDoc(sellerDocRef);
    if (sellerDocSnap.exists()) {
        //console.log("sellerDocSnap from fetchSellerDetails: ", sellerDocSnap)
        return sellerDocSnap.data();
    } else {
        console.error("Seller profile NOT FOUND for: ", sellerEmail);
        return null;
    }
}

export const getBagItems = async (userEmail) => {
    const bagRef = collection(firestoreDB, "profile", userEmail, "bag");
    
    try {
        const snapshot = await getDocs(bagRef);
        const itemsWithDetails = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const sellerEmail = doc.id.split("_")[0];
            const sellerDetails = await fetchSellerDetails(sellerEmail);

            return {
                ...data,
                id: doc.id,
                sellerEmail,
                sellerDetails,
            };
        }));
        console.log("itemCount: ", snapshot.size)

        return {
            itemCount: snapshot.size,
            items: itemsWithDetails
        };
    } catch (error) {
        console.error("CAN'T FETCH ITEMS :(", error);
        return { itemCount: 0, items: []};
    }
};

export const getBagItemCount = async (userEmail) => {
    try {
        const result = await getBagItems(userEmail);
        return result.itemCount;
    } catch (error) {
        console.error("Error fetching item count :( ", error)
        return 0;
    }
};

export const listenForBagItemCount = (userEmail, setItemCount) => {
    const bagRef = collection(firestoreDB, "profile", userEmail, "bag");
    const unsubscribe = onSnapshot(bagRef, snapshot => {
        setItemCount(snapshot.size);
        console.log("UPDATED item count: ", snapshot.size)
    }, error => {
        console.error("Error listening for item count changes: ", error);
    });

    return unsubscribe;
}

export const handleSellerPress = (navigation, listing) => {
    //console.log("LISTING in handleSellerPress: ", listing);
    navigation.navigate("SellerProfile", { listing });
}
