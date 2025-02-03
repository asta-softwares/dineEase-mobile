import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
  BackHandler,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import CuisinesCard from "../Components/CuisinesCard";
import RestaurantCard from "../Components/RestaurantCard";
import FeatureCard from "../Components/FeatureCard"; // Import FeatureCard
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { restaurantService } from '../api/services/restaurantService';
import { useUserStore } from '../stores/userStore';
import * as Location from 'expo-location';
import authService from "../api/services/authService";
import cartService from "../api/services/cartService";

export default function HomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  const { width } = useWindowDimensions();
  const [isDineIn, setIsDineIn] = useState(true);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]); // Add featuredRestaurants state
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useUserStore();
  const [locationPermission, setLocationPermission] = useState(null);
  const [hasCartItems, setHasCartItems] = useState(false);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);

  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 25, 50],
    outputRange: [Platform.OS === 'ios' ? 40 : 40, Platform.OS === 'ios' ? 25 : 20, 0],
    extrapolate: 'clamp',
    useNativeDriver: true,
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 25, 50],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
    useNativeDriver: true,
  });

  const handleDetail = (restaurant) => {
    navigation.navigate("Details", { 
      restaurantId: restaurant.id, 
      isDineIn: isDineIn,
    });
  };

  const fetchRestaurants = async (filters = {}, page = 1) => {
    try {
      setLoading(true);
      const serviceType = isDineIn ? 'dine-in' : 'takeout';
      const response = await restaurantService.getRestaurantsByFilter({
        serviceType,
        categoryId: filters.categoryId,
      }, page);

      if (page === 1) {
        setRestaurants(response?.results || []);
      } else {
        setRestaurants(prev => [...prev, ...(response?.results || [])]);
      }
      
      setNextPage(response?.next);
      setHasMore(!!response?.next);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert(
        'Error',
        'Failed to load restaurants. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPageNumber = nextPage ? parseInt(new URL(nextPage).searchParams.get('page')) : null;
      if (nextPageNumber) {
        await fetchRestaurants({
          categoryId: selectedCategory,
        }, nextPageNumber);
      }
    } catch (error) {
      console.error('Error loading more restaurants:', error);
    }
  };

  const handleCategoryPress = async (category) => {
    try {
      if (selectedCategory === category.id) {
        setSelectedCategory(null);
        setNextPage(null);
        setHasMore(true);
        fetchRestaurants({}, 1);
      } else {
        setSelectedCategory(category.id);
        setNextPage(null);
        setHasMore(true);
        fetchRestaurants({ categoryId: category.id }, 1);
      }
    } catch (error) {
      console.error('Error handling category press:', error);
      Alert.alert(
        'Error',
        'Failed to filter restaurants. Please try again.'
      );
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setNextPage(null);
    setHasMore(true);
    try {
      await Promise.all([
        fetchRestaurants({
          categoryId: selectedCategory,
        }, 1),
        fetchCategories(),
        fetchFeaturedRestaurants()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert(
        'Error',
        'Failed to refresh data. Please try again.'
      );
    } finally {
      setRefreshing(false);
    }
  }, [isDineIn, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const allCategories = await restaurantService.getRestaurantsCategory();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedRestaurants = async () => {
    try {
      const response = await restaurantService.getFeaturedRestaurants();
      if (response) {
        setFeaturedRestaurants(response);
      }
    } catch (error) {
      console.error('Error fetching featured restaurants:', error);
    }
  };

  const checkCart = async () => {
    try {
      const cart = await cartService.getUserCart();
      setHasCartItems(cart?.items?.length > 0);
      setCartRestaurantId(cart?.restaurant);
    } catch (error) {
      console.error('Error checking cart:', error);
      setHasCartItems(false);
      setCartRestaurantId(null);
    }
  };

  useEffect(() => {
    if (user) {
      checkCart();
    } else {
      setHasCartItems(false);
      setCartRestaurantId(null);
    }
  }, [user]);

  useEffect(() => {
    fetchFeaturedRestaurants();
  }, []);

  // Categories useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isDineIn]);

  // Restaurants useEffect
  useEffect(() => {
    fetchRestaurants();
  }, [isDineIn]); // Refetch when service type changes

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isDineIn]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit App',
        'Do you want to exit the app?',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: false }
      );
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    (async () => {
      // Check if user is authenticated
      const authToken = useUserStore.getState().authToken;
      if (!authToken) {
        console.log('User not authenticated, skipping location updates');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Start location updates
      const locationInterval = setInterval(async () => {
        // Check authentication status before each update
        const currentAuthToken = useUserStore.getState().authToken;
        if (!currentAuthToken) {
          console.log('User no longer authenticated, stopping location updates');
          clearInterval(locationInterval);
          return;
        }

        try {
          const location = await Location.getCurrentPositionAsync({});
          const coordinates = [location.coords.longitude, location.coords.latitude];
          await authService.updateCoordinates(coordinates);
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }, 60000); // Update every minute

      // Initial location update
      try {
        const location = await Location.getCurrentPositionAsync({});
        const coordinates = [location.coords.longitude, location.coords.latitude];
        await authService.updateCoordinates(coordinates);
      } catch (error) {
        console.error('Error getting initial location:', error);
      }

      // Cleanup interval on component unmount
      return () => clearInterval(locationInterval);
    })();
  }, [useUserStore.getState().authToken]); // Re-run when auth status changes

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        translucent 
        backgroundColor="transparent"
      />
      <View style={styles.container}>
         <SafeAreaView style={styles.header} >
            <Animated.View style={[
              styles.topHeader,
              {
                height: headerHeight,
                opacity: headerOpacity,
                overflow: 'hidden'
              }
            ]}>
             
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/logo-and-text-orange.png")}
                  style={styles.logo}
                />
              </View>
              <TouchableOpacity 
                onPress={() => {
                  if (!user) return;
                  navigation.navigate('Checkout', { 
                    restaurantId: cartRestaurantId || null,
                    isDineIn: isDineIn 
                  });
                }}
                style={styles.cartButton}
              >
                <Ionicons 
                  name="bag-outline" 
                  size={24} 
                  color={colors.text.black} 
                  opacity={user ? 1 : 0}
                />
                {hasCartItems && (
                  <View style={styles.cartIndicator} />
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.searchContainer}>
              <TouchableOpacity 
                style={styles.searchInputContainer}
                onPress={() => navigation.navigate('Search', { isDineIn })}
                activeOpacity={0.7}
              >
                <Text style={styles.searchPlaceholder}>
                  What are you craving?
                </Text>
                <Ionicons name="search" size={20} color={colors.text.secondary} style={{ marginRight: layout.spacing.md }} />
              </TouchableOpacity>
            </View>

            <Animated.View style={[
              styles.serviceTypeContainer,
              {
                height: headerHeight,
                opacity: headerOpacity,
                overflow: 'hidden'
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  isDineIn && styles.activeButton,
                ]}
                onPress={() => setIsDineIn(true)}
              >
                <View style={styles.switchButtonContent}>
                  <Ionicons 
                    name="restaurant-outline" 
                    size={20} 
                    color={isDineIn ? colors.white : colors.text.primary} 
                    style={styles.switchButtonIcon}
                  />
                  <Text style={[styles.switchText, isDineIn && styles.activeText]}>
                    Dine in
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  !isDineIn && styles.activeButton,
                ]}
                onPress={() => setIsDineIn(false)}
              >
                <View style={styles.switchButtonContent}>
                  <Ionicons 
                    name="bag-handle-outline" 
                    size={20} 
                    color={!isDineIn ? colors.white : colors.text.primary} 
                    style={styles.switchButtonIcon}
                  />
                  <Text style={[styles.switchText, !isDineIn && styles.activeText]}>
                    Takeaway
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            </SafeAreaView>

       

        <ScrollView
          style={[styles.scrollView, { minHeight: '100%' }]}
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        >
          <View style={styles.scrollContent}>
            {!isSearching && (
              <>
                {!selectedCategory && (
                  <View style={styles.promoBanner}>
                    <Image
                      source={require('../assets/promo-banner.png')}
                      style={styles.promoImage}
                    />
                  </View>
                )}
                <Text style={[{
                  fontFamily: 'PlusJakartaSans-Bold',
                  fontSize: 20,
                  color: colors.text.primary,
                  marginHorizontal: layout.spacing.md,
                  marginBottom: layout.spacing.sm
                }]}>
                  Explore Cuisines
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.cuisinesContainer}
                  contentContainerStyle={styles.cuisinesContentContainer}
                >
                  {categories.map((category) => (
                    <View key={category.id} style={styles.cuisinesCardWrapper}>
                      <CuisinesCard
                        name={category.name}
                        imageUrl={{ uri: category.image }}
                        description={category.description}
                        onPress={() => handleCategoryPress(category)}
                        isSelected={selectedCategory === category.id}
                      />
                    </View>
                  ))}
                </ScrollView>
                {!selectedCategory && featuredRestaurants.length > 0 && (
                  <>
                    <Text style={[{
                      fontFamily: 'PlusJakartaSans-Bold',
                      fontSize: 20,
                      color: colors.text.primary,
                      marginHorizontal: layout.spacing.md,
                      marginBottom: layout.spacing.sm
                    }]}>
                      Featured
                    </Text>
                    {featuredRestaurants.map(group => (
                      <View key={group.group} style={styles.featuredSection}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.featuredScrollContent}
                        >
                          {group.restaurants.slice(0, 4).map((restaurant) => (
                            <FeatureCard
                              key={restaurant.id}
                              restaurant={restaurant}
                              onPress={() => handleDetail(restaurant)}
                              disabled={!restaurant.is_open}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    ))}
                  </>
                )}
                <Text style={[{
                  fontFamily: 'PlusJakartaSans-Bold',
                  fontSize: 20,
                  color: colors.text.primary,
                  marginHorizontal: layout.spacing.md,
                  marginBottom: layout.spacing.sm
                }]}>
                  {restaurants.length} restaurants to explore
                </Text>
                <View style={styles.restaurantsContainer}>
                  {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                      <TouchableOpacity 
                        key={restaurant.id} 
                        onPress={() => restaurant.is_open && handleDetail(restaurant)}
                        disabled={!restaurant.is_open}
                        style={styles.restaurantCardWrapper}
                      >
                        <RestaurantCard
                          name={restaurant.name}
                          rating={restaurant.ratings}
                          address={restaurant.location}
                          imageUrl={restaurant.image}
                          promos={restaurant.promos}
                          isOpen={restaurant.is_open}
                          isFavorite={restaurant.is_favorite}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={[typography.bodyLarge, { textAlign: 'center', marginTop: 20 }]}>
                      No restaurants found
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    zIndex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 0,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.getResponsiveSpacing(layout.spacing.xxl),
    marginHorizontal: -layout.spacing.md,
    marginBottom: Platform.OS === 'ios' ? 8 : 8,
    marginTop: Platform.OS === 'ios' ? 8 : 8,
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 2,
    paddingHorizontal: layout.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: layout.card.borderRadius,
    height: 50,
  },
  searchPlaceholder: {
    flex: 1,
    paddingHorizontal: layout.spacing.md,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.text.secondary,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.getResponsiveSpacing(layout.spacing.xxl),
    marginHorizontal: -layout.spacing.md,
    marginBottom: Platform.OS === 'ios' ? 8 : 8,
    marginTop: Platform.OS === 'ios' ? 8 : 8,
  
    zIndex: 2,
  },
  switchButton: {
    width: '48%',
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: layout.card.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.text.primary,
  },
  switchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchButtonIcon: {
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: colors.text.primary,
    borderWidth: 0,
  },
  switchText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: colors.text.primary,
  },
  activeText: {
    color: colors.white,
  },
  cuisinesContainer: {
    paddingLeft: layout.spacing.md,
    marginBottom: layout.spacing.md,
  },
  cuisinesCardWrapper: {
    marginRight: layout.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 150 : 140,
    paddingTop: layout.spacing.sm,
  },
  restaurantsContainer: {
    marginBottom: layout.spacing.md,
  },
  restaurantCardWrapper: {
    width: '100%',
    paddingHorizontal: layout.spacing.md,
  },
  promoBanner: {
    width: '100%',
    height: 150,
    marginBottom: layout.spacing.md,
    paddingHorizontal: layout.spacing.md,
    
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: layout.card.borderRadius,
    borderColor: colors.border,
    borderWidth: 1,
  },
  featuredSection: {
    marginBottom: layout.spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: layout.spacing.sm,
    marginHorizontal: layout.spacing.md,
  },
  featuredScrollContent: {
    paddingHorizontal: layout.spacing.md,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
