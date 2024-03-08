import React, { useEffect, useState, useMemo, useRef, useCallback  } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Image, Alert } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { auth, firebaseStorage, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ProgressBar from "../Components/ProgressBar";
import Uploading from "../Components/Uploading";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';


//import firestore from '@react-native-firebase/firestore';

const UpdateProfile = ({ route }) => { // Receive profile data as props
    const snapPoints = useMemo(() => ['25%'], []);

    const bottomSheetRef = useRef(null);

    const handleClosePress = () => bottomSheetRef.current?.close();
    const handleOpenPress = () => bottomSheetRef.current?.expand();

    const { profileData } = route.params;

    const [firstName, setFirstName] = useState(profileData.firstName || ""); // Initialize state with profile data
    const [lastName, setLastName] = useState(profileData.lastName || "");
    const [college, setCollege] = useState(profileData.college || "");
    const [bio, setBio] = useState(profileData.bio || "");
    const [profilePic, setProfilePic] = useState("https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg");
    

    useEffect(() => {
      // Set profilePic state when component mounts
      setProfilePic(profileData.profilePic || "");
    }, []);

    const[progress, setProgress] = useState(0);

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
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
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

  async function compressImage(uri) {
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.5 } // Adjust compression level as needed
    );
    return compressedImage;
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

  const handleDeleteProfilePic = async () => {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardAvoidingView style={[styles.container, { marginTop: -200 }]} behavior="padding">
      <View style={styles.inputContainer}>
        <View style={styles.profileImgContainer}>
          <TouchableOpacity onPress={handleImagePress}>
            <Image
              source={{ uri: profilePic }}
              style={styles.profileImg}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="College / University"
          value={college}
          onChangeText={(text) => setCollege(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Bio"
          value={bio}
          onChangeText={(text) => setBio(text)}
          style={styles.input}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleUpdate} style={styles.button}>
          <Text style={styles.buttonText}>Update Account</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet 
        ref={bottomSheetRef} 
        index={-1} 
        snapPoints={snapPoints}
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
          <TouchableOpacity onPress={handleDeleteProfilePic} style={styles.deleteButton}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
      
      {/*<Uploading />
      <ProgressBar progress={50}/>*/}

      
    </KeyboardAvoidingView>
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
    backgroundColor: 'white',
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "#d4e9fa",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
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
    fontSize: 16,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
  profileImgContainer: {
    marginBottom: 20, // Adjusted space above the profile image
    alignItems: 'center',
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
  },
});

export default UpdateProfile;
