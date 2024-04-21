import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const Confirm = () => {
  const [shoot, setShoot] = useState(false);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    setTimeout(() => {
      setShoot(true);
    }, 10000);
  }, []);

  const handlePress = () => {
    setShoot(false);
    setTimeout(() => {
      setShoot(true);
    }, 500);
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


