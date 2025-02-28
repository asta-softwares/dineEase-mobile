import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Platform, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TopNav from '../Components/TopNav';
import Footer from './Layout/Footer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import LargeButton from '../Components/Buttons/LargeButton';
import { restaurantService } from '../api/services/restaurantService';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../Components/Badge';
import { PaymentIcon } from 'react-native-payment-icons';

const getCardIcon = (brand) => {
  switch (brand?.toLowerCase()) {
    case 'visa':
      return 'visa';
    case 'mastercard':
      return 'master';
    case 'amex':
    case 'american-express':
      return 'american-express';
    case 'discover':
      return 'discover';
    case 'diners':
    case 'diners-club':
      return 'diners-club';
    case 'jcb':
      return 'jcb';
    case 'unionpay':
      return 'unionpay';
    default:
      return 'generic';
  }
};

const getOrderTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'dine_in':
      return 'restaurant-outline';
    case 'takeaway':
      return 'bag-handle-outline';
    case 'delivery':
      return 'bicycle-outline';
    default:
      return 'restaurant-outline';
  }
};

const OrderDetailScreen = ({ route, navigation }) => {
  const { order, restaurant, fromCheckout } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFromOrders = !fromCheckout;

  useFocusEffect(
    React.useCallback(() => {
      if (!isFromOrders) {
        const onBackPress = () => {
          return true; 
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };
      }
    }, [isFromOrders])
  );

  useEffect(() => {
    if (!isFromOrders) {
      navigation.setOptions({
        gestureEnabled: false
      });
    }
  }, [isFromOrders, navigation]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await restaurantService.getOrdersById(order.id);
        setOrderDetails(response);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order.id]);

  const OrderItem = ({ menu_item, quantity, subtotal }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
          {quantity}x {menu_item.name}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
          ${parseFloat(menu_item.cost).toFixed(2)} each
        </Text>
      </View>
      <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
        ${parseFloat(subtotal).toFixed(2)}
      </Text>
    </View>
  );

  const TotalRow = ({ label, value, isTotal, type }) => {
    if (type === 'status') {
      return (
        <View style={styles.totalRow}>
          <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
            {label} 
          </Text>
          <Badge 
            text={value?.charAt(0).toUpperCase() + value?.slice(1)}
            type={value?.toLowerCase()}
          />
        </View>
      );
    }

    if (type === 'payment_method') {
      return (
        <View style={styles.totalRow}>
          <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
            {label}
          </Text>
          <View style={styles.paymentMethod}>
            <PaymentIcon 
              type={getCardIcon(orderDetails?.payment.card_brand)}
              width={40}
              height={25}
            />
            <Text style={[typography.bodyMedium, { color: colors.text.black, marginLeft: 8 }]}>
              •••• {value}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.totalRow}>
        <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
          {label}
        </Text>
        {label === 'Discount' ? (
          <Text style={[typography.bodyMedium, { color: colors.success }]}>
            -${parseFloat(value || 0).toFixed(2)}
          </Text>
        ) : type === 'transaction' ? (
          <Text style={[typography.bodySmall, { color: colors.text.black }]}>
            {value}
          </Text>
        ) : type === 'date' ? (
          <Text style={[typography.bodyMedium, { color: colors.text.black }]}>
            {new Date(value).toLocaleString()}
          </Text>
        ) 
        : type === 'default' ? (
          <Text style={[typography.bodyMedium, { color: colors.text.black }]}>
            {value}
          </Text>
        )
        : (
          <Text style={[typography.bodyMedium, isTotal && { color: colors.text.primary }]}>
            ${parseFloat(value || 0).toFixed(2)}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav 
        handleGoBack={() => navigation.goBack()}
        title={`Order #${orderDetails?.id || ''}`}
        variant="solid"
        showBack={!fromCheckout}
      />
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Status Header */}
        <View style={styles.orderStatusHeader}>
          <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
            {new Date(orderDetails?.order_time).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          <Badge 
            text={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            type={order.status.toLowerCase()}
          />
        </View>

        {/* Restaurant Information */}
        <View style={styles.section}>
          <View style={styles.restaurantHeader}>
            <View style={styles.restaurantInfo}>
              <Text style={[typography.h3, { color: colors.text.black }]}>
                {restaurant?.name}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
                {restaurant?.location}
              </Text>
            </View>
            <Badge 
              text={orderDetails?.order_type?.replace('_', ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              type={orderDetails?.order_type === 'dine_in' ? 'pending' : 'confirmed'}
              icon={getOrderTypeIcon(orderDetails?.order_type)}
            />
          </View>
          
          {orderDetails?.verification_code && order.status.toLowerCase() !== 'completed' && (
            <View style={styles.verificationContainer}>
              <Text style={[typography.bodyMedium, { color: colors.text.secondary }]}>
                Verification Code
              </Text>
              <Text style={styles.verificationCode}>
                {orderDetails?.verification_code}
              </Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>Order Summary</Text>
          {orderDetails?.items.map((item, index) => (
            <OrderItem key={index} {...item} />
          ))}
          
          {/* Promos */}
          {orderDetails?.promos && orderDetails.promos.length > 0 && (
            <View style={styles.promosContainer}>
              {orderDetails.promos.map((promo) => (
                <View key={promo.id} style={styles.promoTag}>
                  <Text style={[typography.bodySmall, styles.promoText]}>
                    {promo.name} ({promo.discount_type === 'percentage' ? `${promo.discount}% off` : `$${promo.discount} off`})
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.divider} />
          <TotalRow label="Subtotal" value={orderDetails?.order_total} />
          {orderDetails?.discount > 0 && <TotalRow label="Discount" value={orderDetails.discount} />}
          {orderDetails?.tax_amount > 0 && <TotalRow label="Tax Amount" value={orderDetails.tax_amount} />}
          {orderDetails?.service_fee > 0 && <TotalRow label="Service Fee" value={orderDetails.service_fee} />}
          {orderDetails?.service_fee_tax > 0 && <TotalRow label="Service Fee Tax" value={orderDetails.service_fee_tax} />}
          <View style={styles.divider} />
          <TotalRow label="Total" value={orderDetails?.total} isTotal />
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>Payment Details</Text>
          <TotalRow label="Payment Status" value={orderDetails?.payment?.payment_status} type="status" />
          <TotalRow label="Payment Method" value={orderDetails?.payment?.card_last4} type="payment_method" />
          <TotalRow label="Payment Date" value={orderDetails?.payment?.payment_date} type="date" />
          <View style={styles.transactionIdContainer}>
            <Text style={[typography.bodySmall, { color: colors.text.primary, marginBottom: 4 }]}>
              Transaction ID
            </Text>
            <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
              {orderDetails?.payment?.transaction_id}
            </Text>
          </View>
        </View>
      </ScrollView>

      {!isFromOrders && (
        <Footer>
          <LargeButton
            title="Back to Home"
            onPress={() => navigation.navigate('Home')}
          />
        </Footer>
      )}
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
    paddingTop: Platform.OS === 'ios' ? 120 : 120,
    paddingBottom: 92,
  },
  section: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
   borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text.primary,
    marginBottom: 0,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 16,
  },
  verificationContainer: {
    marginTop: 16,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.light,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
   borderRadius: 12,
  },
  verificationCode: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans-Bold',
    color: colors.primary,
    letterSpacing: 2,
    marginTop: 8,
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    backgroundColor: colors.background.secondary,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
   borderRadius: 12,
  },
  promosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  promoTag: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderColor: colors.primary,
    borderWidth: 0.5,
  },
  promoText: {
    color: colors.primary,
  },
  transactionIdContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  orderStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderDetailScreen;
