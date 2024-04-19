import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, addDoc, collection, setDoc, updateDoc } from 'firebase/firestore';
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
  const [sellerID, setSellerID] = useState('');
  const [profileFetched, setProfileFetched] = useState(false);


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
    navigation.navigate("Listing2", {listing: listing});

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
        setSellerID(userId);
        setProfileFetched(true);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };


  const handleMessage = async () => {
    try {
      const currentUserEmail = auth.currentUser.email;
      const chatDocName = `${currentUserEmail}_${sellerID}`;
      const reverseChatDocName = `${sellerID}_${currentUserEmail}`; // Name for reverse document
  
      // Fetch the profile document of the current user
      const profileDocRef = doc(firestoreDB, 'profile', currentUserEmail);
      const profileDocSnapshot = await getDoc(profileDocRef);
  
      const sellerDocRef = doc(firestoreDB, 'profile', sellerID);
      const sellerDocSnapshot = await getDoc(sellerDocRef);
  
      if (!profileDocSnapshot.exists()) {
        console.error('Profile document not found for the current user');
        return;
      }
  
      if (!sellerDocSnapshot.exists()) {
        console.error('Seller profile document not found');
        return;
      }
  
      const currentUserData = profileDocSnapshot.data();
      const sellerData = sellerDocSnapshot.data();
  
      // Extract necessary user information
      const { firstName, lastName, profilePic } = currentUserData;
  
      // Create document references for both chat documents
      const chatDocRef = doc(firestoreDB, 'chats', chatDocName);
      const reverseChatDocRef = doc(firestoreDB, 'chats', reverseChatDocName);
  
      // Check if the chat document already exists
      const chatDocSnapshot = await getDoc(chatDocRef);
      const reverseChatDocSnapshot = await getDoc(reverseChatDocRef);
  
      let selectedChatDocRef;
      if (chatDocSnapshot.exists()) {
        selectedChatDocRef = chatDocRef;
      } else if (reverseChatDocSnapshot.exists()) {
        selectedChatDocRef = reverseChatDocRef;
      } else {
        // If neither chat document exists, create a new chat document
        await setDoc(chatDocRef, {
          [currentUserEmail]: {
            name: `${firstName} ${lastName}`,
            profilePic,
            email: currentUserEmail,
          },
          [sellerID]: {
            // Assuming you have seller information available
            // Replace these with actual seller information if available
            name: sellerData.firstName + ' ' + sellerData.lastName,
            profilePic: sellerData.profilePic,
            email: sellerID,
          },
        });
  
        console.log('New chat document created');
        selectedChatDocRef = chatDocRef; // Use the chatDocRef since it was just created
  
        // console.log("error here")
        // console.log(profileDocRef)
        // console.log(chatDocName)
        // console.log(currentUserData)
        // console.log(sellerData)
        // Update chatList in both user's documents
        // Ensure chatList exists in both user's data
        if (!currentUserData.chatList) {
          await setDoc(profileDocRef, { chatList: [chatDocName] }, { merge: true });
        }
        else {
          await updateDoc(profileDocRef, {
            chatList: [chatDocName, ...currentUserData.chatList],
          });
        }
    
        if (!sellerData.chatList) {
          await setDoc(sellerDocRef, { chatList: [chatDocName] }, { merge: true });
        }
        else {
          await updateDoc(sellerDocRef, {
            chatList: [chatDocName, ...sellerData.chatList],
          });
        }
      }
  
      // Fetch chat data using the selected chat document reference
      const chatDoc = await getDoc(selectedChatDocRef);
      const chatData = chatDoc.data();
  
      // Navigate to the chat screen with chat data
      navigation.navigate('Chat', {
        chatId: selectedChatDocRef.id, // Use the ID of the selected chat document reference
        currentUser: {
          name: `${firstName} ${lastName}`,
          profilePic: profilePic,
          email: currentUserEmail,
        },
        seller: {
          name: sellerData.firstName + ' ' + sellerData.lastName,
          profilePic: sellerData.profilePic,
          email: sellerID,
        },
      });
    } catch (error) {
      console.error('Error handling message:', error);
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
          {profileFetched && (
            <TouchableOpacity onPress={handleMessage}>
              <Text style={[styles.userName, { fontSize: 16, color: '#3f9eeb' }]}>Send Message</Text>
            </TouchableOpacity>
          )}
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
