import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import RestaurantCard from '../Components/RestaurantCard';
import { restaurantService } from '../api/services/restaurantService';

export default function SearchScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const isDineIn = route.params?.isDineIn;
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async (text, page = 1) => {
    setSearchQuery(text);
    if (text.length > 0) {
      try {
        setLoading(true);
        const serviceType = isDineIn ? 'dine-in' : 'takeout';
        const response = await restaurantService.searchRestaurants({
          serviceType,
          query: text
        }, page);

        if (page === 1) {
          setRestaurants(response?.results || []);
        } else {
          setRestaurants(prev => [...prev, ...(response?.results || [])]);
        }
        
        setNextPage(response?.next);
        setHasMore(!!response?.next);
      } catch (error) {
        console.error('Error searching restaurants:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setRestaurants([]);
      setNextPage(null);
      setHasMore(true);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading || !searchQuery) return;
    
    try {
      const nextPageNumber = nextPage ? parseInt(new URL(nextPage).searchParams.get('page')) : null;
      if (nextPageNumber) {
        await handleSearch(searchQuery, nextPageNumber);
      }
    } catch (error) {
      console.error('Error loading more restaurants:', error);
    }
  };

  const handleDetail = (restaurant) => {
    navigation.navigate("Details", { 
      restaurantId: restaurant.id, 
      isDineIn: isDineIn 
    });
  };

  useEffect(() => {
    // Focus the TextInput when screen mounts
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  }, []);

  const textInputRef = React.useRef(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.black} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.searchInput}
            placeholder="Restaurant, Cuisine, Location..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={(text) => handleSearch(text, 1)}
            autoFocus={true}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => handleSearch('', 1)}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={20} color={colors.text.secondary} />
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      >
        {loading && restaurants.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : restaurants.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {restaurants.length} results found
            </Text>
            {restaurants.map((restaurant) => (
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
                />
              </TouchableOpacity>
            ))}
            {loading && (
              <ActivityIndicator 
                size="small" 
                color={colors.primary} 
                style={styles.loadingMore} 
              />
            )}
          </View>
        ) : searchQuery ? (
          <Text style={styles.noResults}>No restaurants found</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.md,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    marginRight: layout.spacing.sm,
    padding: layout.spacing.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: layout.card.borderRadius,
    paddingHorizontal: layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: layout.spacing.sm,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.text.primary,
  },
  clearButton: {
    padding: layout.spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: layout.spacing.md,
  },
  loader: {
    marginTop: layout.spacing.xl,
  },
  loadingMore: {
    marginVertical: layout.spacing.md,
  },
  resultsContainer: {
    paddingHorizontal: layout.spacing.md,
  },
  resultsText: {
    ...typography.h3,
    marginBottom: layout.spacing.md,
    color: colors.text.primary,
  },
  restaurantCardWrapper: {
    marginBottom: layout.spacing.md,
  },
  noResults: {
    ...typography.h3,
    textAlign: 'center',
    marginTop: layout.spacing.xl,
    color: colors.text.secondary,
  },
});
