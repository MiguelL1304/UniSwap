import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert, Keyboard } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import ProgressBar from "../Components/ProgressBar";
import Uploading from "../Components/Uploading";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

const CreateListing = ({ route }) => { // Receive profile data as props
    
    const snapPointsImg = useMemo(() => ['30%'], []);
    const snapPointsTag = useMemo(() => ['50%'], []);
    const snapPointsSubj = useMemo(() => ['80%'], []);

    const [animatedIndex, setAnimatedIndex] = useState(-1);

    const bottomSheetRefImg = useRef(null);
    const bottomSheetRefCon = useRef(null);
    const bottomSheetRefSubj = useRef(null);
    const bottomSheetRefCourse = useRef(null);

    const handleClosePress = () => {
      bottomSheetRefImg.current?.close();
      bottomSheetRefCon.current?.close();
      bottomSheetRefSubj.current?.close();
      bottomSheetRefCourse.current?.close();
      setAnimatedIndex(-1);
    };
    
    const handleOpenPress = () => {
      bottomSheetRefImg.current?.expand();
      bottomSheetRefCon.current?.expand();
      bottomSheetRefSubj.current?.expand();
      bottomSheetRefCourse.current?.expand();
      setAnimatedIndex(1);
    };

    const { listingID } = route.params;
    const [bottomSheetOpened, setBottomSheetOpened] = useState(false);

    const [ownerID, setOwnerID] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [price, setPrice] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState("");
    const [category, setCategory] = useState("");
    const [subject, setSubject] = useState("");
    const [course, setCourse] = useState("");


    const [profilePic, setProfilePic] = useState("https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg");
    

    useEffect(() => {
      // Set profilePic state when component mounts
      //setProfilePic(profileData.profilePic || "");
    }, []);

    //const[progress, setProgress] = useState(0);

    const navigation = useNavigation();

    const handleUpdate = async () => {
    try {
        const email = auth.currentUser ? auth.currentUser.email: null;
        if (!email) {
          throw new Error("Current user is null or email is undefined.");
        }
      
        const userProfileRef = doc(firestoreDB, "profile", email);
        // Create a reference to the 'profile' collection with the user's email as the document ID
  
        await setDoc(userProfileRef, {
            firstName: firstName,
            lastName: lastName,
            college: college,
            bio: bio,
            profilePic: profilePic,
        });

        console.log("Profile updated successfully!");
        navigation.goBack();

    } catch (error) {
        console.error(error.message);
    }
  };

  const handleImagePress = () => {
    if (bottomSheetRefImg.current) {
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
      setProfilePic(result.assets[0].uri)
      //Upload Image
      await uploadImage(result.assets[0].uri, "image");
    }
  }

  async function takePicture() {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      // Handle permission denied
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  
    if(!result.canceled) {
      setProfilePic(result.assets[0].uri)
      //Upload Image
      await uploadImage(result.assets[0].uri, "image");
    }
  }

  async function uploadImage (uri, fileType) {
    try {
      const email = auth.currentUser ? auth.currentUser.email: null;

      const response = await fetch(uri);
      const blob = await response.blob();
    

      const storageRef = ref(firebaseStorage, "ProfilePic/" + email);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      //Listen for events
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setProgress(progress.toFixed());
        },
        (error) => {
          console.error("Error uploading image:", error);
          // Handle error
        },
        () => {
          // Upload completed successfully, now get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            // Save the download URL to the state or use it as needed
            setProfilePic(downloadURL);

            // Update Firestore document with the download URL
            const userProfileRef = doc(firestoreDB, "profile", email);
            setDoc(userProfileRef, { profilePic: downloadURL }, { merge: true })
              .then(() => console.log("Profile document updated with image URL"))
              .catch((error) => console.error("Error updating profile document:", error));
          });
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      // Handle error
    }
  }

  const handleDeletePic = async () => {
    try {
      const email = auth.currentUser ? auth.currentUser.email : null;
      if (!email) {
        throw new Error("Current user is null or email is undefined.");
      }
      
      const defaultProfilePic = "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg";

      if (profilePic === defaultProfilePic) {
        Alert.alert(
          "No Profile Picture",
          "There is no profile picture to delete.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
        return; // No need to delete or update, exit the function
      }

      const storageRef = ref(firebaseStorage, "ProfilePic/" + email);
      await deleteObject(storageRef);
  
  
      const userProfileRef = doc(firestoreDB, "profile", email);
      await setDoc(userProfileRef, { profilePic: defaultProfilePic }, { merge: true });
  
      console.log("Profile picture deleted successfully!");
      setProfilePic(defaultProfilePic);
  
      handleClosePress(); // Close the bottom sheet after deletion
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    }
  };

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );
  
  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: 'white' }]} onTouchStart={Keyboard.dismiss}>
      <View style={styles.imgContainer}>
        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={handleImagePress}>
            <Image
              source={require("../../assets/addPhotoIcon.png")}
              style={styles.listingImg}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Title:</Text>
        <TextInput
          value={title}
          onChangeText={(text) => setTitle(text)}
          style={styles.titleInput}
        />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.titleText}>Description:</Text>
        <TextInput
          value={description}
          onChangeText={(text) => setDescription(text)}
          style={styles.descriptionInput}
          multiline={true}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Price: $</Text>
        <TextInput
          value={price}
          onChangeText={(text) => setPrice(text)}
          style={styles.priceInput}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.menuView}>
        <TouchableOpacity style={styles.topMenuButton}>
          <Text style={styles.titleTextMenu}> Category</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleSubjectPress}>
          <Text style={styles.titleTextMenu}> Subject</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleCoursePress}>
          <Text style={styles.titleTextMenu}> Course</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleConditionPress}>
          <Text style={styles.titleTextMenu}> Condition</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleUpdate} style={styles.button}>
          <Text style={styles.buttonText}>Create Listing</Text>
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
        <View style={styles.contentSheet}>
          {/* Choose from library button */}
          <TouchableOpacity onPress={pickImage} style={[styles.picButton, styles.buttonOutline]}>
            <Text style={styles.buttonOutlineText}>Choose From Library</Text>
          </TouchableOpacity>
          {/* Take a pic button */}
          <TouchableOpacity onPress={takePicture} style={styles.picButton}>
            <Text style={styles.buttonText}>Take a Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePic} style={styles.deleteButton}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefCon} 
        index={-1} 
        snapPoints={snapPointsTag}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.contentSheet}>
          <View style={styles.menuBS}>
            <TouchableOpacity style={styles.topMenuButtonBS}>
              <Text style={styles.titleText}> Brand New</Text>
              <Text style={styles.titleBody}>   Unused, still in original packaging</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS}>
              <Text style={styles.titleText}> Like New</Text>
              <Text style={styles.titleBody}>   Mint condition, minimal signs of wear.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS}>
              <Text style={styles.titleText}> Used - Excellent</Text>
              <Text style={styles.titleBody}>   Previously owned, no noticible flaws</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS}>
              <Text style={styles.titleText}> Used - Good</Text>
              <Text style={styles.titleBody}>   Moderately used, minor flaws or signs of wear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS}>
              <Text style={styles.titleText}> Used - Fair</Text>
              <Text style={styles.titleBody}>   Noticeably used, significant signs of wear to be noted</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefSubj} 
        index={-1} 
        snapPoints={snapPointsSubj}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <TouchableOpacity style={styles.subjectButtonTop}>
            <Text style={styles.subjectText}>Accounting</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>African American Studies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Anthropology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Art</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Biochemistry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Biology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Business Administration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Chemistry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Cinema Media</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Communications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Computer Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Economics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Environmental Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Film</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Finance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>French</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Geography</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Health Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Honors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Human Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Information Technology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Marketing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Mathematics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Music</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Nursing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Philosophy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Physical Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Political Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Psychology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Sociology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Spanish</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton}>
            <Text style={styles.subjectText}>Theatre</Text>
          </TouchableOpacity>        
        </ScrollView>
      </BottomSheet>

      <BottomSheet 
        ref={bottomSheetRefCourse} 
        index={-1} 
        snapPoints={snapPointsTag}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
         
        <View style={styles.courseContainer}>
          <Text style={styles.courseText}>   Course Number: </Text>
            <TextInput
              value={course}
              onChangeText={(text) => setCourse(text)}
              style={styles.courseInput}
              keyboardType="numeric"
              maxLength={4}
              onSubmitEditing={handleClosePress}
          />
        </View>
      
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#ffffff',
  },
  menuView: {
    width: "85%", 
    height: "25%",
    backgroundColor: "#e6f2ff",
    marginTop: 20,
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
    height: "25%",
    backgroundColor: "#e6f2ff",
    borderRadius: 10,
  },
  menuButton: {
    width: "100%", 
    height: "25%",
    backgroundColor: "#e6f2ff",
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
    borderBottomLeftRadius: 10, 
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderColor: '#3f9eeb',
  },
  topMenuButtonBS: {
    width: "100%", 
    height: "25%",
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
  titleContainer: {
    width: "85%",
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 20,
  },
  descriptionContainer: {
    width: "85%",
    marginTop: 20,
  },
  courseContainer: {
    width: "100%",
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 20,
    paddingRight: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: "#3f9eeb",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  picButton: {
    backgroundColor: '#3f9eeb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '60%',
  },
  deleteButton: {
    backgroundColor: '#e8594f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '35%',
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
    fontWeight: "700",
    fontSize: 18,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
  imgContainer: {
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 15,
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  listingImg: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default CreateListing;
