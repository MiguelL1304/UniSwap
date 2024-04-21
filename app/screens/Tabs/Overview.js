import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Button, TouchableOpacity } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Selling from "../Stacks/Selling";
import Bought from "../Stacks/Bought";
import Trade from "../Stacks/Trade";
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { signOut } from "firebase/auth";

const Overview = () => {
  const tabs = createMaterialTopTabNavigator(); 
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [profileData, setProfileData] = useState({
    firstName: "First Name: NA",
    lastName: "Last Name: NA",
    college: "College: NA",
    bio: "Bio: NA",
    profilePic: "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg",
  });

  useEffect(() => {
    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(firestoreDB, 'profile', auth.currentUser?.email);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };
  
  const handleUpdate = () => {
    navigation.navigate("UpdateProfile", { profileData: profileData });
  };

  const handleConfirm = () => {
    navigation.navigate("Confirm");
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImgContainer}>
          <View style={styles.profileImgBorder}>
          <View style={styles.profileImgWrapper}>
            <Image
              source={{ uri: profileData.profilePic ? profileData.profilePic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
              style={styles.profileImg}
            />
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{profileData.firstName} {profileData.lastName}</Text>  
          <Text style={styles.userUni}>{profileData.college}</Text>

           {/* Edit Profile Button Section */}
          <View style={styles.editProfileButtonContainer}>
            <TouchableOpacity onPress={handleUpdate}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            {/* Temporary Confirm Button */}
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>

      {/* Bio Section */}
      <View style={styles.bioContainer}>
        <Text style={styles.userBio}>{profileData.bio}</Text>
      </View>

     

      {/* Sign Out Button Section */}
      <View style={styles.signOutButtonContainer}>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigator Section */}
      <View style={styles.line} />
      <tabs.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#3f9eeb',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
          tabBarStyle: { backgroundColor: '#e6f2ff' },
          tabBarIndicatorStyle: { backgroundColor: '#3f9eeb' },
        })}
      >
        <tabs.Screen name="Selling" component={Selling}/>
        <tabs.Screen name="Bought" component={Bought}/>
        <tabs.Screen name="Trade" component={Trade}/>
      </tabs.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f2ff',
    paddingTop: 70,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImgContainer: {
    marginRight: 20,
  },
  profileImgWrapper: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImgBorder: {
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#3f9eeb', 
    padding: 2, 
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 20,
  },
  userUni: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  line: {
    borderBottomWidth: 2,
    borderBottomColor: '#3f9eeb',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  bioContainer: {
    paddingTop: 10,
    paddingLeft: 30,
  },
  userBio: {
    fontSize: 17,
    fontWeight: '500',
    paddingBottom: 25,
  },
  editProfileButtonContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingRight: 15,
    paddingTop: 5,
  },
  signOutButtonContainer: {
    position: 'absolute',
    top: 15, // Adjust top position
    right: 15, // Adjust right position
    paddingTop: 50,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3f9eeb',
    marginRight: 15,
    paddingBottom: 10,
  },
});

export default Overview;
