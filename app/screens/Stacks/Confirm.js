
// import React, { useState } from 'react';
// import { View, Text, PanResponder, Animated } from 'react-native';
// import ConfettiCannon from 'react-native-confetti-cannon';

// const Confirm = () => {
//   const [slideWidth] = useState(new Animated.Value(0));
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [shootConfetti, setShootConfetti] = useState(false);

//   const handleSlide = (gestureState) => {
//     const { dx } = gestureState;
//     if (dx > 100) {
//       // If user slides beyond a certain threshold, consider it as confirmation
//       Animated.timing(slideWidth, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//       }).start(() => {
//         setIsConfirmed(true);
//         setShootConfetti(true);
//       });
//     } else {
//       // If not confirmed, reset the slide width
//       Animated.spring(slideWidth, {
//         toValue: 0,
//         friction: 4,
//         useNativeDriver: false,
//       }).start();
//     }
//   };

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderMove: Animated.event([null, { dx: slideWidth }], {
//       useNativeDriver: false,
//       listener: (event, gestureState) => {
//         if (gestureState.dx < 0) {
//           // Prevent sliding left
//           slideWidth.setValue(0);
//         }
//       },
//     }),
//     onPanResponderRelease: (evt, gestureState) => handleSlide(gestureState),
//   });

//   const slideText = isConfirmed ? 'Confirmed!' : 'Slide to Confirm';

//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <View
//         style={{
//           width: '80%',
//           height: 50,
//           borderRadius: 25,
//           backgroundColor: '#007AFF',
//           justifyContent: 'center',
//           overflow: 'hidden',
//         }}
//       >
//         <Animated.View
//           style={{
//             height: '100%',
//             width: '100%',
//             backgroundColor: '#5AC8FA',
//             alignItems: 'center',
//             justifyContent: 'center',
//             position: 'absolute',
//             left: 0,
//             transform: [{ translateX: slideWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }],
//           }}
//           {...panResponder.panHandlers}
//         >
//           <Text style={{ color: 'white', fontWeight: 'bold' }}>{slideText}</Text>
//         </Animated.View>
//         {!isConfirmed && (
//           <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Slide to Confirm</Text>
//         )}
//       </View>
//       {shootConfetti && <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />}
//     </View>
//   );
// };

// export default Confirm;












import React, { useState } from 'react';
import { View, Text, PanResponder, Animated, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const Confirm = () => {
  const [slideHeight] = useState(new Animated.Value(0));
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [shootConfetti, setShootConfetti] = useState(false);

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
        setShootConfetti(true);
      });
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default Confirm;










// import React, { useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import ConfettiCannon from 'react-native-confetti-cannon';
// import SlideButton from 'rn-slide-button';

// const SlideToConfirmButton = () => {
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [shootConfetti, setShootConfetti] = useState(false);

//   const handleSlide = (confirmed) => {
//     setIsConfirmed(confirmed);
//     if (confirmed) {
//       setShootConfetti(true);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.slideContainer}>
//         <SlideButton
//           width={300}
//           height={50}
//           sliderRadius={25}
//           onSlideSuccess={() => handleSlide(true)}
//           onSlideCancel={() => handleSlide(false)}
//           slideDirection="RIGHT"
//           slideBackground="#007AFF"
//           containerStyles={styles.slideButtonContainer}
//         >
//           {!isConfirmed && <Text style={styles.slideText}>Slide to Confirm</Text>}
//         </SlideButton>
//       </View>
//       {shootConfetti && <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   slideContainer: {
//     width: '80%',
//     justifyContent: 'center',
//   },
//   slideButtonContainer: {
//     borderRadius: 25,
//     overflow: 'hidden',
//   },
//   slideText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default SlideToConfirmButton;



// import React, { useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import ConfettiCannon from 'react-native-confetti-cannon';
// import SlideButton from 'rn-slide-button';

// const SlideToConfirmButton = () => {
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [shootConfetti, setShootConfetti] = useState(false);

//   const handleSlide = (confirmed) => {
//     setIsConfirmed(confirmed);
//     if (confirmed) {
//       console.log('Slide successful'); // Log when the slide is confirmed
//       setShootConfetti(true);
//     } else {
//       console.log('Slide cancelled'); // Log when the slide is cancelled
//     }
//   };
  

//   // const handleSlide = (confirmed) => {
//   //   setIsConfirmed(confirmed);
//   //   if (confirmed) {
//   //     setShootConfetti(true); // Set shootConfetti to true when the slide is confirmed
//   //   }
//   // };

//   return (
//     <View style={styles.container}>
//       <View style={styles.slideContainer}>
//         <SlideButton
//           width={300}
//           height={50}
//           sliderRadius={25}
//           onSlideSuccess={() => handleSlide} // Call handleSlide with true when slide is successful
//           // onSlideCancel={() => handleSlide(false)} // Call handleSlide with false when slide is cancelled
//           slideDirection="RIGHT"
//           slideBackground="#007AFF"
//           containerStyles={styles.slideButtonContainer}
//         >
//           {!isConfirmed && <Text style={styles.slideText}>Slide to Confirm</Text>}
//         </SlideButton>
//       </View>
//       {shootConfetti && ( // Render ConfettiCannon only if shootConfetti is true
//         <ConfettiCannon count={200} origin={{ x: -100, y: 0 }} />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   slideContainer: {
//     width: '80%',
//     justifyContent: 'center',
//   },
//   slideButtonContainer: {
//     borderRadius: 25,
//     overflow: 'hidden',
//   },
//   slideText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default SlideToConfirmButton;
