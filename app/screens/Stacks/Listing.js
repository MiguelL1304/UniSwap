import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert, Keyboard } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, FieldValue, deleteField } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import ProgressBar from "../Components/ProgressBar";
import Uploading from "../Components/Uploading";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import defaultImg from "../../assets/defaultImg.png";

const Listing = ({ route }) => { // Receive profile data as props

    const { listing } = route.params;

    const {
        id, 
        price, 
        title, 
        description, 
        condition, 
        category, 
        subject, 
        course,
        listingImg1,
        listingImg2,
        listingImg3,
        listingImg4,
        listingImg5 
    } = listing;

    const [isInWishlist, setIsInWishlist] = useState(false);

    //Navigator
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        const checkWishlist = async () => {
            try {
                const email = auth.currentUser ? auth.currentUser.email : null;
                if (!email) {
                    throw new Error("Current user is null or email is undefined.");
                }

                const wishlistDocRef = doc(collection(firestoreDB, "wishlist"), email);
                const wishlistDocSnap = await getDoc(wishlistDocRef);

                if (wishlistDocSnap.exists()) {
                    const wishlistData = wishlistDocSnap.data();
                    setIsInWishlist(!!wishlistData[id]); // Set isInWishlist to true if the listing ID exists in the wishlist
                }
            } catch (error) {
                console.error(error.message);
            }
        };

        checkWishlist();
    }, [id, isFocused]);

    const handleAddWishlist = async () => {
        try {
          const email = auth.currentUser ? auth.currentUser.email: null;
          if (!email) {
            throw new Error("Current user is null or email is undefined.");
          }
          
          const wishlistRef = collection(firestoreDB, "wishlist");
          const wishlistDocRef = doc(wishlistRef, email);
          const wishlistDocSnap = await getDoc(wishlistDocRef);
          const wishlistData = wishlistDocSnap.data();
  
          if (wishlistDocSnap.exists()) {
            // If the document exists, update it
            await setDoc(wishlistDocRef, {
              ...wishlistData,
              [id]: true,
            }, { merge: true });
          } else {
            // If the document doesn't exist, create it
            await setDoc(wishlistDocRef, {
              [id]: true,
            });
          }

          setIsInWishlist(true);
  
        } catch (error) {
          console.error(error.message);
        }
    };

    const handleRemoveWishlist = async () => {
        try {
            const email = auth.currentUser ? auth.currentUser.email: null;
            if (!email) {
                throw new Error("Current user is null or email is undefined.");
            }
          
            const wishlistRef = collection(firestoreDB, "wishlist");
            const wishlistDocRef = doc(wishlistRef, email);

            const wishlistDocSnapshot = await getDoc(wishlistDocRef);

            if (wishlistDocSnapshot.exists()) {
            // Get the data from the snapshot
            const userData = wishlistDocSnapshot.data();
        
            if (userData.hasOwnProperty(id)) {
                // Remove the specific field you want to delete
                delete userData[id];
        
                // Update the document with the modified data
                await setDoc(wishlistDocRef, userData)
                    .then(() => { 
                        console.log("Code Field has been deleted successfully"); 
                    })
                    .catch((error) => { 
                        console.error("Error deleting code field:", error); 
                    });
            } else {
                console.error("Field to delete does not exist in the document.");
            }
            } else {
                console.error("Document does not exist.");
            }

            setIsInWishlist(false);
        } catch (error) {
          console.error(error.message);
        }
    };


    return (
        <ScrollView style={styles.container}>
          <Image
            source={{ uri: listingImg1 || "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg" }}
            style={styles.image}
          />
          <View style={styles.detailContainer}>
            <Text style={styles.title}>Title: {title}</Text>
            <Text style={styles.text}>Description: {description}</Text>
            <Text style={styles.text}>Price: ${price}</Text>
            <Text style={styles.text}>Condition: {condition}</Text>
            <Text style={styles.text}>Category: {category}</Text>
            <Text style={styles.text}>Subject: {subject}</Text>
            <Text style={styles.text}>Course: {course}</Text>
            <Text style={styles.text}>Document Name: {id}</Text>
            <TouchableOpacity 
                onPress={isInWishlist ? handleRemoveWishlist : handleAddWishlist} 
                style={styles.heartButton}
            >
                <Text style={[styles.heartText, { color: isInWishlist ? "red" : "black" }]}>{"<3"}</Text>
            </TouchableOpacity> 
          </View>
        </ScrollView>
      );
    };
    
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    image: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
    },
    detailContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
    },
    heartButton: {
        alignItems: "center",
        marginTop: 10,
    },
    heartText: {
        fontSize: 24,
        color: "black",
    },
});

export default Listing;

