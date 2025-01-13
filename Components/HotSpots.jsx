import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const HotSpots = ({ title, description, imageUrl, price }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.featureImage} />
      <View style={styles.overlay}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Text style={styles.price}>{price}</Text>
      </View>
    </View>
  );
};

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 150,
    height: 200,
    overflow: 'hidden',
  },
  featureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'flex-end',
  },
});

export default FeatureCard;
