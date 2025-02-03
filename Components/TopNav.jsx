import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, Text, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
    useAnimatedStyle,
    interpolateColor,
    interpolate,
    withTiming,
    useSharedValue,
} from 'react-native-reanimated';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import React from 'react';
import { useUserStore } from '../stores/userStore';

const TopNav = ({ 
  handleGoBack, 
  title = "The Flavorful Fork", 
  scrollY, 
  variant = 'transparent', 
  showBackButton = true, 
  showBack = true,
  showActionButtons,
  onInfoPress,
  isFavorite,
  onFavoritePress,
}) => {
    if (variant === 'solid') {
        return (
            <View style={[
                styles.topNavContainer, 
                { 
                    backgroundColor: colors.background,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }
            ]}>
                <SafeAreaView edges={['top']} style={styles.safeArea}>
                    <View style={styles.topNav}>
                        {showBackButton && showBack ? (
                            <TouchableOpacity 
                                style={[styles.backButton, { backgroundColor: colors.background.secondary }]} 
                                onPress={handleGoBack}
                            >
                                <Ionicons name="arrow-back" size={24} color={colors.text.black} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.placeholder} />
                        )}
                        <View style={styles.titleContainer}>
                            <Text style={[typography.h3, styles.title]}>
                                {title}
                            </Text>
                        </View>
                        {showActionButtons ? (
                            <View style={styles.actionButtonsContainer}>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.actionButtonsTouchable} onPress={onInfoPress}>
                                        <Ionicons name="information-circle-outline" size={24} color={colors.text.black} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.actionButtonsTouchable} onPress={onFavoritePress}>
                                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.placeholder} />
                        )}
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const user = useUserStore(state => state.user);

    const defaultScrollY = useSharedValue(0);
    const animValue = scrollY || defaultScrollY;

    const containerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animValue.value,
                [150, 180],
                ['transparent', colors.background]
            ),
            borderBottomColor: interpolateColor(
                animValue.value,
                [150, 180],
                ['transparent', colors.border]
            ),
            borderBottomWidth: 1,
        };
    });

    const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

    const iconStyle = useAnimatedStyle(() => {
        return {
            color: interpolateColor(
                animValue.value,
                [150, 180],
                [colors.text.white, colors.text.black]
            ),
        };
    });

    const titleStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                animValue.value,
                [150, 180],
                [0, 1]
            ),
            color: colors.text.black,
        };
    });

    const backButtonStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animValue.value,
                [150, 180],
                ['rgba(0,0,0,0.5)', 'transparent']
            ),
        };
    });

    const actionButtonsStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animValue.value,
                [150, 180],
                ['rgba(0,0,0,0.5)', 'transparent']
            ),
        };
    });

    return (
        <Animated.View style={[styles.topNavContainer, containerStyle]}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.topNav}>
                    {showBackButton && showBack ? (
                        <Animated.View style={[styles.backButton, backButtonStyle]}>
                            <TouchableOpacity style={styles.backButtonTouchable} onPress={handleGoBack}>
                                <AnimatedIcon 
                                    name="arrow-back" 
                                    size={24} 
                                    style={iconStyle}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                    <Animated.View style={[styles.titleContainer, titleStyle]}>
                        <Animated.Text style={[typography.h3, styles.title]}>
                            {title}
                        </Animated.Text>
                    </Animated.View>
                    {showActionButtons && (
                        <View style={styles.actionButtonsContainer}>
                            {/* {user && (
                                <Animated.View style={[styles.actionButtons, actionButtonsStyle]}>
                                    <TouchableOpacity style={styles.actionButtonsTouchable} onPress={onFavoritePress}>
                                        <AnimatedIcon 
                                            name={isFavorite ? "heart" : "heart-outline"} 
                                            size={24} 
                                            style={isFavorite ? { color: colors.error } : iconStyle}
                                        />
                                    </TouchableOpacity>
                                </Animated.View>
                            )} */}
                            <Animated.View style={[styles.actionButtons, actionButtonsStyle]}>
                                <TouchableOpacity style={styles.actionButtonsTouchable} onPress={onInfoPress}>
                                    <AnimatedIcon 
                                        name="information-circle-outline" 
                                        size={24} 
                                        style={iconStyle}
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Animated.View>
    );
}

export default TopNav;

const styles = StyleSheet.create({
    topNavContainer: {
        position: "absolute",
        top: -2,
        left: 0,
        right: 0,
        zIndex: 1,
        paddingTop:  Platform.OS === 'ios' ? 0 : 16,
    },
    safeArea: {
        backgroundColor: 'transparent',
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: layout.spacing.md,
        paddingVertical: 8,
        height: 56,
    },
    backButton: {
        borderRadius: 8,
    },
    backButtonTouchable: {
        padding: 8,
    },
    actionButtons: {
        borderRadius: 8,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionButtonsTouchable: {
        padding: 8,
        borderRadius: 8,
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: -1,
        height: '100%',
        justifyContent: 'center',
    },
    title: {
        color: colors.text.black,
    },
    placeholder: {
        width: 40,
    }
});