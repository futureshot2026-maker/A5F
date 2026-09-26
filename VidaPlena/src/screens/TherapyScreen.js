import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const TherapyScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const specialists = [
    {
      id: 1,
      name: 'Dr. Maria García',
      specialty: 'psychologist',
      rating: 4.9,
      reviews: 284,
      price: 60,
      image: '👩‍⚕️',
      experience: '10 years',
      availability: 'Available Today',
      bio: 'Specializing in stress management and anxiety'
    },
    {
      id: 2,
      name: 'Carlos López',
      specialty: 'life_coach',
      rating: 4.8,
      reviews: 156,
      price: 50,
      image: '👨‍💼',
      experience: '8 years',
      availability: 'Tomorrow',
      bio: 'Life coach for work-life balance'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      specialty: 'nutritionist',
      rating: 4.7,
      reviews: 98,
      price: 45,
      image: '👩‍⚕️',
      experience: '6 years',
      availability: 'Available Today',
      bio: 'Nutrition expert for healthy living'
    },
    {
      id: 4,
      name: 'Juan Fernández',
      specialty: 'yoga_instructor',
      rating: 4.9,
      reviews: 312,
      price: 35,
      image: '👨‍🏫',
      experience: '12 years',
      availability: 'Available Today',
      bio: 'Yoga and mindfulness instructor'
    },
  ];

  const specialties = [
    { id: 'all', label: t('therapy.all_specialists'), icon: '👥' },
    { id: 'psychologist', label: t('therapy.psychologist'), icon: '🧠' },
    { id: 'life_coach', label: t('therapy.life_coach'), icon: '🎯' },
    { id: 'nutritionist', label: t('therapy.nutritionist'), icon: '🥗' },
    { id: 'yoga_instructor', label: t('therapy.yoga_instructor'), icon: '🧘' },
  ];

  const filteredSpecialists = specialists.filter(specialist => {
    const matchesSpecialty = selectedSpecialty === 'all' || specialist.specialty === selectedSpecialty;
    const matchesSearch = specialist.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const SpecialistCard = ({ specialist }) => (
    <TouchableOpacity
      style={styles.specialistCard}
      onPress={() => navigation.navigate('SpecialistDetail', { specialist })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.avatar}>{specialist.image}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.specialistName}>{specialist.name}</Text>
          <Text style={styles.specialistBio}>{specialist.bio}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {specialist.rating}</Text>
            <Text style={styles.reviews}>({specialist.reviews} reviews)</Text>
            <Text style={styles.experience}>• {specialist.experience}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.availability}>
            🟢 {specialist.availability}
          </Text>
          <Text style={styles.price}>
            €{specialist.price} {t('therapy.per_session')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { specialist })}
        >
          <Text style={styles.bookButtonText}>{t('therapy.book_now')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('therapy.title')}</Text>
        <Text style={styles.subtitle}>{t('therapy.subtitle')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Specialty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtyScroll}
        contentContainerStyle={styles.specialtyContent}
      >
        {specialties.map(specialty => (
          <TouchableOpacity
            key={specialty.id}
            style={[
              styles.specialtyTag,
              selectedSpecialty === specialty.id && styles.specialtyTagActive
            ]}
            onPress={() => setSelectedSpecialty(specialty.id)}
          >
            <Text style={styles.specialtyIcon}>{specialty.icon}</Text>
            <Text style={[
              styles.specialtyLabel,
              selectedSpecialty === specialty.id && styles.specialtyLabelActive
            ]}>
              {specialty.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Specialists List */}
      <FlatList
        data={filteredSpecialists}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <SpecialistCard specialist={item} />}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6E63',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    fontSize: 14,
  },
  searchIcon: {
    position: 'absolute',
    right: 28,
    top: 12,
    fontSize: 18,
  },
  specialtyScroll: {
    marginBottom: 16,
  },
  specialtyContent: {
    paddingHorizontal: 16,
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  specialtyTagActive: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  specialtyIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  specialtyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5A6E63',
  },
  specialtyLabelActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  specialistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 44,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B1F',
    marginBottom: 4,
  },
  specialistBio: {
    fontSize: 12,
    color: '#5A6E63',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4A',
    marginRight: 4,
  },
  reviews: {
    fontSize: 11,
    color: '#999',
    marginRight: 8,
  },
  experience: {
    fontSize: 11,
    color: '#999',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E5DD',
    paddingTop: 12,
  },
  availability: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2D7A4A',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  bookButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
