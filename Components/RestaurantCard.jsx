import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import { useUserStore } from '../stores/userStore';

const RestaurantCard = ({ 
  name, 
  rating, 
  address, 
  imageUrl, 
  price,
  promos = [], 
  style = {},
  isOpen = true,
  isFavorite = false
}) => {
  const user = useUserStore(state => state.user);
  const firstPromo = promos?.[0];
  const additionalPromos = promos?.length > 1 ? promos.length - 1 : 0;

  const getPromoText = (promo) => {
    const discount = promo.discount.endsWith('.00') 
      ? promo.discount.split('.')[0] 
      : promo.discount;
      
    if (promo.discount_type === 'percentage') {
      return `${discount}% discount`;
    }
    return `$${discount} discount`;
  };

  return (
    <View style={[
      styles.cardWrapper, 
      style, 
      !isOpen && styles.closedRestaurant
    ]}>
      <View style={styles.restaurantCard}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.restaurantImage} />
          {user && isFavorite && (
            <View style={styles.favoriteContainer}>
              <Ionicons name="heart" size={20} color={colors.error} />
            </View>
          )}
          {!isOpen ? (
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          ) : rating ? (
            <LinearGradient
              colors={colors.gradients.rating}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rating}
            >
              <Ionicons name="star" size={14} color={colors.white} />
              <Text style={[typography.labelMedium, styles.ratingText]}>{rating}</Text>
            </LinearGradient>
          ) : null}
          {firstPromo && (
            <View style={styles.promosContainer}>
              <LinearGradient
                colors={colors.gradients.success}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.promoBadge}
              >
                <View style={styles.promoContainer}>
                  <Text style={styles.promoText} numberOfLines={1}>
                    {firstPromo.name} 
                  </Text>
                  <Text style={styles.promoDiscount}>
                    {getPromoText(firstPromo)}
                  </Text>
                </View>
              </LinearGradient>
              {additionalPromos > 0 && (
                <LinearGradient
                  colors={colors.gradients.success}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.promoBadge, styles.additionalPromoBadge]}
                >
                  <Text style={styles.promoDiscount}>
                    +{additionalPromos} more
                  </Text>
                </LinearGradient>
              )}
            </View>
          )}
        </View>
        <View style={styles.restaurantInfo}>
          <View style={styles.nameAndPriceContainer}>
            <Text style={[typography.h3, styles.restaurantName]} numberOfLines={1}>{name}</Text>
            {price && (
              <Text style={[typography.bodyMedium, styles.restaurantPrice]}>{price}</Text>
            )}
          </View>
          <View style={styles.addressContainer}>
            <Text style={[typography.bodyMedium, styles.restaurantAddress]} numberOfLines={1}>{address}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

RestaurantCard.propTypes = {
  name: PropTypes.string.isRequired,
  rating: PropTypes.number,
  address: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  price: PropTypes.string,
  promos: PropTypes.array,
  style: PropTypes.object,
  isOpen: PropTypes.bool,
  isFavorite: PropTypes.bool,
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    marginBottom: layout.spacing.md,
  },
  closedRestaurant: {
    opacity: 0.6,
  },
  restaurantCard: {
    backgroundColor: colors.background,
    borderRadius: layout.card.borderRadius,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,

    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 155,
  },
  rating: {
    position: 'absolute',
    top: layout.spacing.sm,
    right: layout.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closedBadge: {
    position: 'absolute',
    top: layout.spacing.sm,
    right: layout.spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedText: {
    ...typography.caption,
    color: colors.white,
  },
  ratingText: {
    color: colors.white,
    marginLeft: 4,
  },
  promosContainer: {
    position: 'absolute',
    bottom: layout.spacing.sm,
    left: layout.spacing.sm,
    gap: 4,
  },
  promoBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  additionalPromoBadge: {
    alignSelf: 'flex-start',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoText: {
    ...typography.labelMedium,
    color: colors.text.white,
    fontSize: 12,
  },
  promoDiscount: {
    ...typography.labelMedium,
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteContainer: {
    position: 'absolute',
    top: layout.spacing.sm,
    left: layout.spacing.sm,
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantInfo: {
    padding: layout.spacing.md,
  },
  nameAndPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.xs,
  },
  restaurantName: {
    flex: 1,
    marginRight: layout.spacing.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantAddress: {
    flex: 1,
  },
  restaurantPrice: {
    ...typography.bodyMedium,
  },
});

export default RestaurantCard;
