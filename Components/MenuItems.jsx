import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const MenuItem = ({ item, restaurantId }) => {
  const { getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const navigation = useNavigation();
  
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0].image 
    : 'https://via.placeholder.com/400';

  return (
    <TouchableOpacity 
      style={[
        styles.menuItem,
        quantity > 0 && styles.menuItemSelected
      ]} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('MenuDetails', { item, restaurantId })}
    >
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={[typography.labelLarge, styles.name]}>{item.name}</Text>
          <Text style={[typography.bodySmall, styles.description]} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={[typography.bodyMedium, styles.price]}>${item.cost}</Text>
        </View>
        <View>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          {quantity > 0 && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>{quantity}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    cost: PropTypes.string.isRequired,
    description: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        image: PropTypes.string,
        caption: PropTypes.string,
      })
    ),
  }).isRequired,
  restaurantId: PropTypes.number.isRequired,
};

const MenuItems = ({ items, restaurantId }) => {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          restaurantId={restaurantId}
        />
      ))}
    </View>
  );
};

MenuItems.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      cost: PropTypes.string.isRequired,
      description: PropTypes.string,
      images: PropTypes.array,
    })
  ).isRequired,
  restaurantId: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  menuItem: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 0,
  },
  menuItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E1E9EE',
  },
  name: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  description: {
    color: colors.text.secondary,
    marginBottom: 4,
  },
  price: {
    color: colors.primary,
    fontWeight: '600',
  },
  quantityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  quantityBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Bold',
    paddingHorizontal: 6,
  },
});

export default MenuItems;