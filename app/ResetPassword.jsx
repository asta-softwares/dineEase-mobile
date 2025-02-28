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

export default function ResetPasswordScreen({ navigation, route }) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(route.params?.stage || 'code');
  
  const email = route.params?.email;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage === 'password') {
        setStage('code');
        return true;
      } else {
        navigation.goBack();
        return true;
      }
    });

    return () => backHandler.remove();
  }, [navigation, stage]);

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is missing. Please try again.');
      navigation.replace('ForgotPassword');
      return;
    }

    // Move to password reset stage
    setStage('password');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email, code, newPassword);
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully! You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('code')) {
        // If error is related to the code, go back to code stage
        setStage('code');
        Alert.alert(
          'Invalid Code',
          'The verification code is invalid or has expired. Please try again.'
        );
        return;
      }
      
      Alert.alert(
        'Reset Failed',
        error.message || 'An error occurred during password reset'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is missing. Please try again.');
      navigation.replace('ForgotPassword');
      return;
    }

    try {
      setLoading(true);
      await authService.resendResetCode(email);
      
      Alert.alert(
        'Code Sent',
        `A new verification code has been sent to ${email}`
      );
    } catch (error) {
      console.error('Resend code error:', error);
      
      Alert.alert(
        'Failed to Resend Code',
        error.message || 'An error occurred while sending a new code'
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
                onPress={() => {
                  if (stage === 'password') {
                    setStage('code');
                  } else {
                    navigation.goBack();
                  }
                }}
              >
                <Text style={[typography.labelMedium, { color: colors.text.primary }]}>
                  {stage === 'password' ? 'Back to Verification' : 'Back'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logo}
                />
                <Text style={[typography.h1, { color: colors.text.black }]}>
                  {stage === 'code' ? 'Verify Code' : 'Reset Password'}
                </Text>
              </View>

              <View style={styles.form}>
                {stage === 'code' ? (
                  <>
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

                    <TouchableOpacity 
                      style={styles.resendLink}
                      onPress={handleResendCode}
                      disabled={loading}
                    >
                      <Text style={[typography.labelMedium, { color: colors.text.primary }]}>
                        Didn't receive a code? Resend
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                      <LargeButton
                        title="Verify Code"
                        onPress={handleVerifyCode}
                        loading={loading}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.subtitle}>
                      Enter your new password
                    </Text>

                    <View style={styles.inputContainer}>
                      <CustomInput
                        placeholder="New password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        iconName="lock-closed-outline"
                        iconPosition="left"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <CustomInput
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        iconName="lock-closed-outline"
                        iconPosition="left"
                      />
                    </View>

                    <View style={styles.buttonContainer}>
                      <LargeButton
                        title="Reset Password"
                        onPress={handleResetPassword}
                        loading={loading}
                      />
                    </View>
                  </>
                )}
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
  resendLink: {
    alignSelf: 'center',
    marginBottom: 20,
  },
});
