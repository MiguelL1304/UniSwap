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
import Swiper from 'react-native-swiper';


const ListingDetails = ({ route }) => {
    const { listing, sourceScreen } = route.params;
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
    
    // const { sourceScreen } = route.params;
  
    // Declarations for state hooks
    const [isInWishlist, setIsInWishlist] = useState(false); // Ensure unique declaration
    const [selectedDate, setSelectedDate] = useState(""); // Ensure unique declaration
    const [selectedLocation, setSelectedLocation] = useState(""); // Additional state hook for location
  

    //Navigator
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [userName, setUserName] = useState('');
    const [userPic, setUserPic] = useState('');

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
    

return (
  <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

    <View style={styles.listedByContainer}>
      <Image
        source={{ uri: userPic ? userPic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
        style={styles.profileImg}
      />
      {/* seller's name button --> go to seller profile */}
      <View>
        <Text style={styles.listedBy}>{`${userName}`}</Text>
      </View>
    </View>


    {/* <View>
      <Image
        source={{ uri: listingImg1 || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
    </View> */}

    <Swiper 
      style={styles.wrapper} 
      autoHeight={true} 
      activeDot={
        <View style={{
          backgroundColor: '#3f9eeb', 
          width: 8, 
          height: 8, 
          borderRadius: 4, 
          marginLeft: 3, 
          marginRight: 3, 
          marginTop: 3, 
          marginBottom: 3,}} 
        />
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listingImg1 || "https://via.placeholder.com/150" }}
          style={styles.image}
        />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listingImg1 || "https://via.placeholder.com/150" }}
          style={styles.image}
        />
      </View>
      
    </Swiper>
    
    
    <View style={styles.container2}>
      <Text style={styles.price}>${price}</Text>
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


    {/* Add Picker components for date/time and location selections here */}
  </ScrollView>
);
        }
    
    const styles = StyleSheet.create({
      wrapper: {
        height: 350,
      },
      imageContainer: {
        alignItems: 'center',
      },
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
    
    export default ListingDetails;