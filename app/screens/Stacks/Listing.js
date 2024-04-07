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
import { addToBag } from "../Components/Bag/BagLogic";
import SellerProfile from "./SellerProfile";


const Listing = ({ route }) => {
    const { listing } = route.params;
    const {
      id,
      price,
      title,
      listingImg1,
      condition,
      subject,
      course,
      description
    } = listing;
  
    // Declarations for state hooks
    const [isInWishlist, setIsInWishlist] = useState(false); // Ensure unique declaration
    const [selectedDate, setSelectedDate] = useState(""); // Ensure unique declaration
    const [selectedLocation, setSelectedLocation] = useState(""); // Additional state hook for location
  

    //Navigator
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [userName, setUserName] = useState('');
    const [userPic, setUserPic] = useState('')

    const fetchUserProfile = async () => {
      try {
        const userEmailPrefix = listing.id.split('_')[0];
        const profileDocRef = doc(firestoreDB, 'profile', userEmailPrefix);
        const profileDocSnap = await getDoc(profileDocRef);

        if (profileDocSnap.exists()) {
          const profileData = profileDocSnap.data();
          setUserName(`${profileData.firstName} ${profileData.lastName}`);
          setUserPic(`${profileData.profilePic}`);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
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
// navigate to seller's profile from user name
    const handleSellerProfile = () => {
      navigation.navigate("SellerProfile", {listing});
    };    
    //const handleAddToBag = (listing) => {
    const handleAddToBag = async () => {  
      const user = auth.currentUser;
      if (user) {
        const itemDetails = {
          id: listing.id,
          price: listing.price,
          title: listing.title,
          listingImg1: listingImg1,
        };
        await addToBag(user.email, itemDetails);
      } else {
        console.error("User must be logged in to add items to bag.");
      }
      
      navigation.navigate("Bag", { listing: listing });    
    };
// 
// 
// TEMPORARILLY HERE. TO BE DELETED LATER
// 
// 
// 
// 
// 
const handleOffer = async () => {  
  navigation.navigate("Offer", { listing: listing });
};
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 


    return (
  <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <View style={styles.listedByContainer}>
      <Image
        source={{ uri: userPic ? userPic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
        style={styles.profileImg}
      />
      {/* seller's name button --> go to seller profile */}
      <TouchableOpacity onPress={handleSellerProfile}>
      <Text style={styles.listedBy}>{`${userName}`}</Text>
      </TouchableOpacity>
    </View>
    <View>
      <Image
        source={{ uri: listingImg1 || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
    </View>
    
    <View style={styles.container2}>
      <Text style={styles.price}>${price}</Text>

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
    </View>
    
    <Text style={styles.title}>{title}</Text>
    

    {/* Details section */}
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Details</Text>
    </View>
    
    {/* Description section */}
    <View style={styles.detailsSection}>
      <Text style={styles.detailsLabel}>Condition:</Text>
      <Text style={styles.detailsText}>{listing.condition}</Text>
    </View>
    <View style={styles.detailsSection}>
      <Text style={styles.detailsLabel}>Subject:</Text>
      <Text style={styles.detailsText}>{listing.subject}</Text>
    </View>
    <View style={styles.detailsSection}>
      <Text style={styles.detailsLabel}>Course:</Text>
      <Text style={styles.detailsText}>{listing.course}</Text>
    </View>
    <View style={styles.detailsSection}>
      <Text style={styles.detailsLabel}>Description:</Text>
      <Text style={styles.detailsText}>{listing.description}</Text>
    </View>

    {/* Buy and Trade buttons */}
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={() => handleAddToBag(listing)}>Add to Bag</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={() => handleOffer(listing)}>Trade</Text>
      </TouchableOpacity>
    </View>

    {/* Add Picker components for date/time and location selections here */}
  </ScrollView>
);
        }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: "white",
      },
      container2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '70%',
        // borderWidth: 1,
        // borderColor: 'black',
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
        flexDirection: 'row', 
        alignItems: 'center', 
      },
      listedBy: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 15,
      },
      image: {
        width: '80%',
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
        paddingLeft: 100,
      },
      heart: {
        fontSize: 30,
      },
      picker: {
        width: 200,
        height: 50,
      },
      profileImg: { // circle for profile picture
        width: 30,
        height: 30,
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
        marginLeft: 15,
      },
      detailsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
      },
      detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      detailsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
      },
      detailsLabel: {
        flex: 1,
        fontWeight: 'bold',
      },
      detailsText: {
        flex: 3,
      },
    });
    
    export default Listing;