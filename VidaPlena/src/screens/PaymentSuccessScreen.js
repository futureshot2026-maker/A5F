import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const PaymentSuccessScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { bookingDetails } = route?.params || {};
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.successContainer}>
        <Animated.Text
          style={[
            styles.successIcon,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          ✅
        </Animated.Text>
        <Text style={styles.successTitle}>{t('payment.success')}</Text>
        <Text style={styles.successMessage}>Your session has been booked successfully</Text>
      </View>

      {bookingDetails && (
        <>
          <View style={styles.bookingDetails}>
            <Text style={styles.detailsTitle}>Booking Confirmation</Text>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Specialist</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailEmoji}>{bookingDetails.specialist?.avatar}</Text>
                <Text style={styles.detailValue}>{bookingDetails.specialist?.name}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(bookingDetails.date)} at {bookingDetails.time}
              </Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Session Duration</Text>
              <Text style={styles.detailValue}>{bookingDetails.duration} minutes</Text>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValueHighlight}>
                €{bookingDetails.totalPrice?.toFixed(2)}
              </Text>
            </View>

            {bookingDetails.notes && (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Your Notes</Text>
                <Text style={styles.detailValue}>{bookingDetails.notes}</Text>
              </View>
            )}
          </View>

          <View style={styles.confirmationCode}>
            <Text style={styles.confirmationLabel}>Confirmation Number</Text>
            <Text style={styles.confirmationNumber}>
              {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </Text>
          </View>

          <View style={styles.nextSteps}>
            <Text style={styles.nextStepsTitle}>What's Next?</Text>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>You will receive a confirmation email</Text>
                <Text style={styles.stepDescription}>
                  Check your inbox for session details and video call link
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add to your calendar</Text>
                <Text style={styles.stepDescription}>
                  Session scheduled for {formatDate(bookingDetails.date)} at {bookingDetails.time}
                </Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Join 5 minutes early</Text>
                <Text style={styles.stepDescription}>
                  The video call will be available 5 minutes before your session
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.supportBox}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>
              If you have any questions, contact our support team at support@vidaplena.es
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Go to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewSessionButton}>
        <Text style={styles.viewSessionButtonText}>View My Sessions</Text>
      </TouchableOpacity>
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
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D7A4A',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#5A6E63',
    textAlign: 'center',
  },
  bookingDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 16,
  },
  detailCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E5DD',
  },
  detailCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E5DD',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailEmoji: {
    fontSize: 32,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  detailValueHighlight: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7A4A',
  },
  confirmationCode: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6E63',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  confirmationNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4A',
    letterSpacing: 2,
  },
  nextSteps: {
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#2D7A4A',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#5A6E63',
    lineHeight: 18,
  },
  supportBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E67E22',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 13,
    color: '#1A2B1F',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewSessionButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D7A4A',
  },
  viewSessionButtonText: {
    color: '#2D7A4A',
    fontSize: 16,
    fontWeight: '600',
  },
});
