import React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { useAnimatedGestureHandler } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const Confirm = () => {
  return(
    <View>
      <Button title="confirm"></Button>
    </View>
  );
}

// const BUTTON_WIDTH = 350;
// const BUTTON_HEIGHT = 100;
// const BUTTON_PADDING = 10;
// const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING;

// const H_WAVE_RANGE = SWIPEABLE_DIMENSIONS + 2 * BUTTON_PADDING;
// const H_SWIPE_RANGE = BUTTON_WIDTH - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS;

// const Confirm = ({ontoggle}) => {
//   const x = userSharedValue(0);
//   const animatedGestureHandler = useanimatedge
//   return <View style={styles.swipecCont}>
//     <Text>test</Text>
//     {/* <View style={styles.swipeable}>
//       <PanGestureHandler onGestureEvent={animatedGestureHandler}

//     </View> */} 

//   </View>
  

//   const styles = StyleSheet.create({
//     swipecCont: {
//       height: BUTTON_HEIGHT,
//       width: BUTTON_WIDTH,
//       padding: BUTTON_PADDING,
//       backgroundColor: "#fff",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       borderRadius: BUTTON_HEIGHT,
//     },
//     swipeable: {
//       height: SWIPEABLE_DIMENSIONS,
//       width: SWIPEABLE_DIMENSIONS,
//       padding: SWIPEABLE_DIMENSIONS,
//       backgroundColor: "#3f9eeb",
//       position: "absolute",
//       left: BUTTON_PADDING,

//     }
//   })
// }
export default Confirm;