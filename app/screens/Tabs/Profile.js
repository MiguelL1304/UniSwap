import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation, useIsFocused } from "@react-navigation/native";

function Profile() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [profileData, setProfileData] = useState({
    firstName: "First Name: NA",
    lastName: "Last Name: NA",
    college: "College: NA"
  }); // Default values for the profile data

  useEffect(() => {
    if (isFocused) {
      fetchProfile(); // Fetch profile data when screen is focused
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

  const handleUpdate = () => {
    navigation.navigate("UpdateProfile", { profileData: profileData });
  };

  return (
    <View style={styles.container}>
      {/* Profile Image moved up */}
      <View style={styles.profileImgContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImg}
        />
      </View>
      {/* User Information */}
      <Text style={styles.userInfoText}>{profileData.firstName}</Text>
      <Text style={styles.userInfoText}>{profileData.lastName}</Text>
      <Text style={styles.userInfoText}>{profileData.college}</Text>
      <Text style={styles.emailText}>Email: {auth.currentUser?.email}</Text>
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 80, // Adjusted padding to move everything up
    backgroundColor: '#fff',
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
    marginBottom: 20,
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
    marginTop: 5,
  },
  buttonOutlineText: {
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
});
