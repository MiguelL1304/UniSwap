import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert, Keyboard } from "react-native";
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

const Offer = ({ route }) => { // Receive profile data as props

    const { listing } = route.params;
    
    //Used for identifying the image button selected. Mainly used for deleting images
    const [selectedImageNumber, setSelectedImageNumber] = useState("");


    //Snap points for the different bottom screens
    const snapPointsImg = useMemo(() => ['30%'], []);
    const snapPointsTag = useMemo(() => ['50%'], []);
    const snapPointsSubj = useMemo(() => ['80%'], []);

    //Used for tracking uploading progress. Still need to implement UI
    const[progress, setProgress] = useState(0);
    const [animatedIndex, setAnimatedIndex] = useState(-1);

    //Bottom sheets
    const bottomSheetRefImg = useRef(null);
    const bottomSheetRefCon = useRef(null);
    const bottomSheetRefSubj = useRef(null);
    const bottomSheetRefCourse = useRef(null);
    const bottomSheetRefCat = useRef(null);

    //Close the bottom sheets
    const handleClosePress = () => {
      bottomSheetRefImg.current?.close();
      bottomSheetRefCon.current?.close();
      bottomSheetRefSubj.current?.close();
      bottomSheetRefCourse.current?.close();
      bottomSheetRefCat.current?.close();
      setAnimatedIndex(-1);
    };
    
    //Open the bottom sheets
    const handleOpenPress = () => {
      bottomSheetRefImg.current?.expand();
      bottomSheetRefCon.current?.expand();
      bottomSheetRefSubj.current?.expand();
      bottomSheetRefCourse.current?.expand();
      bottomSheetRefCat.current?.expand();
      setAnimatedIndex(1);
    };

    //Could be used later for editing listings
    const [listingID, setListingID] = useState("");
    const [bottomSheetOpened, setBottomSheetOpened] = useState(false);

    //All document fields for the listing
    const [price, setPrice] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState("");
    const [category, setCategory] = useState("");
    const [subject, setSubject] = useState("");
    const [course, setCourse] = useState("");

    //URLs for the listing images
    const [listingImg1, setListingImg1] = useState("");
    const [listingImg2, setListingImg2] = useState("");
    const [listingImg3, setListingImg3] = useState("");
    const [listingImg4, setListingImg4] = useState("");
    const [listingImg5, setListingImg5] = useState("");

    //Handles cleanup
    useEffect(() => {
    
    }, []);

    //const[progress, setProgress] = useState(0);

    //Navigator
    const navigation = useNavigation();

    //Set the condition and close the bottom sheet
    const handleCondition = (selectedCondition) => {
      setCondition(selectedCondition);
      if (bottomSheetRefCon.current) {
        bottomSheetRefCon.current.close(); 
      }
    };

    //Set the subject and close the bottom sheet
    const handleSubject = (selectedSubject) => {
      setSubject(selectedSubject);
      if (bottomSheetRefSubj.current) {
        bottomSheetRefSubj.current.close(); 
      }
    };

    //Set the category and close the bottom sheet
    const handleCategory = (selectedCategory) => {
      setCategory(selectedCategory);
      if (bottomSheetRefCat.current) {
        bottomSheetRefCat.current.close(); 
      }
    };


  const handleImagePress = (imageNumber) => {
    if (bottomSheetRefImg.current) {
      setSelectedImageNumber(imageNumber);
      bottomSheetRefImg.current.expand();
    }
  };

  const handleConditionPress = () => {
    if (bottomSheetRefCon.current) {
      bottomSheetRefCon.current.expand();
    }
  };

  const handleSubjectPress = () => {
    if (bottomSheetRefSubj.current) {
      bottomSheetRefSubj.current.expand();
    }
  };

  const handleCoursePress = () => {
    if (bottomSheetRefCourse.current) {
      bottomSheetRefCourse.current.expand();
    }
  };

  const handleCategoryPress = () => {
    if (bottomSheetRefCat.current) {
      bottomSheetRefCat.current.expand();
    }
  };

  async function pickImage() {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // Handle permission denied
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: .5,
    });

    if(!result.canceled) {
      if(listingImg1 == "") {
        setListingImg1(result.assets[0].uri)
      }
      else if(listingImg2 == "") {
        setListingImg2(result.assets[0].uri)
      }
      else if(listingImg3 == "") {
        setListingImg3(result.assets[0].uri)
      }
      else if(listingImg4 == "") {
        setListingImg4(result.assets[0].uri)
      }
      else {
        setListingImg5(result.assets[0].uri)
      }
      
      //Upload Image
      await uploadImage(result.assets[0].uri, "image");
    }
  }

  

  const handleCancel = async () => {
    navigation.goBack();
  }

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: 'white' }]} onTouchStart={Keyboard.dismiss}>
      <View style={styles.imgContainer}>
       
      </View>

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

        <TouchableOpacity style={styles.topMenuButton} onPress={handleCategoryPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Location</Text>
            <Text style={styles.menuSelection}> {category}</Text>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleSubjectPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Date</Text>
            <Text style={styles.menuSelection}> {subject}</Text>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleConditionPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Time</Text>
            <Text style={styles.menuSelection}> {condition}</Text>
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
        ref={bottomSheetRefImg} 
        index={-1} 
        snapPoints={snapPointsImg}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        
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