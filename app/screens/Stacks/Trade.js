import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
const Trade = () => {
  return (
    <View style={styles.container}>
      <Text>Trade</Text>
      <ScrollView>
            <View style={styles.imagesWrapper}>
              <Image
                style={styles.galleryIMage}
                source={require('../../assets/defaultImg.png')}
              />
              <Image
                style={styles.galleryIMage}
                source={require('../../assets/defaultImg.png')}
              />
              <Image
                style={styles.galleryIMage}
                source={require('../../assets/defaultImg.png')}
              />
            </View>
            <View style={styles.imagesWrapper}>
              <Image
                style={styles.galleryIMage}
                source={require('../../assets/defaultImg.png')}
              />
              <Image
                style={styles.galleryIMage}
                source={require('../../assets/defaultImg.png')}
              />
              <Image
                style={styles.galleryIMage}
                source={require('../../assets/defaultImg.png')}
              />
            </View>
          </ScrollView>
    </View>
  );
};

export default Trade;
export const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flex: 1,
      backgroundColor: "white",
    },
    ProfileSectionWrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    ImageSection: {
      display: 'flex',
      flex: 1,
      padding: 5,
    },
    viewIconsWrapper: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    imagesWrapper: {
      flexDirection: 'row',
    },
    galleryIMage: {
      display: 'flex',
      flex: 1,
      height: 200,
      margin: 1,
    },
  
  });
