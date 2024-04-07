import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert, Keyboard, Platform } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import ProgressBar from "../Components/ProgressBar";
import Uploading from "../Components/Uploading";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';

const Offer = ({ route }) => { // Receive profile data as props

    const { listing } = route.params;

    //Snap points for the different bottom screens
    const snapPointsLoc = useMemo(() => ['80%'], []);
    const snapPointsDate = useMemo(() => ['50%'], []);
    const snapPointsTime = useMemo(() => ['35%'], []);

    //Bottom sheets
    const bottomSheetRefLoc = useRef(null);
    const bottomSheetRefTime = useRef(null);
    const bottomSheetRefDate = useRef(null);

    //Close the bottom sheets
    const handleClosePress = () => {
      bottomSheetRefLoc.current?.close();
      bottomSheetRefTime.current?.close();
      bottomSheetRefDate.current?.close();
    };
    
    //Open the bottom sheets
    const handleOpenPress = () => {
      bottomSheetRefLoc.current?.expand();
      bottomSheetRefTime.current?.expand();
      bottomSheetRefDate.current?.expand();
    };

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

    //All document fields for the offer
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1); // Set initial date to tomorrow
      return tomorrow;
    });
    const [time, setTime] = useState(() => {
      const currentTime = new Date();
      return currentTime;
    });

    //Navigator
    const navigation = useNavigation();

    //
    //Set the values
    //
    const handleLocation= (selectedLocation) => {
      setLocation(selectedLocation);
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

  

  const handleCancel = async () => {
    navigation.goBack();
  }

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
    setTime(currentTime);
    setShowTimePicker(false);
    
  };


  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: 'white' }]} onTouchStart={Keyboard.dismiss}>

      <View style={styles.contentContainer}>
        <View style={styles.imageWrapper}>
            <Image
                source={{ uri: listing.listingImg1 || "https://via.placeholder.com/150" }}
                style={styles.listingImg}
            />
        </View>
        <View>
          <Text style={styles.titleText}>{listing.title}</Text>
          <Text style={{ ...styles.titleText, fontSize: 14, opacity: 0.8 }}>Price: $ {listing.price} | {listing.condition}</Text>
        </View>
        
      </View>

      <View style={styles.divider} />
      
      <View style={styles.contentContainer}>
        <Text style={{ ...styles.titleText, fontWeight: '500'}}>Meetup</Text>
      </View>

      <View style={styles.menuView}>

        <TouchableOpacity style={styles.topMenuButton} onPress={handleLocationPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Location</Text>
            <Text style={styles.menuSelection}> {location}</Text>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleDatePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            <Text style={styles.titleTextMenu}> Date</Text>
            
            <Text style={styles.menuSelection}> {date.toLocaleDateString()}</Text>

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
              />      
            )}
            
          </View> 
        </TouchableOpacity>

        

        <TouchableOpacity style={styles.menuButton} onPress={handleTimePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Time</Text>
            
            <Text style={styles.menuSelection}> {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          
            
            {/* PICKER FOR ANDROID */}

            {showTimePicker && (Platform.OS === 'android') && (
                <DateTimePicker
                  testID="timePicker"
                  value={time} // Set value to the state of time
                  mode="time" // Set mode to time
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange} // Set onChange event
                />
            )}

            
          
          </View>  
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.contentContainer}>
        <Text style={{ ...styles.titleText, fontWeight: '500'}}>Buy & Trade</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
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
            />
          </View>                           
        )}
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
  titleInput: {
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 5,
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
  },
  priceInput: {
    backgroundColor: '#e6f2ff', //#d4e9fa
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 5,
    flex: 1,
    marginLeft: 10,
    marginRight: 140,
    fontSize: 20,
    textAlign: 'center',
    shadowColor: 'black',
  },
  courseInput: {
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 5,
    flex: 1,
    marginLeft: 35,
    marginRight: 35,
    fontSize: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#3f9eeb',
  },
  descriptionInput: {
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 15,
    paddingVertical: 30,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: "100%",
  },
  button: {
    backgroundColor: "#3f9eeb",
    width: "40%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    margin: 10,
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    width: "40%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
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

export default Offer;