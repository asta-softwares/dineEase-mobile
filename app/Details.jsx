import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageView from "react-native-image-viewing";
import TopNav from "../Components/TopNav";
import MenuItems from "../Components/MenuItems";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { restaurantService } from "../api/services/restaurantService";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../api/services/authService';
import cartService from '../api/services/cartService';
import { Alert } from 'react-native';
import { useUserStore } from '../stores/userStore';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function DetailScreen({ route, navigation }) {
  const { restaurantId, isDineIn } = route.params;
  const { width } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [cart, setCart] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [restaurantData, cuisinesData] = await Promise.all([
          restaurantService.getRestaurantById(restaurantId),
          restaurantService.getMenuCuisines()
        ]);
        setRestaurant(restaurantData);
        setCuisines(cuisinesData);
        setIsFavorite(restaurantData?.is_favorite || false);
      } catch (error) {
        setError(error.message);
        console.error('Error loading restaurant:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart(null);
        return;
      }
      try {
        const cartData = await cartService.getUserCart();
        if (cartData && cartData.restaurant === restaurantId) {
          setCart(cartData);
        } else {
          setCart(null);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, [restaurantId, user]);

  const getTotalItems = () => {
    'worklet';
    if (!cart?.items) return 0;
    return cart.items.length;
  };

  const getTotalCost = () => {
    'worklet';
    if (!cart?.items) return 0;
    return cart.total_cost; 
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus); 
      await authService.toggleFavorite('restaurant', restaurantId);
    } catch (error) {
      setIsFavorite(!isFavorite); 
      Alert.alert('Error', 'Failed to update favorite status');
      console.error('Error updating favorite:', error);
    }
  };

  const handleAddToCart = async (item, quantity) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      const cartData = {
        restaurant: restaurantId,
        items: [{
          menu: item.id,
          quantity: quantity,
        }]
      };

      let updatedCart;
      if (!cart) {
        updatedCart = await cartService.createCart(cartData);
      } else {
        try {
          updatedCart = await cartService.updateCart(cart.id, cartData);
        } catch (error) {
          if (error?.message === "Not found.") {
            updatedCart = await cartService.createCart(cartData);
          } else {
            throw error;
          }
        }
      }
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const cartData = await cartService.getUserCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    if (!user) return;
    try {
      if (!cart) return;
      await cartService.deleteItemCart(cart.id, itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate("Checkout", {
      restaurantId,
      isDineIn
    });
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const imageStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [-200, 0, 200],
      [452, 252, 252],
      { extrapolate: 'clamp' }
    ),
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => {
    const totalItems = getTotalItems();
    return {
      transform: [
        {
          translateY: withSpring(totalItems > 0 ? 0 : 100, {
            damping: 20,
            stiffness: 90,
          })
        }
      ],
      opacity: withSpring(totalItems > 0 ? 1 : 0)
    };
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleImageViewerClose = () => {
    setImageViewerVisible(false);
  };

  const handleMenuItemPress = (item) => {
    navigation.navigate('MenuDetails', {
      item,
      restaurantId,
      cart,
      onAddToCart: handleAddToCart,
      onRemoveFromCart: handleRemoveFromCart
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[typography.h3, { color: colors.text.error }]}>Error: {error}</Text>
      </View>
    );
  }

  const totalItems = getTotalItems();
  const cartTotal = getTotalCost();

  return (
    <View style={styles.container}>
      <TopNav 
        title={restaurant?.name} 
        handleGoBack={handleGoBack} 
        scrollY={scrollY}
        showActionButtons={true}
        onInfoPress={() => navigation.navigate('RestaurantInfo', { restaurant })}
        isFavorite={isFavorite}
        onFavoritePress={handleFavoriteToggle}
      />
      
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ width: '100%' }}
        style={{ width: '100%' }}
        bounces={false}
        overScrollMode="never"
      >
        <View style={{ width: '100%', flex: 1 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setImageViewerVisible(true)}
          >
            <Animated.Image
              source={{
                uri: restaurant?.image || 'https://via.placeholder.com/400',
              }}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View style={[styles.content, { backgroundColor: colors.light }]}>
            <View style={[styles.header]}>
              <Text style={[typography.h2, styles.title, { color: colors.text.black }]}>{restaurant?.name}</Text>
              <View style={styles.ratingContainer}>
                <LinearGradient
                  colors={colors.gradients.rating}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ratingBadge}
                >
                  <Ionicons name="star" size={14} color={colors.white} />
                  <Text style={styles.ratingText}>{restaurant?.ratings?.toFixed(1) || '0.0'}</Text>
                </LinearGradient>
              </View>
            </View>

            {restaurant?.promos?.length > 0 && (
              <>
                <Text style={[typography.h3, styles.sectionTitle]}>Available Deals</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.promosContainer}
                  contentContainerStyle={styles.promosContentContainer}
                >
                  <View style={styles.promoSpacer} />
                  {restaurant.promos
                    .filter(promo => promo.status === 'active')
                    .map((promo) => (
                      <View
                        key={promo.id}
                        style={styles.promoCard}
                      >
                        <View style={styles.promoIconBackground}>
                          <Ionicons 
                            name='pricetag'  
                            style={[styles.backgroundIconText, { opacity: 0.15 }]}
                          />
                        </View>
                        <View style={styles.promoContent}>
                          <View style={styles.discountContainer}>
                            <Text style={styles.discountText}>
                            <Ionicons name='pricetag'   size={12} />
                              {promo.discount_type === 'percentage' 
                                ? `${promo.discount}% OFF`
                                : `$${promo.discount} OFF`}
                            </Text>
                          </View>
                          <Text style={styles.promoTitle}>{promo.name}</Text>
                        </View>
                      </View>
                    ))}
                  <View style={styles.promoSpacer} />
                </ScrollView>
              </>
            )}

            <View style={styles.menuContainer}>
              <Text style={[typography.h3, styles.sectionTitle]}>Menu Items</Text>
              {cuisines.map(cuisine => {
                const menuItems = restaurant?.menus?.filter(
                  menu => menu.category && menu.category.toString() === cuisine.id.toString()
                );
                
                if (menuItems && menuItems.length > 0) {
                  return (
                    <View key={cuisine.id}>
                      <Text style={[styles.cuisineTitle]}>{cuisine.name}</Text>
                      <MenuItems 
                        items={menuItems}
                        restaurantId={restaurant.id} 
                        cart={cart}
                        onMenuItemPress={handleMenuItemPress}
                      />
                    </View>
                  );
                }
                return null;
              })}
              
              {/* Uncategorized items */}
              {restaurant?.menus?.filter(
                menu => !menu.category || !cuisines.some(cuisine => cuisine.id.toString() === menu.category.toString())
              ).length > 0 && (
                <View >
                  <Text style={[styles.cuisineTitle]}>Other Items</Text>
                  <MenuItems 
                    items={restaurant.menus.filter(
                      menu => !menu.category || !cuisines.some(cuisine => cuisine.id.toString() === menu.category.toString())
                    )}
                    restaurantId={restaurant.id}
                    cart={cart}
                    onMenuItemPress={handleMenuItemPress}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </AnimatedScrollView>

      <ImageView
        images={[{ uri: restaurant?.image }]}
        imageIndex={0}
        visible={imageViewerVisible}
        onRequestClose={handleImageViewerClose}
      />
      
      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleCheckout}
        >
          <Text style={styles.cartButtonText}>
            View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'}) - Total: ${cartTotal.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 252,
  },
  content: {
    marginTop: -24,
    padding: 20,
    paddingTop: 24,
    width: '100%',
    alignSelf: 'stretch',
  },
  contentWrapper: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderColor: colors.border,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  ratingText: {
    marginLeft: 2,
    color: colors.white,
  },
  infoContainer: {
    marginBottom: 16,
    width: '100%',

  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 12,
    width: '100%',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  description: {
    width: '100%',
    marginBottom: 10,
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  descriptionContainer: {
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuContainer: {
    marginTop: 12,
    paddingBottom: 100, // Add padding for the footer
  },
  sectionTitle: {
    marginBottom: 12,
    color: colors.text.primary,
  },
  cuisineTitle: {
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: colors.text.black,
    paddingHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingBottom: 32,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  cartButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonText: {
    color: colors.white,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  promosContainer: {
    marginLeft: -20,
    marginRight: -20,
  },
  promosContentContainer: {
    flexGrow: 1,
  },
  promoSpacer: {
    width: 20,
  },
  promoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
    borderColor: colors.border,
    borderWidth: 1,
    width: 180,
    maxHeight: 80,
  },
  promoIconBackground: {
    position: 'absolute',
    bottom: -20,
    right: 10,
    zIndex: 0,
    transform: [{ rotate: '-10deg' }],
  },
  promoContent: {
    zIndex: 1,
    alignItems: 'flex-start',
    width: '85%',
  },
  backgroundIconText: {
    fontSize: 80,
    color: colors.success,
  },
  promoIcon: {
    marginRight: 6,
  },
  discountText: {
    color: colors.success,
    ...typography.bodySmall,
  },
  promoTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
