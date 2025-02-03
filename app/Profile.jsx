import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TopNav from '../Components/TopNav';
import LargeButton from '../Components/Buttons/LargeButton';
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { useUserStore } from '../stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../styles/typography';
import authService from '../api/services/authService';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const user = useUserStore((state) => state.user);

    const fetchUserData = async () => {
        try {
            const userData = await authService.fetchUser();
            useUserStore.getState().setUser(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, []);

    useEffect(() => {
        if (route.params?.updatedUserData) {
            const updatedData = route.params.updatedUserData;
            useUserStore.getState().setUser(updatedData);
            Alert.alert('Success', 'Profile updated successfully');
            navigation.setParams({ updatedUserData: null, timestamp: null });
        }
    }, [route.params?.updatedUserData]);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        try {
                            await authService.logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Landing' }],
                            });
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile', { user });
    };

    const handleOpenURL = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open the link. Please try again later.');
            }
        } catch (error) {
            console.error('Error opening URL:', error);
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        }
    };

    const handleMenuItemPress = async (label) => {
        switch (label) {
            case 'Help / Contact Us':
                await handleOpenURL('https://www.dineease.ca/partners');
                break;
            case 'About':
                await handleOpenURL('https://www.dineease.ca/');
                break;
            case 'Partnership':
                await handleOpenURL('https://www.dineease.ca/partners');
                break;
            case 'Favorites':
                navigation.navigate('Favorites');
                break;
        }
    };

    const menuItems = [
        ...(user ? [{ icon: 'heart-outline', label: 'Favorites' }] : []),
        { icon: 'help-circle-outline', label: 'Help / Contact Us' },
        { icon: 'people-outline', label: 'Partnership' },
    ];

    const renderContent = () => {
        if (!user) {
            return (
                <View style={styles.signInContainer}>
                    <Text style={[typography.h3, styles.signInTitle]}>
                        Sign in to access your profile
                    </Text>
                    <Text style={[typography.bodyMedium, styles.signInSubtitle]}>
                        Get personalized recommendations and manage your account
                    </Text>
                    <LargeButton
                        title="Sign in / Sign up"
                        onPress={handleLogin}
                        style={styles.signInButton}
                    />
                </View>
            );
        }

        return (
            <>
                <View style={styles.profile}>
                    <View style={styles.profileInfo}>
                        <Text style={[typography.h3, styles.name]}>
                            {`${user?.first_name} ${user?.last_name}`}
                        </Text>
                        <Text style={[typography.bodyMedium, styles.email]}>
                            {user?.email}
                        </Text>
                        <Text style={[typography.bodyMedium, styles.phone]}>
                            {user?.profile?.phone}
                        </Text>
                        <Text style={[typography.bodyMedium, styles.address]}>
                            {`${user?.profile?.address}, ${user?.profile?.city}, ${user?.profile?.province}`}
                        </Text>
                        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                            <Text style={[typography.labelMedium, styles.editButtonText]}>
                                Edit profile
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    };

    return (
        <View style={styles.container}>
            <TopNav 
                title="Profile" 
                variant="solid"
                showBackButton={false}
            />
            
            <View style={styles.mainContent}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {renderContent()}

                    <View style={styles.menuSection}>
                        <Text style={[typography.bodyLarge, styles.sectionTitle]}>Menu</Text>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.menuItem}
                                onPress={() => handleMenuItemPress(item.label)}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={item.icon} size={24} color={colors.text.secondary} />
                                </View>
                                <Text style={[typography.bodyLarge, styles.menuItemLabel]}>
                                    {item.label}
                                </Text>
                                <Ionicons 
                                    name="chevron-forward" 
                                    size={24} 
                                    color={colors.text.secondary} 
                                    style={styles.chevron} 
                                />
                            </TouchableOpacity>
                        ))}

                        {user && (
                            <View style={styles.logoutSection}>
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={handleLogout}
                                >
                                    <View style={[styles.iconContainer, styles.logoutIcon]}>
                                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                                    </View>
                                    <Text style={[typography.bodyLarge, styles.logoutText]}>
                                        Logout
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    mainContent: {
        flex: 1,
        marginTop: 120,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    signInContainer: {
        paddingHorizontal: layout.spacing.md,
        paddingVertical: layout.spacing.xl,
        alignItems: 'center',
    },
    signInTitle: {
        color: colors.text.black,
        textAlign: 'center',
        marginBottom: 8,
    },
    signInSubtitle: {
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    signInButton: {
        width: '100%',
    },
    profile: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: layout.spacing.md,
    },
    profileInfo: {
        width: '100%',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        color: colors.text.black,
        textAlign: 'center',
    },
    email: {
        color: colors.text.secondary,
        textAlign: 'center',
    },
    phone: {
        color: colors.text.secondary,
        textAlign: 'center',
    },
    address: {
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: 4,
    },
    editButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.primary,
    },
    editButtonText: {
        color: colors.white,
    },
    menuSection: {
        paddingHorizontal: layout.spacing.md,
        marginBottom: 24,
    },
    sectionTitle: {
        color: colors.text.secondary,
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemLabel: {
        flex: 1,
        color: colors.text.black,
    },
    chevron: {
        marginLeft: 16,
    },
    logoutSection: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 8,
    },
    logoutIcon: {
        backgroundColor: colors.error + '10',
    },
    logoutText: {
        flex: 1,
        color: colors.error,
    },
});
