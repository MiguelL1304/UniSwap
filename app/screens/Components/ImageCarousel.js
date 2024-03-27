import React, { useState } from 'react';
import { View, StyleSheet, Image, useWindowDimensions, FlatList } from 'react-native';

const ImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const windowWidth = useWindowDimensions().width;

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);

    setActiveIndex(roundIndex);
  };

  return (
    <View>
      <FlatList
        data={images}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item || "https://via.placeholder.com/400x300" }} // Replace with your default image
            style={[styles.carouselImage, { width: windowWidth }]}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={onScroll}
        keyExtractor={(_, index) => index.toString()}
      />
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: activeIndex === index ? 'black' : 'lightgray' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselImage: {
    height: 300,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
  },
});

export default ImageCarousel;
