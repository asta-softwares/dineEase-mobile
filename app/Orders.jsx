import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import TopNav from '../Components/TopNav';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { restaurantService } from '../api/services/restaurantService';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../Components/Badge';

const getStatusType = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'confirmed':
      return 'confirmed';
    case 'preparing':
      return 'preparing';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
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

const OrderCard = ({ order, onPress }) => {
  const formattedDate = new Date(order.order_time).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.contentContainer}>
        <View style={styles.backgroundIcon}>
          <Ionicons 
            name={getOrderTypeIcon(order.order_type)} 
            size={150} 
            color={colors.primary} 
            style={{ opacity: 0.10 }} 
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.orderHeader}>
            <Text style={[typography.labelLarge, styles.orderId]}>
              Order #{order.id}
            </Text>
            <Badge 
              text={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              type={getStatusType(order.status)}
            />
          </View>
          
          <Text style={[typography.h3, styles.restaurantName]}>
            {order.restaurant_details.name}
          </Text>
          
          <View style={styles.itemsList}>
            {order.items.map((item, index) => (
              <Text key={index} style={[typography.bodySmall, styles.description]}>
                {item.quantity}x {item.menu_item.name}
              </Text>
            )).slice(0, 2)}
            {order.items.length > 2 && (
              <Text style={[typography.bodySmall, styles.description]}>
                +{order.items.length - 2} more items
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[typography.bodyMedium, styles.price]}>
              ${parseFloat(order.total).toFixed(2)}
            </Text>
            <Text style={[typography.bodySmall, styles.date]}>
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = async (page = 1, shouldRefresh = false) => {
    try {
      setLoading(true);
      const response = await restaurantService.getOrders(page);
      
      if (shouldRefresh) {
        setOrders(response.results);
      } else {
        setOrders(prevOrders => [...prevOrders, ...response.results]);
      }
      
      setNextPage(response.next ? page + 1 : null);
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(1, true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore && nextPage) {
      fetchOrders(nextPage);
    }
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetailScreen', { 
      order: order,
      restaurant: order.restaurant_details
    });
  };

  useEffect(() => {
    fetchOrders(1, true);
  }, []);

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={colors.text.secondary} />
      <Text style={[typography.h3, styles.emptyText]}>No orders yet</Text>
      <Text style={[typography.bodyMedium, styles.emptySubtext]}>
        Your order history will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TopNav 
          title="My Orders" 
          variant="solid"
          showBackButton={false}
        />
      </View>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => handleOrderPress(item)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    backgroundColor: colors.background,
    zIndex: 10,
  },
  contentPadding: {
    paddingTop: Platform.OS === 'ios' ? 120 : 120,
    padding: 16,
    paddingBottom: 32,
  },
  menuItem: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 0,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: colors.white,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundIcon: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    zIndex: 0,
  },
  textContainer: {
    flex: 1,
    zIndex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: colors.text.white,
    textTransform: 'capitalize',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  restaurantName: {
    color: colors.text.black,
    marginBottom: 8,
  },
  description: {
    color: colors.text.secondary,
    marginBottom: 4,
  },
  itemsList: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: colors.primary,
    fontWeight: '600',
  },
  date: {
    color: colors.text.secondary,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    color: colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.text.secondary,
    marginTop: 8,
  },
});

export default OrdersScreen;
