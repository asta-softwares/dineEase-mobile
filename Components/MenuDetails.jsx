import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useCart } from '../context/CartContext';
import { useUserStore } from '../stores/userStore';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";

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
  const { item, restaurantId } = route.params;
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const imageUrl = item?.images?.[0]?.image || 'https://via.placeholder.com/400';
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const currentQuantity = getItemQuantity(item.id);
    setQuantity(currentQuantity || 1);
  }, [item.id]);

  const handleAddToCart = () => {
    const isAuth = useUserStore.getState().isAuthenticated();
    if (!isAuth) {
      navigation.navigate('Login');
      return;
    }
    if (quantity === 0) {
      updateQuantity(item.id, 0);
    } else {
      addToCart(restaurantId, item, quantity);
    }
    navigation.goBack();
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
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
      
      <View style={styles.detailsContainer}>
        <View style={styles.details}>
          <Text style={[typography.h2, styles.name]}>{item?.name}</Text>
          <Text style={[typography.bodyMedium, styles.description]}>
            {item?.description}
          </Text>
          <Text style={[typography.h4, styles.price]}>${item?.cost}</Text>
        </View>
        {user && (
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
        )}
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
  detailsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  details: {
    gap: 12,
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
