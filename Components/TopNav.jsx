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

const TopNav = ({ 
  handleGoBack, 
  title = "The Flavorful Fork", 
  scrollY, 
  variant = 'transparent', 
  showBackButton = true, 
  showBack = true 
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
                        <View style={styles.placeholder} />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const defaultScrollY = useSharedValue(0);
    const animValue = scrollY || defaultScrollY;

    const containerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animValue.value,
                [0, 100],
                ['transparent', colors.background]
            ),
            borderBottomColor: interpolateColor(
                animValue.value,
                [0, 100],
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
                [0, 100],
                [colors.text.white, colors.text.black]
            ),
        };
    });

    const titleStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                animValue.value,
                [0, 100],
                [0, 1]
            ),
            color: colors.text.black,
        };
    });

    const backButtonStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animValue.value,
                [0, 100],
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
                    <View style={styles.placeholder} />
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
    },
    safeArea: {
        backgroundColor: 'transparent',
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: layout.spacing.md,
        paddingBottom: 16,
    },
    backButton: {
        borderRadius: 8,
    },
    backButtonTouchable: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        color: colors.text.black,
    },
    placeholder: {
        width: 40,
    }
});