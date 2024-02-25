import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const UpdateProfile = ({ route }) => { // Receive profile data as props

    const { profileData } = route.params;

    const [firstName, setFirstName] = useState(profileData.firstName || ""); // Initialize state with profile data
    const [lastName, setLastName] = useState(profileData.lastName || "");
    const [college, setCollege] = useState(profileData.college || "");
    const [bio, setBio] = useState(profileData.bio || "");

    const navigation = useNavigation();

    const handleUpdate = async () => {
    try {
        const email = auth.currentUser.email;
        const userProfileRef = doc(firestoreDB, "profile", email);
        // Create a reference to the 'profile' collection with the user's email as the document ID
  
        await setDoc(userProfileRef, {
            firstName: firstName,
            lastName: lastName,
            college: college,
            bio: bio,
        });

        alert("Profile updated successfully!");
        navigation.goBack();

    } catch (error) {
        alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  buttonOutline: {
    backgroundColor: "white",
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
    color: "blue",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default UpdateProfile;