import { supabase } from '@/services/supabase';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { validateLoginInput } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {
    if (loading) return;

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Regex / format validation
      validateLoginInput(email, password);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      // Email confirmation ON
      if (!data.session) {
        Alert.alert(
          'Account Created',
          'Please check your email to confirm your account.'
        );
        router.back(); // Go to Sign In
        return;
      }

      // Email confirmation OFF (auto-login)
      router.replace('/(notes)/task');

    } catch (err: any) {
      const errorMessage =
        err?.message || 'An unexpected error occurred';

      setError(errorMessage);
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );

      if (
        errorMessage.toLowerCase().includes('registered') ||
        errorMessage.toLowerCase().includes('exists')
      ) {
        Alert.alert(
          'Account Exists',
          'This email is already registered. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.back() },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="mb-10">
              <Text className="text-4xl font-bold text-gray-900 mb-2">
                Create Account
              </Text>
              <Text className="text-base text-gray-500">
                Sign up to get started
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                className="bg-gray-20 border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-gray-20 border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900 pr-12"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-gray-20 border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900 pr-12"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center mb-4 ${
                loading ? 'bg-gray-400' : 'bg-black'
              }`}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text className="text-black font-semibold text-sm">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
