import React, { useState, useEffect } from 'react';
import { View, Text, PanResponder, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";

const Confirm = ({ route }) => {
  const [slideWidth] = useState(new Animated.Value(0));
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shootConfetti, setShootConfetti] = useState(false);

  const {
    id,
    buyer,
    seller,
    listings,
    tradeListings,
  } = route.params;
  const currentUserEmail = auth.currentUser?.email;

  const userRole = currentUserEmail === buyer ? 'buyer' : 'seller';

  //Navigator
  const navigation = useNavigation();

  const handleCancel = async () => {
    navigation.goBack();
  }
  
  useEffect(() => {
    if (!id) {
      console.log('No exchange ID provided');
      return;
    }

    const exchangeRef = doc(firestoreDB, 'exchanges', id);
    const unsubscribe = onSnapshot(exchangeRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log('No data found for the given exchange ID:', id);
        return;
      }

      const data = snapshot.data();
      if (data.buyerConfirmed && data.sellerConfirmed && !data.exchangeComplete) {
        updateDoc(exchangeRef, { exchangeComplete: true })
        .then(() => {
          setShootConfetti(true);
          setTimeout(() => {
            if (userRole === 'buyer') {
              handleConfirmationFinalized();
            } else {
              navigation.navigate("Inbox");
            }
          }, 4000);
        })
        .catch(error => {
          console.error('Failed to update exchange document:', error);
        });
      }
    }, error => {
      console.error('Failed to subscribe to exchange updates:', error);
    });

    return () => unsubscribe();
  }, [id]);
  
  const handleConfirm = async () => {
    const exchangeRef = doc(firestoreDB, 'exchanges', id);
    const fieldToUpdate = `${userRole}Confirmed`; 
    await updateDoc(exchangeRef, {
      [fieldToUpdate]: true
    });
  };


  const handleConfirmationFinalized = async () => {
    try {
      const batch = writeBatch(firestoreDB);
  
      const listingAR = listings;
      const tradeListingsAR = tradeListings;
  
      // Update listing statuses to "sold"
      for (const listing of listingAR) {
        const listingDocRef = doc(firestoreDB, 'listing', listing.id);
        batch.update(listingDocRef, { status: "sold" });
      }
  
      for (const listing of tradeListingsAR) {
        const listingDocRef = doc(firestoreDB, 'listing', listing.id);
        batch.update(listingDocRef, { status: "sold" });
      }
  
      await batch.commit();
  
      // Handle bought and sold listings
      for (const listing of listingAR) {
        const buyerBoughtListingRef = doc(firestoreDB, 'profile', buyer, 'bought', listing.id);
        const sellerSoldListingRef = doc(firestoreDB, 'profile', seller, 'sold', listing.id);
        await setDoc(buyerBoughtListingRef, { ...listing, purchaseDate: new Date() });
        await setDoc(sellerSoldListingRef, { ...listing, purchaseDate: new Date() });
      }
  
      for (const listing of tradeListingsAR) {
        const sellerBoughtListingRef = doc(firestoreDB, 'profile', seller, 'bought', listing.id);
        const buyerSoldListingRef = doc(firestoreDB, 'profile', buyer, 'sold', listing.id);
        await setDoc(sellerBoughtListingRef, { ...listing, purchaseDate: new Date() });
        await setDoc(buyerSoldListingRef, { ...listing, purchaseDate: new Date() });
      }
  
      // Clean up the exchanges and meetups
      await deleteDoc(doc(firestoreDB, 'exchanges', id));
      await deleteDoc(doc(doc(firestoreDB, 'profile', seller), 'meetups', id));
      await deleteDoc(doc(doc(firestoreDB, 'profile', buyer), 'meetups', id));
  
      navigation.navigate("Inbox");
    } catch (error) {
      console.error('Error finalizing confirmation:', error);
    }
  };

  const handleSlide = (gestureState) => {
    const { dx } = gestureState;
    if (dx > 100) {
      // If user slides beyond a certain threshold, consider it as confirmation
      Animated.timing(slideWidth, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsConfirmed(true);
        // setShootConfetti(true);
      });
      handleConfirm();
    } else {
      // If not confirmed, reset the slide width
      Animated.spring(slideWidth, {
        toValue: 0,
        friction: 49,
        useNativeDriver: false,
      }).start();
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: slideWidth }], {
      useNativeDriver: false,
      listener: (event, gestureState) => {
        if (gestureState.dx < 0) {
          // Prevent sliding left
          slideWidth.setValue(0);
        }
      },
    }),
    onPanResponderRelease: (evt, gestureState) => handleSlide(gestureState),
  });

  const slideText = isConfirmed ? 'Confirmed!' : 'Slide to Confirm';

  return (
    <View style={styles.container}>
      {/* Box with instructions */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>Confirm you met with the seller:</Text>
        <Text style={styles.instructionsText}>
          {"\u2022"} Be 100% sure you are meeting with the right seller! {"\n"}
          {"\u2022"} Check that all items purchased/traded are present {"\n"}
          {"\u2022"} Discuss and make payment {"\n"}
          {"\u2022"} Slide the button all the way to the right to confirm a successful transaction
        </Text>
      </View>

      {/* Slide bar */}
      <View style={styles.slidebar}>
        <Animated.View
          style={{
            height: '75%',
            width: '11%',
            borderRadius: 50,
            backgroundColor: '#3f9eeb',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 7,
            transform: [{ translateX: slideWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }],
          }}
          {...panResponder.panHandlers}
        >
          {/* <Text style={{ color: 'white', fontWeight: 'bold' }}>{slideText}</Text> */}
        </Animated.View>
        {/* {!isConfirmed && (
          <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Slide</Text>
        )} */}
      </View>
      {!isConfirmed && (
        <Text style={styles.confirmText}>Slide up to Confirm</Text>
      )}
      {isConfirmed && shootConfetti && <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />}

      {!shootConfetti && (
        <View style={styles.cancelContainer}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  },
  instructionsBox: {
    backgroundColor: '#e6f2ff',
    padding: 40,
    marginTop: 40,
    marginBottom: 20,
    borderRadius: 10,
    // alignSelf: 'stretch',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    color: '#3f9eeb',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cancelText: {
    color: "#3f9eeb",
    fontWeight: "500",
    fontSize: 18,
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
  cancelContainer: {
    position: 'absolute', // Positions the container absolutely relative to its parent
    bottom: 10, // Distance from the bottom of the parent
    width: "100%",
    alignItems: 'center',
  },
  instructionsText: {
    color: '#3f9eeb',
    textAlign: 'left',
  },
  slidebar: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#3f9eeb',
    marginTop: 100,
  }
});


export default Confirm;
