import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
  } from "react-native";
import { TextInput } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, FieldValue, deleteField } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ProgressBar from "../Components/ProgressBar";
import Uploading from "../Components/Uploading";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import defaultImg from "../../assets/defaultImg.png";
import ImageCarousel from '../Components/ImageCarousel';
import WishlistButton from '../Components/WishlistButton';
import { Picker } from '@react-native-picker/picker';
import Swiper from "react-native-swiper";


const Listing = ({ route }) => {
  const { listing } = route.params;
  const {
      id,
      price,
      title,
      listingImg1,
      listingImg2,
      listingImg3,
      listingImg4,
      listingImg5,
      firstName,
      lastName,
      condition,
      subject,
      course,
      description
  } = listing;

    const images = [listingImg1, listingImg2, listingImg3, listingImg4, listingImg5].filter(img => img);
  
    // Declarations for state hooks
    const [isInWishlist, setIsInWishlist] = useState(false); // Ensure unique declaration
    const [selectedDate, setSelectedDate] = useState(""); // Ensure unique declaration
    const [selectedLocation, setSelectedLocation] = useState(""); // Additional state hook for location
  

    //Navigator
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [userName, setUserName] = useState('');



    const fetchUserProfile = async (listingId) => {
    const userEmailPrefix = listingId.split('_')[0];
    const profileDocRef = doc(firestoreDB, 'profile', userEmailPrefix);
    const profileDocSnap = await getDoc(profileDocRef);

    if (profileDocSnap.exists()) {
        const profileData = profileDocSnap.data();
        setUserName(`${profileData.firstName} ${profileData.lastName}`);
    } else {
        setUserName("User not found");
    }
    };

    useEffect(() => {
    if (listing && listing.id) {
        fetchUserProfile(listing.id);
    }
    }, [listing, listing.id]);


    
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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.listedByContainer}>
              <Text style={styles.listedBy}>Listed by: {`${firstName} ${lastName}`}</Text>
          </View>
          <Swiper style={styles.swiperContainer}>
              {images.map((img, index) => (
                  <View key={index}>
                      <Image
                          source={{ uri: img || "https://via.placeholder.com/150" }}
                          style={styles.image}
                      />
                  </View>
              ))}
          </Swiper>
          <Text style={styles.price}>${price}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Trade</Text>
              </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => { 
                setIsInWishlist(!isInWishlist); 
                if (isInWishlist) {
                  handleRemoveWishlist();
                } else {
                  handleAddWishlist();
                }
              }}
            style={styles.heartButton}
          >
            <Text style={[styles.heart, { color: isInWishlist ? "red" : "grey" }]}>
              {isInWishlist ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
    
          {/* Display condition, subject, and course fields */}
          <Text style={styles.detailText}>Condition: {listing.condition}</Text>
          <Text style={styles.detailText}>Subject: {listing.subject}</Text>
          <Text style={styles.detailText}>Course: {listing.course}</Text>
          <Text style={styles.detailText}>Description: {listing.description}</Text>
    
          {/* Add Picker components for date/time and location selections here */}
        </ScrollView>
      );
        }
    
        const styles = StyleSheet.create({
          container: {
              flex: 1,
              backgroundColor: "white",
          },
          detailText: {
              textAlign: 'center',
              fontSize: 16,
              marginVertical: 4,
          },
          contentContainer: {
              alignItems: 'center',
              paddingTop: 50,
          },
          listedByContainer: {
              alignSelf: 'flex-start',
              marginLeft: 15,
              position: 'absolute',
              top: 10,
          },
          listedBy: {
              fontSize: 16,
              fontWeight: 'bold',
          },
          swiperContainer: {
              height: 200, // Adjust the height as needed
          },
          image: {
              width: '100%',
              height: '100%',
              aspectRatio: 1, // Keep the aspect ratio of the image
              borderRadius: 10,
          },
          price: {
              fontSize: 24,
              fontWeight: 'bold',
              marginVertical: 8,
              alignSelf: 'center',
          },
          title: {
              textAlign: 'center',
              fontSize: 18,
              marginVertical: 8,
          },
          buttonContainer: {
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              padding: 10,
          },
          button: {
              backgroundColor: "#e6f2ff",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 5,
              flexGrow: 1, // Buttons take equal space
              marginHorizontal: 5, // Add some space between the buttons
          },
          buttonText: {
              textAlign: 'center',
              fontWeight: 'bold',
          },
          heartButton: {
              marginVertical: 8,
              alignSelf: 'center',
          },
          heart: {
              fontSize: 24,
          },
          picker: {
              width: 200,
              height: 50,
          },
      });
    
    export default Listing;