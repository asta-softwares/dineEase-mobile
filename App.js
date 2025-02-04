import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import React, { useEffect, useState, useRef } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SystemBars } from 'react-native-edge-to-edge';
import * as Notifications from 'expo-notifications';
import CheckoutScreen from './app/Checkout';
import DetailScreen from './app/Details';
import HomeScreen from './app/Home';
import LoginScreen from './app/Login';
import Landing from './app/Landing';
import ProfileScreen from './app/Profile';
import EditProfileScreen from './app/EditProfile';
import RegisterScreen from './app/Register';
import VerifyEmailScreen from './app/VerifyEmail';
import { colors } from './styles/colors';
import { CartProvider } from './context/CartContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import OrderDetailScreen from './app/OrderDetail';
import OrdersScreen from './app/Orders';
import { useUserStore } from './stores/userStore';
import { STRIPE_PUBLISHABLE_KEY, MERCHANT_IDENTIFIER } from '@env';
import { setupNotificationListeners, registerForPushNotificationsAsync } from './utils/notificationService';
import authService from './api/services/authService';
import SearchScreen from './app/Search';
import MenuDetailsScreen from './Components/MenuDetails';
import RestaurantInfo from './app/RestaurantInfo';
import { Ionicons } from '@expo/vector-icons';
import { setNavigationRef } from './api/client';
import Favorites from './app/Favorites';
// Initialize reanimated
import 'react-native-reanimated';

enableScreens();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function TabNavigator() {
  const { user } = useUserStore();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
          backgroundColor: colors.white,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      { user && (
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ 
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "receipt" : "receipt-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      )}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const initializeAuth = useUserStore(state => state.initializeAuth);
  const clearUser = useUserStore(state => state.clearUser);
  const user = useUserStore(state => state.user);

  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const merchantIdentifier = process.env.EXPO_PUBLIC_MERCHANT_IDENTIFIER;

  const navigationRef = useRef(null);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize user state from storage
        await initializeAuth();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [initializeAuth]);

  useEffect(() => {
    const registerNotifications = async () => {
      if (user) {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await authService.updateUser({
              profile: { notification_token: token }
            });
          }
        } catch (error) {
          console.error('Error registering notifications:', error);
        }
      }
    };

    registerNotifications();
  }, [user]);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await clearUser();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    return () => {
      // Cleanup
    };
  }, [clearUser]);

  useEffect(() => {
    // Setup notification listeners
    const subscription = setupNotificationListeners(
      (notification) => {
        // Handle received notification while app is foregrounded
        console.log('Notification received:', notification);
      },
      (response) => {
        // Handle notification response (user tapped notification)
        console.log('Notification response:', response);
      }
    );

    return () => {
      // Cleanup notification subscription when component unmounts
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SystemBars style="auto" />
      <StripeProvider
        publishableKey={stripePublishableKey}
        merchantIdentifier={merchantIdentifier}
      >
        <CartProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false
              }}
            >
              {!user ? (
                <>
                  <Stack.Screen name="Landing" component={Landing} />
                  <Stack.Screen 
                    name="Login" 
                    component={LoginScreen}
                    options={{
                      presentation: "formSheet",
                      gestureDirection: "vertical",
                      animation: "slide_from_bottom",
                      sheetGrabberVisible: true,
                    }}
                  />
                  <Stack.Screen 
                    name="Register" 
                    component={RegisterScreen}
                    options={{
                      gestureEnabled: false
                    }}
                  />
                  <Stack.Screen 
                    name="VerifyEmail" 
                    component={VerifyEmailScreen}
                    options={{
                      gestureEnabled: false
                    }}
                  />
                </>
              ) : null}
              <Stack.Screen 
                name="Main" 
                component={TabNavigator}
                options={{
                  gestureEnabled: false
                }}
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen}
              />
              <Stack.Screen 
                name="Details" 
                component={DetailScreen}
              />
              <Stack.Screen 
                name="Checkout" 
                component={CheckoutScreen}
              />
              <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen}
              />
              <Stack.Screen 
                name="OrderDetailScreen" 
                component={OrderDetailScreen}
              />
              <Stack.Screen 
                name="MenuDetails" 
                component={MenuDetailsScreen}
                options={{
                  presentation: "formSheet",
                  gestureDirection: "vertical",
                  animation: "slide_from_bottom",
                  sheetGrabberVisible: true,
                }}
              />
              <Stack.Screen 
                name="RestaurantInfo" 
                component={RestaurantInfo}
                options={{
                  presentation: "formSheet",
                  headerShown: false,
                   animation: "slide_from_bottom",
                  sheetGrabberVisible: true,
                }}
              />
               <Stack.Screen 
                name="Favorites" 
                component={Favorites}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
