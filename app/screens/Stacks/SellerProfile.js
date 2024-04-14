import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB, auth } from "../../../Firebase/firebase";
import defaultImg from "../../assets/defaultImg.png";


const windowWidth = Dimensions.get("window").width;

const SellerProfile = ({ route }) => {

  const navigation = useNavigation();
  const [sellerListings, setSellerListings] = useState([]);
  const [numColumns] = useState(3);
  const [userName, setUserName] = useState('');
  const [userPic, setUserPic] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userUni, setUserUni] = useState('');

  useEffect(() => {
    if (route && route.params && route.params.listing && route.params.listing.id) {
      const { listing } = route.params;
      const userId = listing.id.split('_')[0];
      fetchSellerProfile(userId);
    }
  }, [route]);


  const handleListing = (listing) => {
    // navigation.replace("Listing", { listing: listing, sourceScreen: "SellerProfile" });
    // navigation.replace("Listing", { listing, sourceScreen: "SellerProfile" });
    navigation.replace("Listing", {listing: listing});

  };  


  const fetchSellerProfile = async (userId) => {
    try {
      const profileDocRef = doc(firestoreDB, 'profile', userId);
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


  // Fetch Seller's Listings
  useEffect(() => {
    if (route && route.params && route.params.listing && route.params.listing.id) {
      const { listing } = route.params;
      const userId = listing.id.split('_')[0];
      
      const fetchSellerListings = async () => {
        try {
          const userListingRef = doc(firestoreDB, "userListing", userId);
          const userListingSnapshot = await getDoc(userListingRef);
    
          if (userListingSnapshot.exists()) {
            const userListingData = userListingSnapshot.data();
            const listingIds = Object.keys(userListingData);
    
            if (!Array.isArray(listingIds)) {
              throw new Error("Listing IDs is not an array.");
            }
            
            const items = await Promise.all(listingIds.map(async (listingId) => {
              const listingDocRef = doc(firestoreDB, "listing", listingId);
              const listingDocSnapshot = await getDoc(listingDocRef);
    
              if (listingDocSnapshot.exists()) {
                const listingData = listingDocSnapshot.data();
                return { id: listingId, listingImg1: listingData.listingImg1, ...listingData };
              } else {
                console.log("Listing document not found");
                return null;
              }
            }));
    
            const filteredItems = items.filter((item) => item !== null);
            setSellerListings(filteredItems);
          } else {
            console.warn("Seller listing document not found")
          }
        } catch (error) {
          console.error('Error fetching seller listings:', error);
        }
      };
      fetchSellerListings();
    }
  }, [route]);

  
  return (
    <View style={styles.container}>
        {/* Display profile section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImgContainer}>
          <View style={styles.profileImgBorder}>
            <View style={styles.profileImgWrapper}>
              <Image
              source={{ uri: userPic ? userPic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
              style={styles.profileImg}
              />
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userUni}>{userUni}</Text>
        </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.userBio}>{userBio}</Text>
        </View>

        

        {/* Divider */}
        <View style={styles.line} />
        
        {/* Display seller's listings */}
        <View style={styles.listingContainer}>
        <FlatList
          data={sellerListings} 
          numColumns={numColumns}
          renderItem={({ item }) => (
            // click on listing --> listing page
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

        
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f2ff',
    // paddingTop: 70,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImgContainer: {
    marginRight: 20,
  },
  profileImgWrapper: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImgBorder: {
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#3f9eeb', 
    padding: 2, 
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  userUni: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 2,
    fontStyle: 'italic'
  },
  bioContainer: {
    paddingTop: 10,
    paddingLeft: 30,
  },
  userBio: {
    fontSize: 17,
    fontWeight: '500',
    paddingBottom: 25,
  },
  line: {
    borderBottomWidth: 5,
    borderBottomColor: '#3f9eeb',
  },
  listingContainer: {
    flex: 1,
    backgroundColor: "white",
  },
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
