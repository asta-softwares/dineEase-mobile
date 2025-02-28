import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StatusBar,
  BackHandler,
  KeyboardAvoidingView, 
  ScrollView, 
  Platform
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import LargeButton from '../Components/Buttons/LargeButton';
import CustomInput from '../Components/CustomInput';
import authService from '../api/services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleFindAccount = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.findAccount(email);
      
      // Navigate to reset password screen with the email
      navigation.navigate('ResetPassword', { 
        email: response.email,
        stage: 'code' // Initial stage is entering the verification code
      });
      
    } catch (error) {
      console.error('Find account error:', error);
      
      Alert.alert(
        'Account Not Found',
        error.message || 'We could not find an account with that email address.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        animated={true}
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={[typography.labelMedium, { color: colors.text.primary }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logo}
                />
                <Text style={[typography.h1, { color: colors.text.black }]}>
                  Forgot Password
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a verification code to reset your password.
                </Text>

                <View style={styles.inputContainer}>
                  <CustomInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    iconName="mail-outline"
                    iconPosition="left"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <LargeButton
                    title="Continue"
                    onPress={handleFindAccount}
                    loading={loading}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});
