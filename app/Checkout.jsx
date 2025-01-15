import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useUserStore } from '../stores/userStore';
import TopNav from '../Components/TopNav';
import Badge from '../Components/Badge';
import { restaurantService } from '../api/services/restaurantService';
import cartService from '../api/services/cartService';
import Footer from './Layout/Footer';
import LargeButton from '../Components/Buttons/LargeButton';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';

const CartItem = ({ item, quantity }) => (
  <View style={styles.orderItem}>
    <View style={styles.itemInfo}>
      <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
        {quantity}x {item.menu_name}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
        ${item.menu_cost} each
      </Text>
    </View>
    <Text style={[typography.bodyLarge, { color: colors.text.primary }]}>
      ${(item.menu_cost * quantity).toFixed(2)}
    </Text>
  </View>
);

const TotalRow = ({ label, value, isTotal, type }) => {
  if (type === 'discount') {
    return (
      <View style={styles.totalRow}>
        <Text style={[typography.bodyLarge, { color: colors.text.secondary }]}>
          {label}
        </Text>
        <Text style={[typography.bodyLarge, { color: colors.success }]}>
          -${parseFloat(value || 0).toFixed(2)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.totalRow}>
      <Text style={[typography.bodyLarge, { color: colors.text.secondary }]}>
        {label}
      </Text>
      {type === 'percentage' ? (
        <Text style={[typography.bodyLarge, { color: colors.text.black }]}>
          {value}%
        </Text>
      ) : (
        <Text style={[typography.bodyLarge, isTotal && { color: colors.text.primary }]}>
          ${parseFloat(value || 0).toFixed(2)}
        </Text>
      )}
    </View>
  );
};

const CheckoutScreen = ({ route, navigation }) => {
  const { restaurantId, isDineIn } = route.params;
  const user = useUserStore((state) => state.user);
  const [cart, setCart] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [orderTotals, setOrderTotals] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [showPromoDropdown, setShowPromoDropdown] = useState(false);
  const { initPaymentSheet, presentPaymentSheet, retrievePaymentIntent } = useStripe();

  const getTotalCost = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (parseFloat(item.menu_cost) * item.quantity);
    }, 0);
  };

  const subtotal = getTotalCost();

  useEffect(() => {
    const loadCartAndRestaurant = async () => {
      try {
        setInitialLoading(true);
        // Load restaurant first to get owner ID
        const restaurantData = await restaurantService.getRestaurantById(restaurantId);
        setRestaurant(restaurantData);
        
        // Load cart with restaurant owner ID
        const cartData = await cartService.getCart(restaurantId);
        if (cartData) {
          setCart({
            ...cartData,
            owner_id: restaurantData.owner
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load cart or restaurant data');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };
    loadCartAndRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    const calculateOrderTotal = async () => {
      if (cart && subtotal > 0) {
        try {
          setCalculating(true);
          const promoIds = selectedPromos.map(promo => promo.id);
          const calculateTotal = await restaurantService.getOrderTotal({
            order_total: subtotal.toFixed(2),
            restaurant_id: restaurantId,
            promo_ids: promoIds,
          });
          setOrderTotals(calculateTotal);
        } catch (error) {
          console.error('Error calculating order total:', error);
          Alert.alert('Error', 'Unable to calculate order total');
        } finally {
          setCalculating(false);
        }
      }
    };
    calculateOrderTotal();
  }, [cart, subtotal, selectedPromos]);

  useEffect(() => {
    const fetchAvailablePromos = async () => {
      if (!orderTotals) return;
      
      try {
        const promos = await restaurantService.getOrderPromos(
          restaurantId,
          orderTotals.total.toFixed(0)
        );
        setAvailablePromos(promos);
      } catch (error) {
        console.error('Error fetching promos:', error);
      }
    };
    fetchAvailablePromos();
  }, [orderTotals, restaurantId]);

  const handlePromoSelect = (promo) => {
    if (selectedPromos.some(p => p.id === promo.id)) {
      setSelectedPromos(selectedPromos.filter(p => p.id !== promo.id));
    } else {
      setSelectedPromos([...selectedPromos, promo]);
    }
  };

  const handlePayment = async () => {
    if (isProcessing || loading || calculating) return;

    try {
      setIsProcessing(true);
      setLoading(true);

      // Check if restaurant is still open
      const currentRestaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!currentRestaurant.is_open) {
        Alert.alert('Restaurant Closed', 'This restaurant is currently closed and cannot accept orders.');
        return;
      }

      if (subtotal <= 0) {
        Alert.alert('Error', 'Your cart is empty');
        return;
      }

      if (!orderTotals) {
        Alert.alert('Error', 'Unable to calculate order total');
        return;
      }

      if (!user?.email) {
        Alert.alert('Error', 'Please log in to continue with payment');
        return;
      }

      // Prepare order data with owner_id from restaurant
      const orderData = {
        amount: orderTotals.total.toFixed(2),
        restaurant_id: restaurantId,
        menu_items: cart.items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
        promo_ids: selectedPromos.map(promo => promo.id),
        owner_id: restaurant.owner,
        order_type: isDineIn ? 'dine_in' : 'takeaway',
        order_total: orderTotals.total.toFixed(2),
      };

      const { clientSecret, customerId, ephemeralKey } = await restaurantService.createPaymentIntent({
        order_total: orderTotals.total.toFixed(2),
        restaurant_id: restaurantId,
      }).catch(error => {
        Alert.alert('Payment Error', error.message);
        throw error;
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'DineEase',
        customerId: customerId,
        customerEphemeralKeySecret: ephemeralKey,
        defaultBillingDetails: {
          email: user?.email,
        },
        allowsDelayedPaymentMethods: false,
      }).catch(error => {
        Alert.alert('Payment Error', error.message);
        throw error;
      });

      if (initError) {
        Alert.alert('Payment Error', initError.message);
        throw new Error(initError.message);
      }

      const { error: paymentError } = await presentPaymentSheet().catch(error => {
        Alert.alert('Payment Error', error.message);
        throw error;
      });

      if (paymentError) {
        Alert.alert('Payment Error', paymentError.message);
        throw new Error(paymentError.message);
      }

      // Retrieve the PaymentIntent details after successful payment
      const { paymentIntent, error: retrieveError } = await retrievePaymentIntent(clientSecret);
      
      if (retrieveError) {
        console.error('Error retrieving payment details:', retrieveError);
        Alert.alert('Error', 'Could not retrieve payment details. Please contact support.');
        throw new Error(retrieveError.message);
      }

      console.log('Payment Success Details:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000).toISOString(),
      });
      
      if (paymentIntent.status === "Succeeded") {
        // Create the order after successful payment
        const result = await restaurantService.createOrder({
          ...orderData,
          transaction_id: paymentIntent.id,
        }).catch(error => {
          Alert.alert('Order Error', error.message);
          throw error;
        });
        
        const orderDetailsData = result.order;
        setOrderDetails(orderDetailsData);
        console.log('Order Creation Response:', result);

        Alert.alert(
          'Success',
          'Payment successful! Your order has been placed.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (cart?.id) {
                  cartService.deleteCart(cart.id);
                }
                navigation.navigate('OrderDetailScreen', { order: orderDetailsData, restaurant: restaurant, fromCheckout: true });
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment failed');
        throw new Error("Payment failed");
      }

    } catch (error) {
      console.error('Payment process error:', error);
      Alert.alert('Error', error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <TopNav 
          handleGoBack={() => navigation.goBack()} 
          title="Checkout" 
          variant="solid"
          showBack={true}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <TopNav 
          handleGoBack={() => navigation.goBack()} 
          title="Checkout" 
          variant="solid"
          showBack={true}
        />
        <View style={styles.emptyCart}>
          <Text style={[typography.h3, { color: colors.text.secondary }]}>
            Your cart is empty
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav 
        handleGoBack={() => navigation.goBack()} 
        title="Checkout" 
        variant="solid"
        showBack={true}
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, styles.contentPadding]}
        showsVerticalScrollIndicator={false}
      >

        {/* Restaurant Information */}
        <View style={styles.section}>
          <View style={styles.restaurantHeader}>
            <View style={styles.restaurantInfo}>
              <Text style={[typography.titleMedium, { color: colors.text.primary }]}>
                {restaurant?.name}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
                {restaurant?.location}
              </Text>
            </View>
            <Badge 
              text={isDineIn ? 'Dine In' : 'Takeaway'} 
              type={isDineIn ? 'pending' : 'confirmed'}
              icon={isDineIn ? 'restaurant-outline' : 'bag-handle-outline'}
            />
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.section}>
          <Text style={[typography.titleMedium, styles.sectionTitle]}>Promo Codes</Text>
          
          {/* Selected Promos */}
          {selectedPromos.length > 0 && (
            <View style={styles.promosContainer}>
              {selectedPromos.map((promo) => (
                <View key={promo.id} style={styles.promoTag}>
                  <Text style={[typography.bodySmall, styles.promoText]}>
                    {promo.name} ({promo.discount_type === 'percentage' ? `${promo.discount}%` : `$${promo.discount}`} off)
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handlePromoSelect(promo)}
                    style={styles.removePromo}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Promo Selector */}
          <TouchableOpacity
            style={styles.promoSelector}
            onPress={() => setShowPromoDropdown(!showPromoDropdown)}
          >
            <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
              Select a promo code
            </Text>
            <Ionicons
              name={showPromoDropdown ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Promo Dropdown */}
          {showPromoDropdown && (
            <View style={styles.promoDropdown}>
              {availablePromos.length > 0 ? (
                availablePromos
                  .filter(promo => !selectedPromos.some(p => p.id === promo.id))
                  .map((promo) => (
                    <TouchableOpacity
                      key={promo.id}
                      style={styles.promoOption}
                      onPress={() => {
                        handlePromoSelect(promo);
                        setShowPromoDropdown(false);
                      }}
                    >
                      <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
                        {promo.name} ({promo.discount_type === 'percentage' ? `${promo.discount}%` : `$${promo.discount}`} off)
                      </Text>
                    </TouchableOpacity>
                  ))
              ) : (
                <Text style={[typography.bodyMedium, styles.noPromos]}>
                  No promos available
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[typography.titleMedium, styles.sectionTitle]}>Order Summary</Text>
          {cart.items.map((item, index) => (
            <CartItem key={index} item={item} quantity={item.quantity} />
          ))}
          
          <View style={styles.divider} />
          
          {calculating ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
          ) : orderTotals && (
            <>
              <TotalRow label="Subtotal" value={orderTotals.order_total} />
              {orderTotals.discount > 0 && (
                <TotalRow label="Discount" value={orderTotals.discount} type="discount" />
              )}
               {orderTotals.tax_rate > 0 && (
              <TotalRow label="Tax Rate" value={orderTotals.tax_rate} type="percentage" />
              )}
             {orderTotals.tax_amount > 0 && (
              <TotalRow label="Tax Amount" value={orderTotals.tax_amount} />
              )}
              {orderTotals.service_fee > 0 && (
              <TotalRow label="Service Fee" value={orderTotals.service_fee} />
              )}
              {orderTotals.service_fee_tax > 0 && (
              <TotalRow label="Service Fee Tax" value={orderTotals.service_fee_tax} />
              )}
              <View style={styles.divider} />
              <TotalRow label="Total" value={orderTotals.total} isTotal />
            </>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={[typography.titleMedium, styles.sectionTitle]}>Payment Information</Text>
          <View style={styles.paymentInfo}>
            <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
              Payment will be processed for:
            </Text>
            <Text style={[typography.bodyLarge, { color: colors.text.primary, marginTop: 4 }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Footer>
        {!restaurant?.is_open && (
          <Text style={[typography.bodyMedium, { color: colors.error, textAlign: 'center', marginBottom: 8 }]}>
            This restaurant is currently closed
          </Text>
        )}
        <LargeButton 
          title="Pay Now"
          price={orderTotals ? `$${orderTotals.total.toFixed(2)}` : `$${subtotal.toFixed(2)}`}
          onPress={handlePayment}
          loading={loading || calculating || isProcessing}
          disabled={loading || calculating || isProcessing || !restaurant?.is_open}
        />
      </Footer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  contentPadding: {
    paddingTop: Platform.OS === 'ios' ? 140 : 140,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.text.primary,
  },
  locationIcon: {
    marginTop: 4
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promoSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 12,
  },
  promoDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  promoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  promoText: {
    color: colors.primary,
    marginRight: 4,
  },
  removePromo: {
    marginLeft: 4,
  },
  noPromos: {
    padding: 16,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  paymentInfo: {
    backgroundColor: colors.background + '40',
    padding: 16,
    borderRadius: 8,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CheckoutScreen;
