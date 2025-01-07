import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const CuisinesCard = ({ name, imageUrl, description, onPress, isSelected }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        <View style={[
          styles.imageContainer,
          isSelected && styles.selectedImageContainer
        ]}>
          <Image 
            source={typeof imageUrl === 'object' ? imageUrl : { uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textContainer}>
          <Text 
            style={[
              typography.labelMedium,
              styles.name,
              { color: isSelected ? colors.primary : colors.text.black}
            ]} 
            numberOfLines={2}
          >
            {name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

CuisinesCard.propTypes = {
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string
    }),
    PropTypes.number
  ]).isRequired,
  description: PropTypes.string,
  onPress: PropTypes.func,
  isSelected: PropTypes.bool
};

const styles = StyleSheet.create({
  touchable: {
    width: 60,
  },
  card: {
    width: 60,
    minHeight: 85,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 0,
    gap: 4,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 45,
    overflow: 'hidden',
  },
  selectedImageContainer: {
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 45,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  textContainer: {
    width: 60,
    minHeight: 25,
    paddingVertical: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 16,
  },
});

export default CuisinesCard;
