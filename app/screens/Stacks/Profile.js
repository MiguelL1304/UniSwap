import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";

function Profile() {
  
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [profileData, setProfileData] = useState({
    firstName: "First Name: NA",
    lastName: "Last Name: NA",
    college: "College: NA",
    profilePic: "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg",
  }); // Default values for the profile data

  const [userListings, setUserListings] = useState({});

  useEffect(() => {
    if (isFocused) {
      fetchProfile(); // Fetch profile data when screen is focused
      fetchUserListings();
    }
  }, [isFocused]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  const fetchProfile = async () => {
    try {
      const docRef = doc(firestoreDB, 'profile', auth.currentUser?.email);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setProfileData(data); // Update profile data state
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  //Fetch the user document in the userListing collection. TO BE DELETED LATER
  const fetchUserListings = async () => {
    try {
      const email = auth.currentUser ? auth.currentUser.email : null;
      if (!email) {
        throw new Error("Current user is null or email is undefined.");
      }

      const userListingRef = doc(firestoreDB, "userListing", email);
      const userListingSnapshot = await getDoc(userListingRef);

      if (userListingSnapshot.exists()) {
        const userListingData = userListingSnapshot.data();
        const listingNames = Object.keys(userListingData);
        setUserListings(listingNames);
        console.log(userListings);

      } else {
        console.log("User listing document does not exist");
      }
    } catch (error) {
      console.error('Error fetching user listings:', error);
    }
  };

  const handleUpdate = () => {
    navigation.navigate("UpdateProfile", { profileData: profileData });
  };

  const handleListing = (listingDoc) => {
    navigation.navigate("EditListing", { listingDoc: listingDoc });
  };

  return (
    <View style={styles.container}>
      {/* Profile Image moved up */}
      {/* <View style={styles.profileImgContainer}>
        <Image
          source={{ uri: profileData.profilePic ? profileData.profilePic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
          style={styles.profileImg}
        />
      </View> */}
      {/* User Information */}
      <Text style={styles.emailText}>Email: {auth.currentUser?.email}</Text>
      {/* <Text style={styles.userInfoText}>{profileData.firstName} {profileData.lastName}</Text>   */}
      {/* <Text style={styles.userInfoText}>{profileData.lastName}</Text> // Moved first and last name to same line */ }
      {/* <Text style={styles.userInfoText}>{profileData.college}</Text>
      <Text style={styles.userInfoText}>{profileData.bio}</Text> */}

      {/* Fetch the user document in the userListing collection. TO BE DELETED LATER */}
      {/* <Text style={styles.userInfoText}>User Listings:</Text>
      <FlatList
        data={userListings}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleListing(item)}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      /> */}
      
      {/* Update Profile button */}
      <TouchableOpacity onPress={handleUpdate} style={[styles.button, styles.buttonOutline]}>
        <Text style={styles.buttonOutlineText}>Update Profile</Text>
      </TouchableOpacity>

      {/* Sign out button */}
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  contentSheet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 80,
    backgroundColor: 'white',
  },
  profileImgContainer: {
    marginBottom: 40, // Adjusted space above the profile image
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
  },
  userInfoText: {
    fontSize: 16,
    margin: 3,
  },
  emailText: {
    fontSize: 16,
    // marginBottom: 20,
  },
  button: {
    backgroundColor: '#3f9eeb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '70%',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: "white",
    borderColor: "#3f9eeb",
    borderWidth: 2,
    marginTop: 50,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
});
