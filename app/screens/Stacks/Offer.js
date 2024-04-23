import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert, Keyboard, Platform, FlatList } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import ProgressBar from "../Components/ProgressBar";
import Uploading from "../Components/Uploading";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import defaultImg from "../../assets/defaultImg.png";
import Swiper from 'react-native-swiper';

const Offer = ({ route }) => { // Receive profile data as props

    const { listings } = route.params;
    const numContainers = Math.min(listings.length, 3);
    const [locations, setLocations] = useState([]);
    const sellerEmail = listings[0].id.split('_')[0];
    const totalPriceCal = listings.reduce((total, currentListing) => total + parseFloat(currentListing.price), 0);
    const totalPrice = totalPriceCal.toString();
    const [priceInput, setPriceInput] = useState(totalPrice);
    const [userListings, setUserListings] = useState([]);
    const isFocused = useIsFocused();

    
    const fetchLocations = async () => {
      try {
          const locationsSnapshot = await getDocs(collection(firestoreDB, 'meetuplocations'));
          const locationsData = locationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          setLocations(locationsData);
      } catch (error) {
          console.error("Error fetching locations: ", error);
      }
    };  


    const fetchUserListings = async () => {
      try {
        const email = auth.currentUser ? auth.currentUser.email : null;
        if (!email) {
          throw new Error("Current user is null or email is undefined.");
        }
    
        const userListingRef = doc(firestoreDB, "userListing", email);
        const userListingSnapshot = await getDoc(userListingRef);
    
        if (userListingSnapshot.exists()) {
          const userListingData = userListingSnapshot.data();
          const listingIds = Object.keys(userListingData);
    
          if (!Array.isArray(listingIds)) {
            throw new Error("Listing IDs is not an array.");
          }
          
          const items = await Promise.all(
            listingIds.map(async (listingId) => {
            const listingDocRef = doc(firestoreDB, "listing", listingId);
            const listingDocSnapshot = await getDoc(listingDocRef);
  
            if (listingDocSnapshot.exists()) {
              const listingData = listingDocSnapshot.data();
              return { id: listingDocSnapshot.id, ...listingData };
            } else {
              console.log("Listing document not found");
              return null;
            }
          }));
  
          const filteredItems = items.filter((item) => item !== null);
          setUserListings(filteredItems);
        } else {
          console.warn("User listing document not found")
        }
      } catch (error) {
        console.error('Error fetching user listings:', error);
      }
    };

    useEffect(() => {
      if (isFocused) {
        fetchUserListings();
        fetchLocations();
      } 
    }, [isFocused]);
  

    
      
      

    //Snap points for the different bottom screens
    const snapPointsLoc = useMemo(() => ['80%'], []);
    const snapPointsDate = useMemo(() => ['50%'], []);
    const snapPointsTime = useMemo(() => ['35%'], []);
    const snapPointsBuy = useMemo(() => ['48%'], []);
    const snapPointsTrade = useMemo(() => ['70%'], []);

    //Bottom sheets
    const bottomSheetRefLoc = useRef(null);
    const bottomSheetRefTime = useRef(null);
    const bottomSheetRefDate = useRef(null);
    const bottomSheetRefBuy = useRef(null);
    const bottomSheetRefTrade = useRef(null);

    const handleLocationPress = () => {
      if (bottomSheetRefLoc.current) {
        bottomSheetRefLoc.current.expand();
      }
    };

    const handleDatePress = () => {
      setShowDatePicker(true);
      if (Platform.OS === 'ios' && bottomSheetRefDate.current) {
        bottomSheetRefDate.current.expand();
      }
    };

    const handleTimePress = () => {
      setShowTimePicker(true);
      if (Platform.OS === 'ios' && bottomSheetRefTime.current) {
        bottomSheetRefTime.current.expand();
      }
    };

    const handleBuyPress = () => {
      if (bottomSheetRefBuy.current) {
        bottomSheetRefBuy.current.expand();
      }
    };

    const handleTradePress = () => {
      if (bottomSheetRefTrade.current) {
        bottomSheetRefTrade.current.expand();
      }
    };

    //All document fields for the offer
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1); // Set initial date to tomorrow
      return tomorrow;
    });
    const [time, setTime] = useState(() => {
      const currentTime = new Date();
      currentTime.setHours(12, 0, 0, 0); // Set hours to 12 pm
      return currentTime;
    });
    const [offerPrice, setOfferPrice] = useState('');
    const [offerListings, setOfferListings] = useState([]);

    //Navigator
    const navigation = useNavigation();

    //
    //Set the values
    //
    const handleOfferPrice= (selectedOfferPrice) => {
      if (bottomSheetRefBuy.current) {
        bottomSheetRefBuy.current.close(); 
      }
      if (selectedOfferPrice < 1) {
        setOfferPrice(totalPrice);
        setPriceInput(totalPrice);

        Alert.alert('Invalid Price', 'Price cannot be less than one');
      }
      else if (selectedOfferPrice > totalPrice) {
        setOfferPrice(totalPrice);
        setPriceInput(totalPrice);

        Alert.alert('Invalid Price', 'Your offer cannot be higher than the current price');
      }
      else {
        setOfferPrice(selectedOfferPrice);
      }
      
    };

    const handleLocation= (selectedLocation) => {
      if (location === selectedLocation) {
        // If the selected location is already the current location, set it to an empty string
        setLocation("");
      } else {
        // Otherwise, set it to the selected location
        setLocation(selectedLocation);
      }
      if (bottomSheetRefLoc.current) {
        bottomSheetRefLoc.current.close(); 
      }
    };

    const handleTradeListing= (selectedListing) => {

      const isListingSelected = offerListings.includes(selectedListing);

      if (!isListingSelected) {
        if (offerListings.length >= 3) {
          Alert.alert('Maximum Listings Reached', 'You can only select up to three listings for trade.');
          return;
        }
        // If the selected listing id is not already in the offerListings array, add it
        setOfferListings((prevListings) => [...prevListings, selectedListing]);
      } else {
        // If the selected listing id is already in the offerListings array, remove it
        setOfferListings((prevListings) => prevListings.filter((listingId) => listingId !== selectedListing));
      }
      
      if (bottomSheetRefLoc.current) {
        bottomSheetRefLoc.current.close(); 
      }
    };
    

    const handleTime= (selectedTime) => {
      setDate(selectedTime);
      if (bottomSheetRefTime.current) {
        bottomSheetRefTime.current.close(); 
      }
    };

  //
  // Main buttons
  //

  const handleSendOffer = async () => {
    try {
      if (!location) {
        Alert.alert('Incomplete Offer', 'Please select a location.');
        return;
      }

      const createDocumentName = (user, seller) => {
        const currentDate = new Date();
        const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
        const timeString = currentDate.toTimeString().slice(0, 8).replace(/:/g, ''); // Format: HHMMSS
        const userPart = user.replace(/\s+/g, ''); // Remove whitespace from user name
        const sellerPart = seller.replace(/\s+/g, ''); // Remove whitespace from seller name
        return `${userPart}_${sellerPart}_${dateString}_${timeString}`;
      };

      const documentName = createDocumentName(sellerEmail, auth.currentUser.email);
      const userEmail = auth.currentUser.email;

    
      // Create a document for the seller
      const sellerDocRef = doc(firestoreDB, 'profile', sellerEmail);
      const sellerOfferDocRef = await setDoc(doc(sellerDocRef, 'receivedOffers', documentName), {
        buyer: userEmail,
        seller: sellerEmail,
        sentBy: userEmail,
        location,
        date,
        time,
        createdAt: new Date(),
        offerListings: offerListings,
        offerPrice: offerPrice,
        listings: listings,
        status: "pending",
      });
  
      // Create a document for the user
      const userDocRef = doc(firestoreDB, 'profile', userEmail);
      const userOfferDocRef = await setDoc(doc(userDocRef, 'sentOffers', documentName), {
        buyer: userEmail,
        seller: sellerEmail,
        sentBy: userEmail,
        location,
        date,
        time,
        createdAt: new Date(),
        offerListings: offerListings,
        offerPrice: offerPrice,
        listings: listings,
        status: "pending",
      });
  
      console.log('Offer sent successfully');

      navigation.goBack();
      // Optionally, you can navigate the user to a different screen or show a success message
    } catch (error) {
      console.error('Error sending offer:', error);
      // Handle errors or show error message to the user
    }
  };

  const handleCancel = async () => {
    navigation.goBack();
  }

  //Backdrop
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

  //
  // Date Logic
  //

  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    const today = new Date();
    if (currentDate < today) {
      // If selected date is in the past, set it to today
      setDate(today);
    } else {
      setShowDatePicker(false); 
      setDate(currentDate);
    }
  };

  //
  // Time Logic
  //

  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event, selectedTime) => {
    
    const currentTime = selectedTime || new Date();

    if (currentTime.getHours() < 7) {
      currentTime.setHours(7, 0, 0, 0);
    }

    if (currentTime.getHours() > 21) {
      // If yes, set the hour to 9 pm
      currentTime.setHours(21, 0, 0, 0);
    }

    setTime(currentTime);
    setShowTimePicker(false);
    
  };


  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: 'white' }]} onTouchStart={Keyboard.dismiss}>

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
        {listings.map((item, index) => (
          <View style={[styles.contentContainer, { height: '100%'}]} key={index}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: listings[index].listingImg1 || "https://via.placeholder.com/150" }}
                style={styles.listingImg}
              />
            </View>
            <View>
              <Text style={styles.titleText}>{listings[index].title}</Text>
              <Text style={{ ...styles.titleText, fontSize: 14, opacity: 0.8 }}>Price: ${item.price} | {item.condition}</Text>
            </View>
          </View>
        ))}
      </Swiper>

      <View style={styles.divider} />
      
      <View style={styles.contentContainer}>
        <Text style={{ ...styles.titleText, fontWeight: '500'}}>Meetup</Text>
      </View>

      <View style={styles.menuView}>

        <TouchableOpacity style={styles.topMenuButton} onPress={handleLocationPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menuSelection}> {location}</Text>
              <Ionicons name="chevron-forward" size={20} color="#3f9eeb" style={{paddingTop: 7 }}/>
            </View>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleDatePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            <Text style={styles.titleTextMenu}> Date</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menuSelection}> {date.toLocaleDateString()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#3f9eeb" style={{paddingTop: 5 }}/>
            </View>
            

            

            {/* PICKER FOR ANDROID */}
            {showDatePicker && (Platform.OS === 'android') && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
                minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                maximumDate={new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)}
              />      
            )}
            
          </View> 
        </TouchableOpacity>

        

        <TouchableOpacity style={styles.menuButton} onPress={handleTimePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Time</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menuSelection}> {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              <Ionicons name="chevron-forward" size={20} color="#3f9eeb" style={{paddingTop: 5 }}/>
            </View>
            
          
            
            {/* PICKER FOR ANDROID */}

            {showTimePicker && (Platform.OS === 'android') && (
                <DateTimePicker
                  testID="timePicker"
                  value={time} // Set value to the state of time
                  mode="time" // Set mode to time
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange} // Set onChange event
                  minimumDate={new Date(new Date().setHours(7, 0, 0, 0))}
                  maximumDate={new Date(new Date().setHours(21, 0, 0, 0))}
                />
            )}

            
          
          </View>  
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.contentContainer}>
        <Text style={{ ...styles.titleText, fontWeight: '500'}}>Buy & Trade</Text>
      </View>

      <View style={styles.menuView2}>

        <TouchableOpacity style={styles.topMenuButton2} onPress={handleBuyPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Offer</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menuSelection}> {offerPrice}</Text>
              <Ionicons name="chevron-forward" size={20} color="#3f9eeb" style={{paddingTop: 7 }}/>
            </View>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton2} onPress={handleTradePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            <Text style={styles.titleTextMenu}> Trade</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menuSelection}>
                {offerListings.length > 0 ? `${offerListings.length} selected` : ''}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#3f9eeb" style={{paddingTop: 5 }}/>
            </View>
            
          </View> 
        </TouchableOpacity>

      </View>

      <View style={styles.divider} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSendOffer} style={styles.button}>
          <Text style={styles.buttonText}>Send Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      
      <BottomSheet 
        ref={bottomSheetRefLoc} 
        index={-1} 
        snapPoints={snapPointsLoc}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <ScrollView>

          <FlatList
            data={locations}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View key={item.id}>
                <TouchableOpacity onPress={() => handleLocation(item.name)} style={styles.locationBox}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {location === item.name && (
                      <Ionicons name="checkmark-outline" size={20}/>
                    )}
                    <Text style={styles.locationText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        
        </ScrollView>
        
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefDate} 
        index={-1} 
        snapPoints={snapPointsDate}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        {Platform.OS === 'ios' && (
          <View style={{ marginTop: 7 }}>
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="inline"
              onChange={onDateChange}
              minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
              maximumDate={new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)}
            />
          </View>                    
        )}
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefTime} 
        index={-1} 
        snapPoints={snapPointsTime}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        {Platform.OS === 'ios' && (
          <View style={{ marginTop: 7 }}>
            <DateTimePicker
              testID="timePicker"
              value={time} // Set value to the state of time
              mode="time" // Set mode to time
              is24Hour={true}
              display="spinner"
              onChange={onTimeChange} // Set onChange event
              minimumDate={new Date(new Date().setHours(7, 0, 0, 0))}
              maximumDate={new Date(new Date().setHours(21, 0, 0, 0))}
            />
          </View>                           
        )}
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefBuy} 
        index={-1} 
        snapPoints={snapPointsBuy}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.priceText}>   Offer:    $</Text>
          <TextInput
            value={priceInput}
            style={styles.priceInput}
            onChangeText={(text) => setPriceInput(text)}
            keyboardType="numeric"
            maxLength={4}
          />
          <TouchableOpacity onPress={() => handleOfferPrice(priceInput)} style={[styles.button, { width: '28%', }]}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity> 
        </View>
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefTrade} 
        index={-1} 
        snapPoints={snapPointsTrade}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
      <ScrollView style={{ width: '100%' }}>
      {userListings.length > 0 ? (
        <FlatList
          style={styles.listings}
          scrollEnabled={false}
          data={userListings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listingItem} key={item.id}>
              <TouchableOpacity onPress={() => handleTradeListing(item)}> 
                <View style={[styles.imageContainer]}>
                  <Image
                    source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
                    style={styles.listingImage}
                  />
                  {offerListings.includes(item) && (
                    <Ionicons name="checkmark-circle" size={60} color="#3f9eeb" style={styles.checkIcon} />
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.textContainer}>
                <Text style={styles.listingTitle}>{item.title}</Text>
                <Text style={styles.listingPrice}>${item.price}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listingsContainer}
        />
      ) : (
        <View style={{alignItems: "center", justifyContent: "center"}}>
          <Text style={styles.noResultsFound}>No items to trade. Created listings can be used as trade options.</Text>
        </View>
      )}  
          
          
      </ScrollView>
        
      </BottomSheet>

      
      

    </GestureHandlerRootView>
    
  );
};

const styles = StyleSheet.create({
  wrapper: {
  },
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
    width: '50%',   
  },
  listingImage: {
    width: 120,
    height: 120,
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
    width: "94%",
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'left',
    backgroundColor: 'white',
  },
  titleText: {
    fontSize: 20,
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
    width: "40%",
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    width: "40%",
    height: 45,
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
    fontSize: 18,
  },
  cancelText: {
    color: "#3f9eeb",
    fontWeight: "500",
    fontSize: 18,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '30%',
    margin: 20,
  },
  listingImg: {
    width: '100%',
    borderRadius: 10,
    aspectRatio: 1,
  },
});

export default Offer;