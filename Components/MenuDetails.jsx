import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUserStore } from '../stores/userStore';

const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => (
  <View style={styles.quantitySelector}>
    <TouchableOpacity 
      onPress={onDecrease}
      disabled={quantity <= 0}
      style={[styles.quantityButton, quantity <= 0 && styles.quantityButtonDisabled]}
    >
      <Text style={styles.quantityButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity 
      onPress={onIncrease}
      style={styles.quantityButton}
    >
      <Text style={styles.quantityButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

const MenuDetails = ({ route, navigation }) => {
  const { item, restaurantId, onAddToCart, cart, onRemoveFromCart } = route.params;
  const [quantity, setQuantity] = useState(() => {
    if (!cart?.items) return 1;
    const cartItem = cart.items.find(i => i.menu === item.id);
    return cartItem ? cartItem.quantity : 1;
  });
  const imageUrl = item?.images?.[0]?.image || 'https://via.placeholder.com/400';
  const cartItem = cart?.items?.find(i => i.menu === item.id);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    const isAuth = useUserStore.getState().isAuthenticated();
    if (!isAuth) {
      navigation.navigate('Login');
      return;
    }

    try {
      if (quantity === 0 && cartItem) {
        await onRemoveFromCart(cartItem.id);
      } else {
        await onAddToCart(item, quantity);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error updating cart:', error);
      Alert.alert('Error', 'Failed to update cart');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close-outline" size={24} color={colors.text.white} />
      </TouchableOpacity>
      
      <Image 
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={[typography.h2, styles.name]}>{item.name}</Text>
        <Text style={[typography.bodyLarge, styles.description]}>{item.description}</Text>
        <Text style={[typography.h3, styles.price]}>${item.cost}</Text>

        <View style={styles.footer}>
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => handleQuantityChange(quantity + 1)}
            onDecrease={() => handleQuantityChange(Math.max(0, quantity - 1))}
          />
          <TouchableOpacity 
            style={[styles.addToCartButton, styles.addButton]}
            onPress={handleAddToCart}
          >
            <Text style={styles.addButtonText}>
              {quantity === 0 ? 'Remove' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  name: {
    marginTop: 8,
  },
  description: {
    color: colors.secondary,
  },
  price: {
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    color: colors.primary,
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
  },
  addButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MenuDetails;
