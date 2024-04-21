import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

const Confirm = ({ route }) => {
  
  const {
    id,
    buyer,
    seller
  } = route.params;
  const currentUserEmail = auth.currentUser?.email;

  const userRole = currentUserEmail === buyer ? 'buyer' : 'seller';

  //Cannon logic
  const [shoot, setShoot] = useState(false);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    setTimeout(() => {
      setShoot(true);
    }, 10000);
  }, []);

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
          setShoot(true);
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

  const handlePress = () => {
    setShoot(false);
    setTimeout(() => {
      setShoot(true);
    }, 500);
  };


  //Confirm Logic
  const handleConfirm = async () => {
    const exchangeRef = doc(firestoreDB, 'exchanges', id);
    const fieldToUpdate = `${userRole}Confirmed`; // Directly use 'buyerConfirmed' or 'sellerConfirmed'
    await updateDoc(exchangeRef, {
      [fieldToUpdate]: true
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={handlePress}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Press for confetti</Text>
          </View>
        </TouchableOpacity>
      </View>

      {shoot && <ConfettiCannon count={200} origin={{ x: -width, y: 0 }} />}

    </SafeAreaView>
  );
 
};

export default Confirm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});


