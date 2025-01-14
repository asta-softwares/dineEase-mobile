import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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
};

const MenuItems = ({ items, restaurantId }) => {
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
};

const windowWidth = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 20;
const VERTICAL_GAP = 24;
const itemSize = Math.floor((windowWidth - (HORIZONTAL_PADDING * 2) - ITEM_GAP) / 2);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  row: {
    flexDirection: 'row',
    marginBottom: VERTICAL_GAP,
    gap: ITEM_GAP,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  menuItem: {
    width: itemSize,
    height: itemSize,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  contentContainer: {
    padding: 12,
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