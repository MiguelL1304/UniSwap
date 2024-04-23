import React, { useState } from 'react';
import { View, Text, PanResponder, Animated, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const Confirm = () => {
  const [slideWidth] = useState(new Animated.Value(0));
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shootConfetti, setShootConfetti] = useState(false);

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
        setShootConfetti(true);
      });
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

      <Text style={{ color: '#3f9eeb', fontWeight: 'bold', paddingTop: 20 }}>{slideText}</Text>

      {shootConfetti && <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />}
    </View>
  );
};

export default Confirm;

const styles = StyleSheet.create({
  container: {
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
