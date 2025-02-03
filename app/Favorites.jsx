import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import RestaurantCard from '../Components/RestaurantCard';
import TopNav from '../Components/TopNav';
import authService from '../api/services/authService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { TouchableOpacity } from 'react-native';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const userData = await authService.fetchUser();
      if (userData && userData.favorites && userData.favorites.restaurants) {
        setFavorites(userData.favorites.restaurants);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleDetail = (restaurant) => {
    navigation.navigate("Details", { 
      restaurantId: restaurant.id, 
      isDineIn: true 
    });
  };


  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color={colors.text.secondary} />
      <Text style={[typography.h3, styles.emptyText]}>No favorites yet</Text>
      <Text style={[typography.bodyMedium, styles.emptySubtext]}>
        Your favorite restaurants will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TopNav title="Favorites" variant="solid" handleGoBack={handleGoBack} />
      </View>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : favorites.length > 0 ? (
          <View>
            {favorites.map(restaurant => (
               <TouchableOpacity  onPress={() => handleDetail(restaurant)} key={restaurant.id}>
              <RestaurantCard 
                key={restaurant.id}
                name={restaurant.name}
                address={restaurant.location}
                imageUrl={restaurant.image}
                isFavorite={true}
                isOpen={true}
                rating={0}
                promos={[]}
                style={styles.restaurantCard}

              />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          renderEmpty()
        )}
      </ScrollView>
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
    flexGrow: 1,
  },
  restaurantCard: {
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 100,
  },
  emptyText: {
    color: colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
});

export default Favorites;