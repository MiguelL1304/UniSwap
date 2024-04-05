import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ScrollView,FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB, auth } from "../../../Firebase/firebase";
import defaultImg from "../../assets/defaultImg.png";


const windowWidth = Dimensions.get("window").width;

const SellerProfile = ({ route }) => {
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
  
  
  const navigation = useNavigation();
  const [sellerListings, setSellerListings] = useState([]);
  const [numColumns, setNumColumns] = useState(3);
  const userId = listing.id.split('_')[0];


  const [userName, setUserName] = useState('');
  const [userPic, setUserPic] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userUni, setUserUni] = useState('');


  const handleListing = (listing) => {
    navigation.navigate("Listing", { listing: listing });
  };

// Fetch Seller's profile information
  const fetchSellerProfile = async () => {
    try {
      const userEmailPrefix = listing.id.split('_')[0];
      const profileDocRef = doc(firestoreDB, 'profile', userEmailPrefix);
      const profileDocSnap = await getDoc(profileDocRef);

      if (profileDocSnap.exists()) {
        const profileData = profileDocSnap.data();
        setUserName(`${profileData.firstName} ${profileData.lastName}`);
        setUserPic(`${profileData.profilePic}`);
        setUserUni(`${profileData.college}`);
        setUserBio(`${profileData.bio}`);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  useEffect(() => {
    if (listing && listing.id) {
      fetchSellerProfile(listing.id);
    }
  }, [listing, listing.id]);

  // Fetch Seller's Listings

  useEffect(() => {
    
    const fetchSellerListings = async () => {
      try {
        
        const userListingRef = doc(firestoreDB, "userListing", userId);
        const userListingSnapshot = await getDoc(userListingRef);
  
        if (userListingSnapshot.exists()) {
          const userListingData = userListingSnapshot.data();
          const listingIds = Object.keys(userListingData);
          
          // setSellerListings(listingIds);
        // console.log(sellerListings);
  
          if (!Array.isArray(listingIds)) {
            throw new Error("Listing IDs is not an array.");
          }
          
          const items = await Promise.all(listingIds.map(async (listingId) => {
            const listingDocRef = doc(firestoreDB, "listing", listingId);
            const listingDocSnapshot = await getDoc(listingDocRef);
  
            if (listingDocSnapshot.exists()) {
              const listingData = listingDocSnapshot.data();
              // return { id: listingId, ...listingData };
              return { id: listingId, listingImg1: listingData.listingImg1, ...listingData };


            } else {
              console.log("Listing document not found");
              return null;
            }
          }));
  
          const filteredItems = items.filter((item) => item !== null);
          setSellerListings(filteredItems); // Set the fetched listings
          // setSellerListings(listingIds);
        } else {
          console.warn("Seller listing document not found")
        }
      } catch (error) {
        console.error('Error fetching seller listings:', error);
      }
    };
    fetchSellerListings();
  }, [userId]);
  

  
  


  

  return (
    <View style={styles.container}>
      {/* <ScrollView> */}
        {/* Display profile section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: userPic ? userPic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
            style={styles.profileImg}
          />
          <View style={styles.textContainer}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userUni}>{userUni}</Text>
            <Text style={styles.userBio}>{userBio}</Text>
          </View>
        </View>
        {/* Divider */}
        <View style={styles.line} />
        
        {/* Display seller's listings */}
        <FlatList
          data={sellerListings} 
          numColumns={numColumns}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleListing(item)}>
              <Image
                source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
                style={[styles.galleryImage, { width: windowWidth / numColumns }]}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={styles.flatListContent}
        />

        
      </View>
      {/* </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileContainer: {
    flex: 1,
    paddingTop: 50,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  textContainer: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userUni: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  userBio: {
    fontSize: 14,
  },
  line: {
    borderBottomWidth: 2,
    borderBottomColor: '#3f9eeb',
  },
  // listingsContainer: {
  //   flex: 1,
  //   // paddingHorizontal: 20,
  // },
  // imagesWrapper: {
  //   flexDirection: 'row',
  // },
    galleryImage: {
      height: 130, // Set height as needed
      width: 130,
      margin: 0.5, 
      resizeMode: "cover", // Maintain aspect ratio and cover the area
    },
    flatListContent: {
      flexGrow: 1,
      justifyContent: "flex-start", // Align content to the top
      paddingTop: 1, 
      
    },
});

export default SellerProfile;
