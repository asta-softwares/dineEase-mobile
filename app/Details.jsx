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
import Footer from './Layout/Footer';
import LargeButton from '../Components/Buttons/LargeButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCart } from '../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

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
  const cartContext = useCart();
  const { cart, getTotalItems, getTotalCost, setOwner } = cartContext || {};
  
  const totalItems = cart?.restaurantId === restaurantId ? (getTotalItems?.() || 0) : 0;
  const cartTotal = cart?.restaurantId === restaurantId ? (getTotalCost?.() || 0) : 0;
  const footerAnimatedStyle = useAnimatedStyle(() => {
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
  }, [totalItems]);

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
        // Set owner ID when restaurant loads
        if (restaurantData?.owner) {
          setOwner(restaurantData.owner);
        }
      } catch (error) {
        setError(error.message);
        console.error('Error loading restaurant:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCheckout = () => {
    navigation.navigate("Checkout", {
      restaurantId,
      isDineIn
    });
  };

  const handleImageViewerClose = () => {
    setImageViewerVisible(false);
  };

  const handleMenuItemPress = (item) => {
    navigation.navigate('MenuDetails', {
      item,
      restaurantId,
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

  return (
    <View style={styles.container}>
      <TopNav title={restaurant?.name} handleGoBack={handleGoBack} scrollY={scrollY} />
      
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
             
             <View style={styles.contentWrapper}>
              <View style={styles.infoContainer}>
                {restaurant?.categories?.length > 0 && (
                  <View style={styles.infoItem}>
                    <Ionicons name="restaurant-outline" size={14} color={colors.text.black} style={styles.infoIcon} />
                    <Text style={[typography.bodyMedium, styles.infoText, { color: colors.text.secondary }]}>
                      {restaurant.categories.map(cat => cat.name).join(', ')}
                    </Text>
                  </View>
                )}

                {restaurant?.location && (
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={14} color={colors.text.primary} style={styles.infoIcon} />
                    <Text style={[typography.bodyMedium, styles.infoText, { color: colors.text.secondary }]}>
                      {restaurant.location}
                    </Text>
                  </View>
                )}

                {restaurant?.operating_hours && Object.keys(restaurant.operating_hours).length > 0 && (
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={14} color={colors.text.primary} style={styles.infoIcon} />
                    <Text style={[typography.bodyMedium, styles.infoText, { color: colors.text.secondary }]}>
                      {Object.entries(restaurant.operating_hours)
                        .map(([day, hours]) => `${day}: ${hours}`)
                        .join('\n')}
                    </Text>
                  </View>
                )}

                {restaurant?.telephone && (
                  <View style={styles.infoItem}>
                    <Ionicons name="call-outline" size={14} color={colors.text.primary} style={styles.infoIcon} />
                    <Text style={[typography.bodyMedium, styles.infoText, { color: colors.text.secondary }]}>
                      {restaurant.telephone}
                    </Text>
                  </View>
                )}
              </View>
           

            <View style={styles.descriptionContainer}>
              <Text 
                style={[typography.bodyMedium, styles.description, { 
                  color: colors.text.black, 
                  width: '100%', 
                  marginBottom: 10,
                  textAlign: 'left',
                  flexShrink: 1,
                }]}
                numberOfLines={0}
                ellipsizeMode="clip"
                adjustsFontSizeToFit={false}
              >
                {restaurant?.description}
              </Text>
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
                          <Text style={[styles.backgroundIconText, { opacity: 0.15 }]}>
                            {promo.discount_type === 'percentage' ? '%' : '$'}
                          </Text>
                        </View>
                        <View style={styles.promoContent}>
                          <View style={styles.discountContainer}>
                            <Text style={styles.discountText}>
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
                    <View key={cuisine.id} style={styles.menuSection}>
                      <Text style={[styles.cuisineTitle]}>{cuisine.name}</Text>
                      <MenuItems 
                        items={menuItems}
                        restaurantId={restaurant.id} 
                        handleMenuItemPress={handleMenuItemPress}
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
                <View style={styles.menuSection}>
                  <Text style={[styles.cuisineTitle]}>Other Items</Text>
                  <MenuItems 
                    items={restaurant.menus.filter(
                      menu => !menu.category || !cuisines.some(cuisine => cuisine.id.toString() === menu.category.toString())
                    )}
                    restaurantId={restaurant.id}
                    handleMenuItemPress={handleMenuItemPress}
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
    backgroundColor: colors.background,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
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
    marginTop: 24,
    paddingBottom: 100, // Add padding for the footer
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 24,
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
    backgroundColor: colors.white,
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
    marginBottom: 24,
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
    width: 200,
    minHeight: 120,
  },
  promoIconBackground: {
    position: 'absolute',
    bottom: -25,
    right: -25,
    zIndex: 0,
    transform: [{ rotate: '-10deg' }],
  },
  promoContent: {
    zIndex: 1,
    alignItems: 'flex-start',
    width: '85%',
  },
  backgroundIconText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: colors.success,
  },
  promoIcon: {
    marginRight: 6,
  },
  discountText: {
    color: colors.success,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
  },
  promoTitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
});
