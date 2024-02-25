import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [college, setCollege] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        signOut(auth)
          .then(() => navigation.replace("Login"))
          .catch((error) => alert(error.message));
      }
    });

    return unsubscribe;
  }, []);

  const handleNewAccount = async () => {
    //Handles non edu emails
    if (!email.endsWith(".edu")) {
      alert("Please enter an email associated with an educational institution");
      return; // Exit function if email is invalid
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registered with: ", email);
  
      const userProfileRef = doc(firestoreDB, "profile", email);
      // Create a reference to the 'profile' collection with the user's email as the document ID
  
      await setDoc(userProfileRef, {
        firstName: firstName,
        lastName: lastName,
        college: college,
      });
      console.log("Profile data added successfully!"); //Delete Later to not show
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
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNewAccount} style={styles.button}>
          <Text style={styles.buttonText}>Register Account</Text>
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

export default SignUp;
