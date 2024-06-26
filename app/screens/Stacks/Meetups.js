import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, FlatList, Text, ScrollView, Dimensions, 
  TouchableOpacity, Animated, Easing, RefreshControl } from "react-native";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome6 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const Meetups = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [meetups, setMeetups] = useState([]);
  const [meetupLocations, setMeetupLocations] = useState([]);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [selectedMeetupLocation, setSelectedMeetupLocation] = useState(null);
  const [animation] = useState(new Animated.Value(1));

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeetups();
    fetchMeetupLocations();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

    
  useEffect(() => {
    if (isFocused) {
      fetchMeetups();
      fetchMeetupLocations();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedMeetup) {
      pulseAnimation();
    }
  }, [selectedMeetup]);

  const pulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.7,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start(() => {
      animation.setValue(1);
    });
  };

  const fetchMeetups = async () => {
    try {
      const email = auth.currentUser ? auth.currentUser.email : null;
      if (!email) {
        throw new Error("Current user is null or email is undefined.");
      }
      const meetupDocRef = doc(firestoreDB, "profile", email);
      const querySnapshot = await getDocs(collection(meetupDocRef, "meetups"));

      const fetchedMeetups = [];
      querySnapshot.forEach((doc) => {
        fetchedMeetups.push({ id: doc.id, ...doc.data() });
      });

      const sortedMeetups = fetchedMeetups.sort((a, b) => {
        const aDate = new Date(a.date.seconds * 1000);
        const aTime = new Date(a.time.seconds * 1000);

        const bDate = new Date(b.date.seconds * 1000);
        const bTime = new Date(b.time.seconds * 1000);

        const aFullDate = new Date(new Date(aDate).setHours(new Date(aTime).getHours(), new Date(aTime).getMinutes()));
        const bFullDate = new Date(new Date(bDate).setHours(new Date(bTime).getHours(), new Date(bTime).getMinutes()));
        
        // Compare the full timestamps
        return aFullDate - bFullDate; // Sorting in descending order
      });

      setMeetups(sortedMeetups);

    } catch (error) {
      console.error("Error fetching meetups:", error);
    }
  };

  const fetchMeetupLocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestoreDB, "meetuplocations"));
      const fetchedLocations = [];
      querySnapshot.forEach((doc) => {
        fetchedLocations.push({ id: doc.id, ...doc.data() });
      });

      setMeetupLocations(fetchedLocations);
    } catch (error) {
      console.error("Error fetching meetup locations: ", error);
    }
  };

  const dotCoordinates = (building) => {
    const buildingCoordinates = {
      A: { x: 235, y: 170},
      B: { x: 55, y: 215},
      C: { x: 35, y: 175},
      D: { x: 335, y: 155},
      E: { x: 55, y: 140},
      F: { x: 280, y: 45},
      L: { x: 100, y: 145},
    };
    return buildingCoordinates[building] || { x: 0, y: 0 };
  };

  const handleMeetupSelect = (meetup) => {
    if (selectedMeetup && selectedMeetup.id === meetup.id) {
      setSelectedMeetup(null);
      setSelectedMeetupLocation(null);
    } else {
      setSelectedMeetup(meetup);
      setSelectedMeetupLocation(meetup.location);
    }
  };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedMeetup && selectedMeetup.id === item.id;
    return (
      <TouchableOpacity onPress={() => handleMeetupSelect(item)}>
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        <FinalizedItems 
          item={item}
          navigation={navigation}
        />
        {index !== meetups.length - 1 && <View style={styles.divider} />}
      </View>
      </TouchableOpacity>
    );
  };
  
  return (
      <View style={styles.mapContainer}>
        {/*GGC Map Image */}
        <Image
          source={require("../../assets/ggc-map.png")}
          style={styles.mapImage}
        />
        <View style={styles.divider}></View>
        {/* Render dots based on meetup locations */}
        {meetupLocations.map((location) => {
          const { building } = location;
          const { x, y } = dotCoordinates(building);
          return (
          selectedMeetup && selectedMeetup.location === location.name ? (
          <View key={building}>
            <Text style={styles.meetupLocationText}>Building {building}: {selectedMeetupLocation}</Text>
            <Animated.View
            style={[
              styles.dot, 
              { left: x, bottom: y, transform: [{ scale: animation }] },
              ]} 
              />
            </View>
          ) : null
        );
      })}

    <ScrollView 
      style={[styles.scrollViewContainer, { backgroundColor: "#e6f2ff"}]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {meetups.length > 0 ? (
        <FlatList
          data={meetups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No meetups at this time.
          </Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const FinalizedItems = ({ item, navigation }) => {
  const [userName, setUserName] = useState('');
  const [userPic, setUserPic] = useState('');
  const [transactionType, setTransactionType] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let profileDocRef;
        if (auth.currentUser && auth.currentUser.email !== item.buyer) {
          // Show the buyer's profile if current user is not the buyer
          profileDocRef = doc(firestoreDB, "profile", item.buyer);
          setTransactionType("Sold To: ");
        } else {
          // Show the seller's profile if current user is the buyer
          profileDocRef = doc(firestoreDB, "profile", item.seller);
          setTransactionType("Bought From: ");
        }

        const profileDocSnap = await getDoc(profileDocRef);

        if (profileDocSnap.exists()) {
          const profileData = profileDocSnap.data();
          setUserName(`${profileData.firstName} ${profileData.lastName}`);
          setUserPic(`${profileData.profilePic}`);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchUserProfile();
  }, [item.buyer, item.seller]);

  const handleMeetupDetails = () => {
    navigation.navigate("MeetupDetails", item); // Navigate to OfferDetails screen with item data
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagAndNameContainer}>
        {/* <Text style={styles.transactionType}>{transactionType}</Text> */}
        <Text style={styles.username}>{transactionType}{userName}</Text>
        {transactionType === "Sold To: " ? (
          <Ionicons name="bag-remove" size={24} color="#e8594f" />
        ) : (
          <Ionicons name="bag-add" size={24} color="#50C878" />
        )}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.listings[0].listingImg1 || "https://via.placeholder.com/150" }}
            style={styles.listingImg}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.listings[0].title}
            {item.listings.length > 1 ? ` and ${item.listings.length - 1} more` : ''}</Text>
          <Text style={{ ...styles.titleText, fontSize: 14, opacity: 0.8 }}>Total Price: ${item.finalPrice}</Text>
           <View style={styles.meetupInfo}>
          <Text style={styles.meetupText}>Location: {item.location}</Text>
          <Text style={styles.meetupText}>Date: {item.date ? new Date(item.date.seconds * 1000).toLocaleDateString() : 'Date not available'} {item.time ? new Date(item.time.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'Time not available'}</Text>
        </View>
        </View>
      </View>

      {/* <View style={styles.contentContainer}>
        <Text style={styles.transactionType}>{transactionType}</Text>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: userPic || "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg" }}
            style={styles.profilePic}
          />
        </View>
        <Text style={styles.username}>{userName}</Text>
      </View> */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleMeetupDetails}>
          <Text style={styles.buttonText}>View Meetup</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const screenHeight = Dimensions.get('window').height * 0.5;

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
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: '#ffffff',
  },
  listingsContainer: {
    backgroundColor: "white",
  },
  divider: {
    width: '100%',
    height: 3,
    backgroundColor: '#e6f2ff',
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
    //marginBottom: 60,
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
    paddingBottom: 5,
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
  imageWrapper: {
    position: 'relative',
    width: '20%',
    margin: 15,
  },
  listingImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    aspectRatio: 1,
    resizeMode: "cover",
  },
  mapContainer: {
    backgroundColor: "white",
    marginBottom: 200,
    paddingHorizontal: 10,
    position: "relative",
  },
  mapImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 3.5,
  },
  dot: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: "#3f9eeb",
  },
  meetupLocationText: {
    position: 'absolute',
    top: -100, 
    left: 10,
    backgroundColor: '#3f9eeb',
    color: "white",
    padding: 5,
    borderRadius: 5,
  }, 
  meetupInfo: {
    marginLeft: 5,
  },
  meetupText: {
    color: "#3f9eeb",
    fontSize: 14,
    marginRight: 50,
  },
  itemContainer: {
    backgroundColor: "white",
    padding: 10,
    borderColor: "transparent", // Initial border color
    borderWidth: 2,
    borderRadius: 5,
  },
  selectedItem: {
    borderColor: "#3f9eeb",
  },
  transactionType: {
    fontWeight: "bold",
    fontSize: 10,
    //textAlign: "right",
    //marginLeft: 20,
    //marginRight: -126,
    //marginLeft: 180,
    //backgroundColor: "pink"
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
  username: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    //marginBottom: 5,
    //marginLeft: 10,
    marginRight: 5,
   //backgroundColor: "red",
    //width: "30%",
    //transform: [{ rotate: "45deg" }],
    //position: "absolute",
    //paddingHorizontal: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: "center",
    width: "100%",
    height: "25%",
  },
  button: {
    backgroundColor: "#3f9eeb",
    width: "40%",
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    padding: 5,
  },
  tagAndNameContainer: {
    flexDirection: "row",
    //justifyContent: "flex-end",
    alignItems: "center",
    //alignContent: "center",
    alignSelf: "left",
    //width: "100%",
    //right: -10,
  },
  emptyContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
    height: screenHeight,
  },
  emptyText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "gray",
    flexWrap: "wrap",
    paddingBottom: 100,
  },
});

export default Meetups;
