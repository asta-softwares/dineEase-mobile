import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';
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

// Initialize reanimated
import 'react-native-reanimated';

enableScreens();

const Stack = createNativeStackNavigator();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const initializeAuth = useUserStore(state => state.initializeAuth);
  const clearUser = useUserStore(state => state.clearUser);
  const user = useUserStore(state => state.user);

  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const merchantIdentifier = process.env.EXPO_PUBLIC_MERCHANT_IDENTIFIER;

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize user state from storage
        await initializeAuth();
        
        // Register for push notifications if user is logged in
        if (useUserStore.getState().user) {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await authService.updateUser({
              profile: { notification_token: token }
            });
          }
        }

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
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [initializeAuth]);

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
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
              initialRouteName={user ? "Home" : "Landing"}
            >
              <Stack.Screen 
                name="Landing" 
                component={Landing} 
                options={{
                  gestureEnabled: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{
                  gestureEnabled: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{
                  gestureEnabled: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen 
                name="VerifyEmail" 
                component={VerifyEmailScreen} 
                options={{
                  gestureEnabled: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                  gestureEnabled: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen name="Details" component={DetailScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
              <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
