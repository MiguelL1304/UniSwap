import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, ScrollView } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation, useIsFocused } from "@react-navigation/native";

const ReceivedOffers = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    if (isFocused) {
      fetchOffers();
    } 
  }, [isFocused]);

  const fetchOffers = async () => {
    try {
      const email = auth.currentUser ? auth.currentUser.email : null;
      if (!email) {
        throw new Error("Current user is null or email is undefined.");
      }  
      const sellerDocRef = doc(firestoreDB, "profile", email);
      const querySnapshot = await getDocs(collection(sellerDocRef, "receivedOffers"));

      const fetchedOffers = [];
      querySnapshot.forEach((doc) => {
        fetchedOffers.push({ id: doc.id, ...doc.data() });
      });

      setOffers(fetchedOffers);
      console.log(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <OfferItem item={item} />
    );
  };

  return (
    <ScrollView>
      {offers.length > 0 ? (
        <FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <Text>No offers at this time</Text>
      )}
    </ScrollView>
  );
};

const OfferItem = ({ item }) => {
  const [userName, setUserName] = useState('');
  const [userPic, setUserPic] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileDocRef = doc(firestoreDB, 'profile', item.sentBy);
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

    fetchUserProfile();
  }, [item.sentBy]);


  const totalPriceCal = item.listings.reduce((total, currentListing) => total + parseFloat(currentListing.price.replace('$', '')), 0);
  const totalPrice = totalPriceCal.toString();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.listings[0].listingImg1 || "https://via.placeholder.com/150" }}
            style={styles.listingImg}
          />
        </View>

        <View>
          <Text style={styles.titleText}>
            {item.listings[0].title}
            {item.listings.length > 1 ? ` and ${item.listings.length - 1} more` : ''}</Text>
          <Text style={{ ...styles.titleText, fontSize: 14, opacity: 0.8 }}>Total Value: ${totalPrice}</Text>
        </View>          
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.userInfo}>
          <Image source={{ uri: userPic }} style={styles.profilePic} />
          
        </View>
        <Text style={styles.username}>{userName}</Text>
        <Text style={styles.offerPrice}>{item.offerPrice}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Reject</Text>
        </TouchableOpacity>   
      </View>
          
          
        

      
    </View>
  );
};

const styles = StyleSheet.create({
  contentSheet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: -30,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#ffffff',
  },
  listingsContainer: {
    backgroundColor: "white",
  },
  divider: {
    width: '100%',
    height: 10,
    backgroundColor: '#e6f2ff', 
    marginVertical: 10, 
  },
  menuView: {
    width: "85%", 
    height: "18%",
    borderRadius: 10,
  },
  menuView2: {
    width: "85%", 
    height: "14%",
    borderRadius: 10,
  },
  menuBS: {
    width: "100%", 
    height: "85%",
    backgroundColor: "#ffffff",
    marginTop: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  topMenuButton: {
    width: "100%", 
    height: "33%",
    borderRadius: 10,
    paddingRight: 10,
  },
  topMenuButton2: {
    width: "100%", 
    height: "50%",
    borderRadius: 10,
    paddingRight: 10,
  },
  menuButton: {
    width: "100%", 
    height: "33%",
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
    borderBottomLeftRadius: 10, 
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderColor: '#3f9eeb',
    paddingRight: 10,
  },
  menuButton2: {
    width: "100%", 
    height: "50%",
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
    borderBottomLeftRadius: 10, 
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderColor: '#3f9eeb',
    paddingRight: 10,
  },
  topMenuButtonBS: {
    width: "100%", 
    height: "33%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingTop: 5,
  },
  menuButtonBS: {
    width: "100%", 
    height: "25%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
    borderBottomLeftRadius: 10, 
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderColor: '#3f9eeb',
    paddingTop: 5,
  },
  listingItem: {
    flexDirection: "column",
    padding: 15,
    alignItems: 'center',   
  },
  listingImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    margin: 15,
    borderRadius: 15,
  },
  textContainer: {
    width: '100%',
    
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 5,
  },
  listingPrice: {
    fontSize: 16,
    color: "green",
    paddingLeft: 5,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 5,
  },
  checkIcon: {
    position: 'absolute',
    top: '30%', 
    right: '30%',
    zIndex: 1, 
    color: '#3f9eeb', 
  },
  noResultsFound: {
    fontSize: 25,
    textAlign: "center",
  },
  scrollViewContainer: {
    flexGrow: 1, // Allow the ScrollView to grow vertically
    paddingHorizontal: 20,
    paddingTop: 20, // Adjust padding as needed
    paddingBottom: 35, // Adjust padding as needed
  },
  subjectButtonTop: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  subjectButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#3f9eeb',
  },
  subjectText: {
    color: '#3f9eeb',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationBox: {
    padding: 3,
    margin: 5,
  },
  locationText: { //individual subjects in the subject option (Accounting, Bio, etc.)
    fontSize: 20,
    padding: 5,
    color: "#3f9eeb",
  },
  priceInput: {
    backgroundColor: '#e6f2ff',
    flex: 1,
    fontSize: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#3f9eeb',
    borderRadius: 10,
    color: '#3f9eeb', 
  },
  priceText: {
    fontSize: 22,
    fontWeight: '400',
    color: "#3f9eeb",
    padding: 5,
  },
  priceContainer: {
    width: "100%",
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 10,
    paddingRight: 20,
  },
  contentContainer: {
    width: "100%",
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'left',
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '400',
    color: "#3f9eeb",
    padding: 5,
  },
  courseText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "#3f9eeb",
    padding: 5,
  },
  titleTextMenu: {
    fontSize: 20,
    fontWeight: '400',
    color: "#3f9eeb",
    padding: 5,
    paddingTop: 10,
  },
  menuSelection: {
    fontSize: 20,
    color: "#3f9eeb",
    padding: 5,
    paddingTop: 10,
  },
  titleBody: {
    fontSize: 14,
    color: "#5fb6e3",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: "100%",
    height: "25%",
  },
  button: {
    backgroundColor: "#3f9eeb",
    width: "30%",
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    width: "30%",
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#3f9eeb",
    borderWidth: 2.5,
    margin: 10,
  },
  buttonOutline: {
    backgroundColor: "white",
    color: "#3f9eeb",
    marginTop: 5,
    borderColor: "#3f9eeb",
    borderWidth: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  cancelText: {
    color: "#3f9eeb",
    fontWeight: "500",
    fontSize: 16,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '20%',
    margin: 15,
  },
  listingImg: {
    width: '100%',
    borderRadius: 10,
    aspectRatio: 1,
  },



  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  // Add more styles as needed
});

export default ReceivedOffers;