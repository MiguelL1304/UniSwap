// import React, { useState, useEffect } from 'react';
// import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
// import ConfettiCannon from 'react-native-confetti-cannon';

// const Confirm = () => {
  
//   const [shoot, setShoot] = useState(false);
//   const { width } = Dimensions.get('window');


//   const handlePress = () => {
//     setShoot(false);
//     setTimeout(() => {
//       setShoot(true);
//     }, 100);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.innerContainer}>
//         <TouchableOpacity onPress={handlePress}>
//           <View style={styles.buttonContainer}>
//             <Text style={styles.buttonText}>Press for confetti</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {shoot && <ConfettiCannon count={200} origin={{ x: -width, y: 0 }} />}

//     </SafeAreaView>
//   );
 
// };

// export default Confirm;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   innerContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonContainer: {
//     backgroundColor: 'blue',
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//   },
// });




import React, { useState } from 'react';
import { View, Text, PanResponder, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const SlideToConfirmButton = () => {
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
        friction: 4,
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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: '80%',
          height: 50,
          borderRadius: 25,
          backgroundColor: '#007AFF',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#5AC8FA',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            transform: [{ translateX: slideWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }],
          }}
          {...panResponder.panHandlers}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>{slideText}</Text>
        </Animated.View>
        {!isConfirmed && (
          <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Slide to Confirm</Text>
        )}
      </View>
      {shootConfetti && <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />}
    </View>
  );
};

export default SlideToConfirmButton;




