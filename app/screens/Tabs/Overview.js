import { useNavigation, useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, FlatList, View, TouchableOpacity, Image } from "react-native";
import { auth, firestoreDB } from "../../../Firebase/firebase";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Selling from "../Stacks/Selling";
import Bought from "../Stacks/Bought";
import Trade from "../Stacks/Trade";
import Profile from "../Stacks/Profile";
import { BorderlessButton, ScrollView } from "react-native-gesture-handler";
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
// import { View } from "react-native-reanimated/lib/typescript/Animated";

// four tabs
// selling
// bought
// trades
// settings
// gallery view
// click on listing and preview
// edit and delete


const Overview = () => {
    const tabs = createMaterialTopTabNavigator(); 
    const navigation = useNavigation();
  const isFocused = useIsFocused();

    const [profileData, setProfileData] = useState({
        firstName: "First Name: NA",
        lastName: "Last Name: NA",
        college: "College: NA",
        profilePic: "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg",
      }); // Default values for the profile data

      useEffect(() => {
        if (isFocused) {
          fetchProfile(); // Fetch profile data when screen is focused
        //   fetchUserListings();
        }
      }, [isFocused]);


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

  
  

  return (
    <View style={{width: '100%', height: '100%', backgroundColor: 'white'}}>
        <View style={styles.containter}>


    {/* Profile Image moved up */}
            <View style={styles.profileImgContainer}>
                <Image
                source={{ uri: profileData.profilePic ? profileData.profilePic : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg' }}
                style={styles.profileImg}
                />
            </View>
            
            {/* User Information */}
            {/* <Text style={styles.emailText}>Email: {auth.currentUser?.email}</Text> */}
            <Text style={styles.userInfoText}>{profileData.firstName} {profileData.lastName}</Text>  
            {/* <Text style={styles.userInfoText}>{profileData.lastName}</Text> // Moved first and last name to same line */ }
            <Text style={styles.userInfoText}>{profileData.college}</Text>
            <Text style={styles.userInfoText}>{profileData.bio}</Text>

            </View>


        <tabs.Navigator
      tabBarOptions={{
        activeTintColor: '#3f9eeb', // Color of the active tab label
        inactiveTintColor: 'black', // Color of inactive tab labels
        labelStyle: { fontSize: 16, fontWeight: 'bold' }, // Style for tab labels
        style: { backgroundColor: '#e6f2ff' }, // Background color of the tab bar
        indicatorStyle: { backgroundColor: '#3f9eeb' }, // Color of the tab indicator
      }}
      >
        <tabs.Screen name="Selling" component={Selling}/>
        <tabs.Screen name="Bought" component={Bought}/>
        <tabs.Screen name="Trade" component={Trade}/>
        <tabs.Screen name="Profile" component={Profile}/>
      </tabs.Navigator>

    </View>

  );
}

export default Overview;

const styles = StyleSheet.create({
    containter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // padding: 20,
        // paddingTop: 80,
        backgroundColor: 'white',
    },
    buttonRow: {
        flexDirection: 'row',   
        flex: 1,
    },
    button: {
        backgroundColor: '#3f9eeb',
        margin: 10,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        width: '20%',
    },
    buttonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    profileImgContainer: {
        marginBottom: 40, // Adjusted space above the profile image
        alignItems: 'right',
      },
      profileImg: { // circle for profile picture
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
      },
      userInfoText: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 3,
      },
     
  });
  
