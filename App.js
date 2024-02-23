import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from "./app/screens/Login";
import Listing from "./app/screens/Listing";
import SignUp from "./app/screens/SignUp";
import Profile from "./app/screens/Profile";


const Stack = createNativeStackNavigator();

export default function App() {
  

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
          options={{
            headerTitle: '',
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Listing" 
          component={Listing} 
        />
      
      </Stack.Navigator>
    </NavigationContainer>
    
    //<View style={styles.container}>
      //<Text>Open up App.js to start working on your app!!!</Text>
      //<StatusBar style="auto" />
    //</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
