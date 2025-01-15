import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const RestaurantInfo = ({ route, navigation }) => {
  const { restaurant } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={[typography.h3, styles.title]}>Restaurant Info</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {restaurant?.description && (
            <View style={styles.section}>
              <Text style={[typography.h3, styles.sectionTitle]}>About</Text>
              <Text style={[typography.bodyLarge, styles.description]}>
                {restaurant.description}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[typography.h3, styles.sectionTitle]}>Details</Text>
            <View style={styles.infoContainer}>
              {restaurant?.categories?.length > 0 && (
                <View style={styles.infoItem}>
                  <Ionicons name="restaurant-outline" size={16} color={colors.text.black} style={styles.infoIcon} />
                  <Text style={[typography.bodyLarge, styles.infoText]}>
                    {restaurant.categories.map(cat => cat.name).join(', ')}
                  </Text>
                </View>
              )}

              {restaurant?.location && (
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color={colors.text.primary} style={styles.infoIcon} />
                  <Text style={[typography.bodyLarge, styles.infoText]}>
                    {restaurant.location}
                  </Text>
                </View>
              )}

              {restaurant?.operating_hours && Object.keys(restaurant.operating_hours).length > 0 && (
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color={colors.text.primary} style={styles.infoIcon} />
                  <View style={styles.hoursContainer}>
                    {Object.entries(restaurant.operating_hours).map(([day, hours], index) => (
                      <View key={day} style={styles.hourRow}>
                        <Text style={[typography.bodyLarge, styles.dayText]}>{day}</Text>
                        <Text style={[typography.bodyLarge, styles.hoursText]}>{hours}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {restaurant?.telephone && (
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={16} color={colors.text.primary} style={styles.infoIcon} />
                  <Text style={[typography.bodyLarge, styles.infoText]}>
                    {restaurant.telephone}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text.black,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text.black,
    marginBottom: 16,
  },
  description: {
    color: colors.text.black,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 24,
    width: '100%',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: colors.text.black,
  },
  hoursContainer: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    color: colors.text.black,
    width: 100,
  },
  hoursText: {
    color: colors.text.black,
    flex: 1,
  },
});

export default RestaurantInfo;
