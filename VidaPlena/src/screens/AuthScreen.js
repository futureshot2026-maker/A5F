import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError(t('errors.required_field'));
        setLoading(false);
        return;
      }

      // TODO: Implement Firebase authentication
      // Simulate login
      setTimeout(() => {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.logoSection}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.appName}>Vida Plena</Text>
        <Text style={styles.tagline}>Your path to wellness balance</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={styles.socialText}>Sign in with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialIcon}>🔵</Text>
          <Text style={styles.socialText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupSection}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupLink}>Create one</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError(t('errors.required_field'));
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // TODO: Implement Firebase authentication
      setTimeout(() => {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.logoSection}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.appName}>Create Account</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          editable={!loading}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF8',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backButton: {
    fontSize: 16,
    color: '#2D7A4A',
    fontWeight: '600',
    marginBottom: 16,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#5A6E63',
  },
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2D7A4A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E5DD',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 12,
  },
  socialButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2B1F',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#5A6E63',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7A4A',
  },
});
