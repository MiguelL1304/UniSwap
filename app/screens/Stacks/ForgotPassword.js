import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View, Alert } from "react-native";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import {
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../Firebase/firebase";
import { useNavigation } from "@react-navigation/native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const navigation = useNavigation();

  const handlePassword = async () => {
    await sendPasswordResetEmail(auth, email)
    //.then(() => alert("Check your email for instruction on how to reset your password!"))
    .then(() => {
        Alert.alert(
            "Password Reset",
            "Check your email for instructions on how to reset your password!",
            [{
                text: "OK",
                onPress: () => navigation.goBack(), // Navigate back to login screen
            },
        ]);
    })
    .catch((error) => alert(error.message))
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handlePassword} style={styles.button}>
          <Text style={styles.buttonText}>Send</Text>
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
    color: "#3f9eeb",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ForgotPassword;
