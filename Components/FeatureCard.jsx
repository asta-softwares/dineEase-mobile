import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FeatureCard = ({ restaurant, onPress, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Image 
        source={{ uri: restaurant.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />
      <View style={styles.badges}>
        {!restaurant.is_open ? (
          <View style={styles.closedBadge}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        ) : restaurant.is_open && restaurant.ratings ? (
          <LinearGradient
            colors={colors.gradients.rating}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rating}
          >
            <Ionicons name="star" size={14} color={colors.white} />
            <Text style={styles.ratingText}>{restaurant.ratings}</Text>
          </LinearGradient>
        ) : null}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{restaurant.name}</Text>
        <Text style={styles.location} numberOfLines={1}>{restaurant.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: layout.card.borderRadius,
    marginRight: layout.spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 300,
    height: 140,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderColor: colors.border,
    borderWidth: 1,

  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: layout.spacing.md,
    justifyContent: 'flex-end',
  },
  name: {
    ...typography.h3,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: layout.spacing.xs,
  },
  badges: {
    position: 'absolute',
    top: layout.spacing.sm,
    right: layout.spacing.sm,
    zIndex: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    ...typography.labelMedium,
    color: colors.white,
    marginLeft: 4,
  },
  location: {
    ...typography.body2,
    color: colors.white,
  },
  closedBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedText: {
    ...typography.caption,
    color: colors.white,
  },
});

export default FeatureCard;
