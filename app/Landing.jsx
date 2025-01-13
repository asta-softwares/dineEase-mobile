import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import LargeButton from '../Components/Buttons/LargeButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Landing() {
  const navigation = useNavigation();

  const handleLoginSignup = () => {
    navigation.navigate('Login');
  };
  const handleBrowse = () => {
    navigation.navigate('Main');
  };

  return (
    <ImageBackground 
      source={require('../assets/landing-bg.png')} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo-splashscreen.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[typography.titleLarge, styles.headerText]}>Click,</Text>
            <Text style={[typography.titleLarge, styles.headerText]}>Crave,</Text>
            <Text style={[typography.titleLarge, styles.headerText]}>Enjoy</Text>
          </View>
          
          <View style={styles.actionContainer}>
            <LargeButton
              title="Login / Signup"
              color={colors.white}
              textColor={colors.text.primary}
              onPress={handleLoginSignup}
            />  
            
            <Text style={[typography.labelMedium, styles.orText]}>Or</Text>

            <TouchableOpacity onPress={handleBrowse}>
              <Text style={[typography.buttonLarge, styles.browseText]}>Browse Selections</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: height * 0.02,
    marginBottom: height * 0.04,
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    color: colors.text.white,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontSize: Math.min(width * 0.15, 56),
    lineHeight: Math.min(width * 0.18, 72),
    fontWeight: '600',
  },
  logo: {
    width: Math.min(width * 0.45, 200),
    height: Math.min(height * 0.09, 80),
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: height * 0.05,
    marginTop: height * 0.04,
  },
  orText: {
    color: colors.text.white,
    marginVertical: height * 0.015,
  },
  browseText: {
    color: colors.text.white,
  },
});
