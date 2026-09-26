import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const BookingScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const specialist = route?.params?.specialist;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');

  const durations = [30, 60, 90];
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const calculatePrice = () => {
    if (!specialist) return 0;
    return (specialist.pricePerSession * sessionDuration) / 60;
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert(t('errors.required_field'));
      return;
    }

    navigation.navigate('Payment', {
      specialist,
      date: selectedDate,
      time: selectedTime,
      duration: sessionDuration,
      notes,
      totalPrice: calculatePrice(),
    });
  };

  if (!specialist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Specialist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← {t('common.back')}</Text>
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <Text style={styles.title}>{t('common.booking')}</Text>
      </View>

      <View style={styles.specialistCard}>
        <Text style={styles.specialistEmoji}>{specialist.avatar}</Text>
        <Text style={styles.specialistName}>{specialist.name}</Text>
        <Text style={styles.specialistTitle}>{specialist.specialty}</Text>
        <View style={styles.ratingRow}>
          <Text>⭐ {specialist.rating}</Text>
          <Text style={styles.reviewsText}>({specialist.reviews} {t('common.reviews')})</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.date')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.datesScroll}
        >
          {getAvailableDates().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate?.toDateString() === date.toDateString() &&
                  styles.dateButtonSelected,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedDate?.toDateString() === date.toDateString() &&
                    styles.dateButtonTextSelected,
                ]}
              >
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.time')}</Text>
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeButton,
                selectedTime === time && styles.timeButtonSelected,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  selectedTime === time && styles.timeButtonTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.duration')}</Text>
        <View style={styles.durationRow}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                sessionDuration === duration && styles.durationButtonSelected,
              ]}
              onPress={() => setSessionDuration(duration)}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  sessionDuration === duration && styles.durationButtonTextSelected,
                ]}
              >
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.notes')}</Text>
        <TextInput
          style={styles.notesInput}
          placeholder={t('common.optional')}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>{t('common.total')}</Text>
        <Text style={styles.priceAmount}>€{calculatePrice().toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBooking}
      >
        <Text style={styles.bookButtonText}>{t('common.continuePayment')}</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBF8',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  specialistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  specialistEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  specialistName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 4,
  },
  specialistTitle: {
    fontSize: 14,
    color: '#5A6E63',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B1F',
    marginBottom: 12,
  },
  datesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  dateButtonSelected: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  dateButtonText: {
    fontSize: 12,
    color: '#1A2B1F',
    fontWeight: '500',
  },
  dateButtonTextSelected: {
    color: '#FFFFFF',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    width: '48%',
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#1A2B1F',
    fontWeight: '600',
  },
  timeButtonTextSelected: {
    color: '#FFFFFF',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  durationButtonSelected: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#1A2B1F',
    fontWeight: '600',
  },
  durationButtonTextSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A2B1F',
    textAlignVertical: 'top',
  },
  priceSection: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7A4A',
  },
  bookButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
