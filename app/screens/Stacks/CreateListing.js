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

const CreateListing = ({ route }) => { // Receive profile data as props
    
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

    //Creates the listing document in the DB
    const handleCreation = async () => {
      try {
        const email = auth.currentUser ? auth.currentUser.email: null;
        if (!email) {
          throw new Error("Current user is null or email is undefined.");
        }

        const listingRef = collection(firestoreDB, "listing");

        const newListingDocRef = await addDoc(listingRef, {
            title: title,
            description: description,
            price: price,
            category: category,
            subject: subject,
            course: course,
            condition: condition,
            listingImg1: listingImg1,
            listingImg2: listingImg2,
            listingImg3: listingImg3,
            listingImg4: listingImg4,
            listingImg5: listingImg5,
            status: "available",
        });

        const newListingId = newListingDocRef.id;

        const docName = `${email}_${newListingId}`;

        await setDoc(doc(firestoreDB, "listing", docName), {
          title: title,
          description: description,
          price: price,
          category: category,
          subject: subject,
          course: course,
          condition: condition,
          listingImg1: listingImg1,
          listingImg2: listingImg2,
          listingImg3: listingImg3,
          listingImg4: listingImg4,
          listingImg5: listingImg5,
          status: "available",
          createdAt: new Date(),
        });

        await deleteDoc(doc(firestoreDB, "listing", newListingId));
        
        const userListingRef = collection(firestoreDB, "userListing");
        const userListingDocRef = doc(userListingRef, email);
        const userListingDocSnap = await getDoc(userListingDocRef);
        const userListingData = userListingDocSnap.data();

        if (userListingDocSnap.exists()) {
          // If the document exists, update it
          await setDoc(userListingDocRef, {
            ...userListingData,
            [docName]: true,
          }, { merge: true });
        } else {
          // If the document doesn't exist, create it
          await setDoc(userListingDocRef, {
            [docName]: true,
          });
        }

        navigation.goBack();
      } catch (error) {
        console.error(error.message);
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

  //Gets the picture taken with the camera
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


  async function uploadImage (uri, fileType) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
    
      const randomFileName = generateRandomFileName();
      const storageRef = ref(firebaseStorage, "ListingPic/" + randomFileName);
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
            if(listingImg1 == "") {
              setListingImg1(downloadURL)
            }
            else if(listingImg2 == "") {
              setListingImg2(downloadURL)
            }
            else if(listingImg3 == "") {
              setListingImg3(downloadURL)
            }
            else if(listingImg4 == "") {
              setListingImg4(downloadURL)
            }
            else {
              setListingImg5(downloadURL)
            }
          });
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      // Handle error
    }

    function generateRandomFileName() {
      // Function to generate a random filename
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomFileName = "";
      for (let i = 0; i < 10; i++) {
        randomFileName += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return randomFileName;
    } 
  }

  const handleCancel = async () => {
    if (!(listingImg1 === "")) {
      deletePics(listingImg1)
    }
    if (!(listingImg2 === "")) {
      deletePics(listingImg2)
    }
    if (!(listingImg3 === "")) {
      deletePics(listingImg3)
    }
    if (!(listingImg4 === "")) {
      deletePics(listingImg4)
    }
    if (!(listingImg5 === "")) {
      deletePics(listingImg5)
    }

    navigation.goBack();
    
  }

  const deletePics = async (imageUrl) => {
    // Extract the document name from the image URL
    const startIndex = imageUrl.indexOf("ListingPic%2F") + "ListingPic%2F".length;
    const endIndex = imageUrl.indexOf("?", startIndex);
    const documentName = imageUrl.substring(startIndex, endIndex);
    
    const storageRef = ref(firebaseStorage, "ListingPic/" + documentName);
    await deleteObject(storageRef);

    console.log("Picture deleted successfully!");
  }

  const handleDeletePic = async () => {
    try {
      let imageUrl = "";

      switch (selectedImageNumber) {
        case 1:
          imageUrl = listingImg1;
          setListingImg1(""); // Clear the variable
          break;
        case 2:
          imageUrl = listingImg2;
          setListingImg2(""); // Clear the variable
          break;
        case 3:
          imageUrl = listingImg3;
          setListingImg3(""); // Clear the variable
          break;
        case 4:
          imageUrl = listingImg4;
          setListingImg4(""); // Clear the variable
          break;
        case 5:
          imageUrl = listingImg5;
          setListingImg5(""); // Clear the variable
          break;
        default:
          break;
      }

      if (!imageUrl) {
        Alert.alert(
          "No Listing Picture",
          "There is no listing picture to delete.",
          [{ text: "OK" }]
        );
        return;
      }

      // Extract the document name from the image URL
      const startIndex = imageUrl.indexOf("ListingPic%2F") + "ListingPic%2F".length;
      const endIndex = imageUrl.indexOf("?", startIndex);
      const documentName = imageUrl.substring(startIndex, endIndex);
      
      const storageRef = ref(firebaseStorage, "ListingPic/" + documentName);
      await deleteObject(storageRef);
  
      console.log("Picture deleted successfully!");

      // Shift the numbers of the remaining images
      for (let i = selectedImageNumber + 1; i <= 5; i++) {
        const nextImageUrl = getImageUrl(i);
        if (nextImageUrl) {
          // Update the state with the URL of the shifted image
          setImageUrl(i - 1, nextImageUrl);
          // Reset the URL of the shifted image in the state
          setImageUrl(i, "");
        }
      }
  
      handleClosePress(); // Close the bottom sheet after deletion
    } catch (error) {
      console.error("Error deleting profile picture:", error);
    }
  };

  const getImageUrl = (imageNumber) => {
    switch (imageNumber) {
      case 1:
        return listingImg1;
      case 2:
        return listingImg2;
      case 3:
        return listingImg3;
      case 4:
        return listingImg4;
      case 5:
        return listingImg5;
      default:
        return null;
    }
  };

  const setImageUrl = (imageNumber, url) => {
    switch (imageNumber) {
      case 1:
        setListingImg1(url);
        break;
      case 2:
        setListingImg2(url);
        break;
      case 3:
        setListingImg3(url);
        break;
      case 4:
        setListingImg4(url);
        break;
      case 5:
        setListingImg5(url);
        break;
      default:
        break;
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
          <TouchableOpacity onPress={() => handleImagePress(1)}>
            {listingImg1 ? (
              <Image
                source={{ uri: listingImg1 }}
                style={styles.listingImg}
              />
            ) : (
              <Image
                source={require("../../assets/addPhotoIcon.png")}
                style={styles.listingImg}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={() => handleImagePress(2)}>
            {listingImg2 ? (
              <Image
                source={{ uri: listingImg2 }}
                style={styles.listingImg}
              />
            ) : (
              <Image
                source={require("../../assets/addPhotoIcon.png")}
                style={styles.listingImg}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={() => handleImagePress(3)}>
            {listingImg3 ? (
              <Image
                source={{ uri: listingImg3 }}
                style={styles.listingImg}
              />
            ) : (
              <Image
                source={require("../../assets/addPhotoIcon.png")}
                style={styles.listingImg}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={() => handleImagePress(4)}>
            {listingImg4 ? (
              <Image
                source={{ uri: listingImg4 }}
                style={styles.listingImg}
              />
            ) : (
              <Image
                source={require("../../assets/addPhotoIcon.png")}
                style={styles.listingImg}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <TouchableOpacity onPress={() => handleImagePress(5)}>
            {listingImg5 ? (
              <Image
                source={{ uri: listingImg5 }}
                style={styles.listingImg}
              />
            ) : (
              <Image
                source={require("../../assets/addPhotoIcon.png")}
                style={styles.listingImg}
              />
            )}
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
        <TouchableOpacity style={styles.topMenuButton} onPress={handleCategoryPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Category</Text>
            <Text style={styles.menuSelection}> {category}</Text>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleSubjectPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Subject</Text>
            <Text style={styles.menuSelection}> {subject}</Text>
          </View> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleCoursePress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Course</Text>
            <Text style={styles.menuSelection}> {course}</Text>
          </View>  
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={handleConditionPress}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.titleTextMenu}> Condition</Text>
            <Text style={styles.menuSelection}> {condition}</Text>
          </View>  
        </TouchableOpacity>
      </View>



      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCreation} style={styles.button}>
          <Text style={styles.buttonText}>Create Listing</Text>
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
            <TouchableOpacity style={styles.topMenuButtonBS} onPress={() => handleCondition('Brand New')}>
              <Text style={styles.titleText}> Brand New</Text>
              <Text style={styles.titleBody}>   Unused, still in original packaging</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS} onPress={() => handleCondition('Like New')}>
              <Text style={styles.titleText}> Like New</Text>
              <Text style={styles.titleBody}>   Mint condition, minimal signs of wear.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS} onPress={() => handleCondition('Used - Excellent')}>
              <Text style={styles.titleText}> Used - Excellent</Text>
              <Text style={styles.titleBody}>   Previously owned, no noticible flaws</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS} onPress={() => handleCondition('Used - Good')}>
              <Text style={styles.titleText}> Used - Good</Text>
              <Text style={styles.titleBody}>   Moderately used, minor flaws or signs of wear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButtonBS} onPress={() => handleCondition('Used - Fair')}>
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
          <TouchableOpacity style={styles.subjectButtonTop} onPress={() => handleSubject('Accounting')}>
            <Text style={styles.subjectText}>Accounting</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('African American Studies')}>
            <Text style={styles.subjectText}>African American Studies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Anthropology')}>
            <Text style={styles.subjectText}>Anthropology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Art')}>
            <Text style={styles.subjectText}>Art</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Biochemistry')}>
            <Text style={styles.subjectText}>Biochemistry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Biology')}>
            <Text style={styles.subjectText}>Biology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Business Administration')}>
            <Text style={styles.subjectText}>Business Administration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Chemistry')}>
            <Text style={styles.subjectText}>Chemistry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Cinema Media')}>
            <Text style={styles.subjectText}>Cinema Media</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Communications')}>
            <Text style={styles.subjectText}>Communications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Computer Science')}>
            <Text style={styles.subjectText}>Computer Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Economics')}>
            <Text style={styles.subjectText}>Economics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Education')}>
            <Text style={styles.subjectText}>Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('English')}>
            <Text style={styles.subjectText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Environmental Science')}>
            <Text style={styles.subjectText}>Environmental Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Film')}>
            <Text style={styles.subjectText}>Film</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Finance')}>
            <Text style={styles.subjectText}>Finance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('French')}>
            <Text style={styles.subjectText}>French</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Geography')}>
            <Text style={styles.subjectText}>Geography</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Health Science')}>
            <Text style={styles.subjectText}>Health Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Honors')}>
            <Text style={styles.subjectText}>Honors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Human Services')}>
            <Text style={styles.subjectText}>Human Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Information Technology')}>
            <Text style={styles.subjectText}>Information Technology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Management')}>
            <Text style={styles.subjectText}>Management</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Marketing')}>
            <Text style={styles.subjectText}>Marketing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Mathematics')}>
            <Text style={styles.subjectText}>Mathematics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Music')}>
            <Text style={styles.subjectText}>Music</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Nursing')}>
            <Text style={styles.subjectText}>Nursing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Philosophy')}>
            <Text style={styles.subjectText}>Philosophy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Physical Education')}>
            <Text style={styles.subjectText}>Physical Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Political Science')}>
            <Text style={styles.subjectText}>Political Science</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Psychology')}>
            <Text style={styles.subjectText}>Psychology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Sociology')}>
            <Text style={styles.subjectText}>Sociology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Spanish')}>
            <Text style={styles.subjectText}>Spanish</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subjectButton} onPress={() => handleSubject('Theatre')}>
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

      <BottomSheet 
        ref={bottomSheetRefCat} 
        index={-1} 
        snapPoints={snapPointsSubj}
        handleIndicatorStyle={{backgroundColor: '#3f9eeb'}}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <TouchableOpacity style={styles.subjectButtonTop} onPress={() => handleCategory('Books')}>
            <Text style={styles.subjectText}>Books</Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingRight: 10,
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
    paddingRight: 10,
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
    fontWeight: '400',
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
    fontWeight: '400',
    color: "#3f9eeb",
    padding: 5,
  },
  courseText: {
    fontSize: 22,
    fontWeight: '400',
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
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '35%',
    marginLeft: 'auto',
    marginRight: 'auto', 
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
  cancelText: {
    color: "#e8594f",
    fontWeight: "700",
    fontSize: 18,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
  imgContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: 15,
    position: 'relative',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  listingImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
});

export default CreateListing;