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

export const PaymentScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const {
    specialist,
    date,
    time,
    duration,
    notes,
    totalPrice,
  } = route?.params || {};

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted.slice(0, 19));
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const validatePayment = () => {
    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length !== 16) {
      setError(t('errors.invalid_card'));
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      setError(t('errors.invalid_expiry'));
      return false;
    }
    if (!cvv || cvv.length !== 3) {
      setError(t('errors.invalid_cvv'));
      return false;
    }
    if (!cardName) {
      setError(t('errors.required_field'));
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError('');
    if (!validatePayment()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with Stripe
      // const { error: stripeError } = await stripe.createPaymentMethod({...})

      setTimeout(() => {
        setLoading(false);
        navigation.navigate('PaymentSuccess', {
          bookingDetails: {
            specialist,
            date,
            time,
            duration,
            notes,
            totalPrice,
          },
        });
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDateDisplay = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← {t('common.back')}</Text>
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <Text style={styles.title}>{t('common.payment')}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{t('common.bookingSummary')}</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('common.specialist')}:</Text>
          <Text style={styles.summaryValue}>{specialist?.name}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('common.date')}:</Text>
          <Text style={styles.summaryValue}>{formatDateDisplay(date)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('common.time')}:</Text>
          <Text style={styles.summaryValue}>{time}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('common.duration')}:</Text>
          <Text style={styles.summaryValue}>{duration} {t('common.minutes')}</Text>
        </View>

        {notes && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('common.notes')}:</Text>
            <Text style={[styles.summaryValue, { flex: 1 }]}>{notes}</Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>{t('common.total')}:</Text>
          <Text style={styles.summaryValueBold}>€{totalPrice?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.cardDetails')}</Text>

        <Text style={styles.label}>{t('common.cardName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('common.fullName')}
          placeholderTextColor="#999"
          value={cardName}
          onChangeText={setCardName}
          editable={!loading}
        />

        <Text style={styles.label}>{t('common.cardNumber')}</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#999"
          value={cardNumber}
          onChangeText={formatCardNumber}
          keyboardType="numeric"
          maxLength={19}
          editable={!loading}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>{t('common.expiry')}</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#999"
              value={expiryDate}
              onChangeText={formatExpiry}
              keyboardType="numeric"
              maxLength={5}
              editable={!loading}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#999"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔒 {t('common.secure')}</Text>
        <Text style={styles.infoText}>
          {t('common.securePaymentInfo')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.payButtonText}>
            {t('common.pay')} €{totalPrice?.toFixed(2)}
          </Text>
        )}
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  backButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#2D7A4A',
    fontWeight: '600',
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#5A6E63',
    fontWeight: '500',
  },
  summaryLabelBold: {
    fontSize: 14,
    color: '#1A2B1F',
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A2B1F',
    fontWeight: '600',
    textAlign: 'right',
  },
  summaryValueBold: {
    fontSize: 16,
    color: '#2D7A4A',
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E5DD',
    marginVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B1F',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
    marginBottom: 8,
    marginTop: 12,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  error: {
    color: '#E74C3C',
    fontSize: 14,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D7A4A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1A2B1F',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
