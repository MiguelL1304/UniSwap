import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert, Keyboard, Platform, FlatList } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from "@expo/vector-icons";
import defaultImg from "../../assets/defaultImg.png";
import Swiper from 'react-native-swiper';

const AnswerOffer= ({ route }) => { // Receive profile data as props

    const offer = route.params;
    // Extract listings array from the offer object
    const listings = offer.listings;
    const numContainers = Math.min(listings.length, 3);
    const sellerEmail = listings[0].id.split('_')[0];

    const isFocused = useIsFocused();
 

    // useEffect(() => {
    //   if (isFocused) {
    //   } 
    // }, [isFocused]);

    //Snap points for the different bottom screens
    const snapPointsLoc = useMemo(() => ['80%'], []);
    const snapPointsTrade = useMemo(() => ['70%'], []);

    //Bottom sheets
    const bottomSheetRefLoc = useRef(null);
    const bottomSheetRefTrade = useRef(null);

    const handleLocationPress = () => {
      if (bottomSheetRefLoc.current) {
        bottomSheetRefLoc.current.expand();
      }
    };

    const handleTradePress = () => {
      if (bottomSheetRefTrade.current) {
        bottomSheetRefTrade.current.expand();
      }
    };

    //All document fields for the offer
    const location = offer.location;
    const date = offer.date;
    const time = offer.time;
    const offerPrice = offer.offerPrice;
    const offerListings = offer.offerListings;
    
    //Navigator
    const navigation = useNavigation();


  const handleAcceptOffer = async () => {
    try {
      const createDocumentName = (user, seller) => {
        const currentDate = new Date();
        const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
        const timeString = currentDate.toTimeString().slice(0, 8).replace(/:/g, ''); // Format: HHMMSS
        const userPart = user.replace(/\s+/g, ''); // Remove whitespace from user name
        const sellerPart = seller.replace(/\s+/g, ''); // Remove whitespace from seller name
        return `${userPart}_${sellerPart}_${dateString}_${timeString}`;
      };

      const documentName = createDocumentName(offer.buyer, auth.currentUser.email);

      const sellerDocRef = doc(firestoreDB, 'profile', offer.seller);
      const sellerOfferDocRef = await setDoc(doc(sellerDocRef, 'meetups', documentName), {
        buyer: offer.buyer,
        createdAt: new Date(),
        date: offer.date,
        listings: offer.listings,
        location: offer.location,
        tradeListings: offer.offerListings,
        finalPrice: offer.offerPrice,
        seller: offer.seller,
        status: "upcoming",
        time: offer.time,
        id: documentName,
      });

      const buyerDocRef = doc(firestoreDB, 'profile', offer.buyer);
      const buyerOfferDocRef = await setDoc(doc(buyerDocRef, 'meetups', documentName), {
        buyer: offer.buyer,
        createdAt: new Date(),
        date: offer.date,
        listings: offer.listings,
        location: offer.location,
        tradeListings: offer.offerListings,
        finalPrice: offer.offerPrice,
        seller: offer.seller,
        status: "upcoming",
        time: offer.time,
        id: documentName,
      });


      // Update the offer object in the receiver's profile
      const receiverDocRef = doc(firestoreDB, 'profile', offer.seller);
      const receiverOfferDocRef = doc(receiverDocRef, 'receivedOffers', offer.id);
      await deleteDoc(receiverOfferDocRef);

      // Update the offer object in the sender's profile
      const senderDocRef = doc(firestoreDB, 'profile', offer.buyer);
      const senderOfferDocRef = doc(senderDocRef, 'sentOffers', offer.id);
      await deleteDoc(senderOfferDocRef);

      //Update all listing objects
      const batch = writeBatch(firestoreDB);

      const listingAR = offer.listings;

      listingAR.forEach(listing => {
        const listingDocRef = doc(firestoreDB, 'listing', listing.id);
        batch.update(listingDocRef, { status: "unavailable" });
      });

      const offerListingsAR = offer.offerListings;
      offerListingsAR.forEach(listing => {
        const listingDocRef = doc(firestoreDB, 'listing', listing.id);
        batch.update(listingDocRef, { status: "unavailable" });
      });
      
      await batch.commit();

      console.log('Offer accepted and listings updated successfully');

      console.log('Offer accepted successfully');

      navigation.goBack();

    } catch (error) {
      console.error('Error accepting offer:', error);
    } 
  }

  const handleDeclineOffer = async () => {
    try {
      // Update the offer object in the receiver's profile
      const receiverDocRef = doc(firestoreDB, 'profile', offer.seller);
      const receiverOfferDocRef = doc(receiverDocRef, 'receivedOffers', offer.id);
      await updateDoc(receiverOfferDocRef, { status: "declined" });

      // Update the offer object in the sender's profile
      const senderDocRef = doc(firestoreDB, 'profile', offer.sentBy);
      const senderOfferDocRef = doc(senderDocRef, 'sentOffers', offer.id);
      await updateDoc(senderOfferDocRef, { status: "declined" });

      console.log('Offer declined successfully');

      navigation.goBack();
      } catch (error) {
        console.error('Error declining offer:', error);
      }          
  }

  const handleListing = (listing) => {
    navigation.navigate("ListingDetails", { listing: listing });
  };

  //Backdrop
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );


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

        <View style={styles.menuButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            <Text style={styles.titleTextMenu}> Date</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.menuSelection}>{date ? new Date(date.seconds * 1000).toLocaleDateString() : 'Date not available'}</Text>
            </View>
            
          </View> 
        </View>

        

        <View style={styles.menuButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Time</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.menuSelection}>{time ? new Date(time.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time not available'}</Text>
            </View>    
          
          </View>  
        </View>

      </View>

      <View style={styles.divider} />

      <View style={styles.contentContainer}>
        <Text style={{ ...styles.titleText, fontWeight: '500'}}>Offer & Trades</Text>
      </View>

      <View style={styles.menuView2}>

        <View style={styles.topMenuButton2}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Pay Offer</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.menuSelection}> ${offerPrice}</Text>
            </View>
          </View> 
        </View>

        <TouchableOpacity style={styles.menuButton2} onPress={handleTradePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            <Text style={styles.titleTextMenu}> Trades</Text>
            
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
        <TouchableOpacity onPress={handleAcceptOffer} style={styles.button}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeclineOffer} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Decline</Text>
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
        
        </ScrollView>
        
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefTrade} 
        index={-1} 
        snapPoints={snapPointsTrade}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <ScrollView>  
        {offerListings.length > 0 ? (
          <FlatList
            style={styles.listings}
            scrollEnabled={false}
            data={offerListings}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listingItem} key={item.id}>
                <TouchableOpacity onPress={() => handleListing(item)}> 
                  <View style={[styles.imageContainer]}>
                    <Image
                      source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
                      style={styles.listingImage}
                    />
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
            <Text style={styles.noResultsFound}>No items offered for trade</Text>
          </View>
        )}  
            
        </ScrollView>
        
      </BottomSheet>

      
      

    </GestureHandlerRootView>
    
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
    flex: 1,
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
    flex: 1,
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
    margin: 10,
  },
  listingImg: {
    width: '100%',
    borderRadius: 10,
    aspectRatio: 1,
  },
});

export default AnswerOffer;