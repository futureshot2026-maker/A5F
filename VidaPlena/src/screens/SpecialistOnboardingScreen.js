import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Picker,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const SpecialistOnboardingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'psychologist',
    bio: '',
    experience: '',
    pricePerSession: '',
    avatar: '👨‍⚕️',
    phone: '',
    availability: 'full-time',
  });
  const [error, setError] = useState('');

  const specialties = [
    { label: 'Psychologist', value: 'psychologist', icon: '🧠' },
    { label: 'Life Coach', value: 'life_coach', icon: '🎯' },
    { label: 'Nutritionist', value: 'nutritionist', icon: '🥗' },
    { label: 'Yoga Instructor', value: 'yoga_instructor', icon: '🧘' },
  ];

  const avatarOptions = ['👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '🧑‍⚕️', '👨‍💼', '👩‍💼'];

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError(t('errors.required_field'));
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    } else if (step === 2) {
      if (!formData.bio || !formData.experience) {
        setError(t('errors.required_field'));
        return;
      }
    } else if (step === 3) {
      if (!formData.pricePerSession) {
        setError('Please enter your session price');
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // TODO: Call Firebase to create specialist account
      // TODO: Save specialist profile to database

      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Welcome to Vida Plena!',
          'Your specialist profile has been created successfully. You can now accept bookings!',
          [
            {
              text: 'View Profile',
              onPress: () => navigation.navigate('SpecialistDashboard'),
            },
          ]
        );
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const currentSpecialty = specialties.find(s => s.value === formData.specialty);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((stepNum) => (
          <View key={stepNum} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                stepNum <= step && styles.progressDotActive,
              ]}
            >
              <Text style={styles.progressNumber}>{stepNum}</Text>
            </View>
            {stepNum < 4 && (
              <View
                style={[
                  styles.progressLine,
                  stepNum < step && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step 1: Account Details */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Create Your Account</Text>
          <Text style={styles.stepDescription}>
            Join Vida Plena and start helping people achieve wellness balance
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Dr. María García"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            editable={!loading}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="maria@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+34 600 123 456"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
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

          <Text style={styles.hint}>Minimum 8 characters</Text>
        </View>
      )}

      {/* Step 2: Professional Info */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Professional Information</Text>
          <Text style={styles.stepDescription}>
            Tell us about your expertise and experience
          </Text>

          <Text style={styles.label}>Specialty</Text>
          <View style={styles.pickerContainer}>
            {specialties.map((spec) => (
              <TouchableOpacity
                key={spec.value}
                style={[
                  styles.specialtyOption,
                  formData.specialty === spec.value && styles.specialtyOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, specialty: spec.value })}
              >
                <Text style={styles.specialtyIcon}>{spec.icon}</Text>
                <Text
                  style={[
                    styles.specialtyLabel,
                    formData.specialty === spec.value && styles.specialtyLabelSelected,
                  ]}
                >
                  {spec.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 10 years"
            value={formData.experience}
            onChangeText={(text) => setFormData({ ...formData, experience: text })}
            keyboardType="numeric"
            editable={!loading}
          />

          <Text style={styles.label}>Bio / About You</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about your approach and what makes you unique..."
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>
      )}

      {/* Step 3: Pricing & Availability */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Pricing & Availability</Text>
          <Text style={styles.stepDescription}>
            Set your session rates and work schedule
          </Text>

          <Text style={styles.label}>Price per Session (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="60"
            value={formData.pricePerSession}
            onChangeText={(text) => setFormData({ ...formData, pricePerSession: text })}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <Text style={styles.hint}>Recommended: €45-75 for your specialty</Text>

          <Text style={styles.label}>Work Schedule</Text>
          <View style={styles.optionRow}>
            {['part-time', 'full-time', 'flexible'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  formData.availability === option && styles.optionButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, availability: option })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.availability === option && styles.optionTextSelected,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Revenue Information</Text>
            <Text style={styles.infoText}>
              You'll receive 70% of session fees. Vida Plena takes 30% commission to cover payment processing and platform maintenance.
            </Text>
          </View>
        </View>
      )}

      {/* Step 4: Choose Avatar & Review */}
      {step === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Choose Your Avatar</Text>
          <Text style={styles.stepDescription}>
            Select an emoji to represent you in the marketplace
          </Text>

          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  formData.avatar === avatar && styles.avatarOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, avatar })}
              >
                <Text style={styles.avatarEmoji}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Review Your Profile</Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Name:</Text>
              <Text style={styles.reviewValue}>{formData.name}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Specialty:</Text>
              <Text style={styles.reviewValue}>{currentSpecialty?.label}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Experience:</Text>
              <Text style={styles.reviewValue}>{formData.experience}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Price/Session:</Text>
              <Text style={styles.reviewValue}>€{formData.pricePerSession}</Text>
            </View>
          </View>

          <View style={styles.legalBox}>
            <Text style={styles.legalText}>
              By registering, you agree to our Terms of Service and will follow our specialist code of conduct. All sessions are recorded with user consent for quality assurance.
            </Text>
          </View>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Navigation Buttons */}
      <View style={styles.buttonRow}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={step === 4 ? handleRegister : handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 4 ? 'Complete Registration' : 'Next'}
            </Text>
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E5DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#2D7A4A',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  progressLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E5DD',
    position: 'absolute',
    top: -30,
  },
  progressLineActive: {
    backgroundColor: '#2D7A4A',
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#5A6E63',
    marginBottom: 24,
    lineHeight: 20,
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
    color: '#1A2B1F',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  specialtyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  specialtyOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2D7A4A',
  },
  specialtyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  specialtyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6E63',
  },
  specialtyLabelSelected: {
    color: '#2D7A4A',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6E63',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E67E22',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#1A2B1F',
    lineHeight: 18,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  avatarOption: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E5DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    borderColor: '#2D7A4A',
    backgroundColor: '#E8F5E9',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E5DD',
  },
  reviewLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  legalBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  legalText: {
    fontSize: 12,
    color: '#1A2B1F',
    lineHeight: 18,
  },
  error: {
    color: '#E74C3C',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#E0E5DD',
  },
  nextButton: {
    backgroundColor: '#2D7A4A',
  },
  backButtonText: {
    color: '#1A2B1F',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
