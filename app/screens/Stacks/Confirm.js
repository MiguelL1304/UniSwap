import React, { useState, useEffect } from 'react';
import { View, Text, PanResponder, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";

const Confirm = ({ route }) => {
  const [slideHeight] = useState(new Animated.Value(0));
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
          if (userRole === 'buyer') {
            handleConfirmationFinalized();
          }
          else {
            navigation.goBack();
          }
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
    const fieldToUpdate = `${userRole}Confirmed`; // Directly use 'buyerConfirmed' or 'sellerConfirmed'
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
  
      navigation.goBack();
    } catch (error) {
      console.error('Error finalizing confirmation:', error);
    }
  };

  const handleSlide = (gestureState) => {
    const { dy } = gestureState;
    if (dy < -100) {
      // If user slides beyond a certain threshold, consider it as confirmation
      Animated.timing(slideHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsConfirmed(true);
        // setShootConfetti(true);
      });
      handleConfirm();
    } else {
      // If not confirmed, reset the slide height
      Animated.spring(slideHeight, {
        toValue: 0,
        friction: 4,
        useNativeDriver: false,
      }).start();
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dy: slideHeight }], {
      useNativeDriver: false,
      listener: (event, gestureState) => {
        if (gestureState.dy > 0) {
          // Prevent sliding down
          slideHeight.setValue(0);
        }
      },
    }),
    onPanResponderRelease: (_, gestureState) => handleSlide(gestureState),
  });

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Animated.View
          style={[
            styles.button,
            {
              transform: [{ translateY: slideHeight.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* <Text style={{ color: 'black', fontWeight: 'bold' }}>{isConfirmed ? 'Confirmed!' : null}</Text> */}
          <Text style={{ color: 'black', fontWeight: 'bold' }}>{isConfirmed ? 'Confirmed!' : null}</Text>
        </Animated.View>
      </View>
      {!isConfirmed && (
        <Text style={styles.confirmText}>Slide up to Confirm</Text>
      )}
      {isConfirmed && shootConfetti && <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />}

      {/* {!shootConfetti && ( */}
        <View style={styles.cancelContainer}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      {/* )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50, // Make it a circle
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#3f9eeb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  confirmText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
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
});

export default Confirm;