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
import { useUserStore } from '../stores/userStore';

export default function VerifyEmailScreen({ navigation, route }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const email = route.params?.email;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevents default back action
    });

    return () => backHandler.remove();
  }, []);

  const handleVerifyEmail = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is missing. Please try again from the login screen.');
      navigation.replace('Login');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyEmail(email, code);
      
      Alert.alert(
        'Success',
        'Email verified successfully! You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Verification error:', error);
      console.log('Error details:', {
        status: error?.response?.status,
        message: error?.message,
        detail: error?.response?.data?.detail
      });

      if (error?.response?.data?.detail) {
        Alert.alert(
          'Verification Failed',
          error.response.data.detail
        );
        return;
      }

      if (error?.response?.status === 401) {
        Alert.alert(
          'Invalid Code',
          'The verification code is invalid or has expired.'
        );
        return;
      }
      
      Alert.alert(
        'Verification Failed',
        error?.message || 'An error occurred during verification'
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
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logo}
                />
               <Text style={[typography.h1, { color: colors.text.black }]}>
                 Verify Email
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Please enter the verification code sent to {email}
                </Text>

                <View style={styles.inputContainer}>
                  <CustomInput
                    placeholder="Enter verification code"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <LargeButton
                    title="Verify Email"
                    onPress={handleVerifyEmail}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  logoText: {
    width: 150,
    height: 30,
    resizeMode: 'contain',
    marginTop: 10,
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
