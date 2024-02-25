import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";

//this is the first screen you see once logged in

function Profile() {
  const navigation = useNavigation();

  const [profileData, setProfileData] = useState(null); // State to store profile data

  useEffect(() => {
    fetchProfile(); // Fetch profile data when component mounts
  }, []);

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
        console.log('Document data:', data); //Delete Later
        setProfileData(data); // Update profile data state
      } else {
        console.log('No such document!'); //Delete Later
      }
    } catch (error) {
      console.error('Error fetching document:', error); //Delete Later
    }
  };

  return (
    <View style={styles.container}>
      <Text>Email: {auth.currentUser?.email}</Text>
      {profileData && ( // Check if profileData is not null
        <View>
          <Text>First Name: {profileData.firstName}</Text>
          <Text>Last Name: {profileData.lastName}</Text>
          <Text>College: {profileData.college}</Text>
        </View>
      )}
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3f9eeb",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
