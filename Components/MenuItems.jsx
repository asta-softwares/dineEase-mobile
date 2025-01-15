import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { LinearGradient } from 'expo-linear-gradient';

const MenuItem = ({ item, restaurantId, cart, onPress }) => {
  const getItemQuantity = (itemId) => {
    if (!cart?.items) return 0;
    const cartItem = cart.items.find(i => i.menu === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const quantity = getItemQuantity(item.id);
  
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
      onPress={() => onPress(item)}
    >
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Text style={[typography.labelLarge, styles.name]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[typography.bodyMedium, styles.price]}>
            ${item.cost}
          </Text>
        </View>
      </LinearGradient>
      {quantity > 0 && (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityBadgeText}>{quantity}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    cost: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        image: PropTypes.string,
        caption: PropTypes.string,
      })
    ),
  }).isRequired,
  restaurantId: PropTypes.number.isRequired,
  cart: PropTypes.object,
  onPress: PropTypes.func.isRequired,
};

const MenuItems = ({ items, restaurantId, cart, onMenuItemPress }) => {
  // Split items into pairs for two columns
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              restaurantId={restaurantId}
              cart={cart}
              onPress={onMenuItemPress}
            />
          ))}
          {/* Add empty view if row has only one item */}
          {row.length === 1 && <View style={styles.menuItem} />}
        </View>
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
      images: PropTypes.array,
    })
  ).isRequired,
  restaurantId: PropTypes.number.isRequired,
  cart: PropTypes.object,
  onMenuItemPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuItem: {
    width: '48%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    padding: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  name: {
    color: colors.white,
    marginBottom: 4,
  },
  price: {
    color: colors.white,
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MenuItems;