import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const MySessionsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingSessions = [
    {
      id: '1',
      specialist: 'Dr. María García',
      specialty: 'Psychologist',
      avatar: '👩‍⚕️',
      date: new Date(Date.now() + 86400000 * 2),
      time: '14:00',
      duration: 60,
      price: 60,
      status: 'confirmed',
    },
    {
      id: '2',
      specialist: 'Luis Martínez',
      specialty: 'Life Coach',
      avatar: '👨‍🏫',
      date: new Date(Date.now() + 86400000 * 7),
      time: '16:00',
      duration: 45,
      price: 45,
      status: 'confirmed',
    },
  ];

  const pastSessions = [
    {
      id: '3',
      specialist: 'Ana López',
      specialty: 'Nutritionist',
      avatar: '👩‍⚕️',
      date: new Date(Date.now() - 86400000 * 10),
      time: '10:00',
      duration: 60,
      price: 50,
      status: 'completed',
      rating: 5,
    },
    {
      id: '4',
      specialist: 'Carlos Rodríguez',
      specialty: 'Yoga Instructor',
      avatar: '🧘',
      date: new Date(Date.now() - 86400000 * 3),
      time: '18:30',
      duration: 90,
      price: 60,
      status: 'completed',
      rating: 4,
    },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleCancel = (sessionId) => {
    Alert.alert(
      t('common.cancel'),
      t('common.cancelSessionConfirm'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: () => {
            Alert.alert(t('common.cancelled'), t('common.sessionCancelled'));
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleReschedule = (session) => {
    navigation.navigate('Booking', { specialist: session });
  };

  const handleRating = (sessionId) => {
    Alert.prompt(
      t('common.rateSessions'),
      t('common.rateSessionsMessage'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.submit'),
          onPress: (rating) => {
            Alert.alert(t('common.thankYou'), t('common.ratingSubmitted'));
          },
        },
      ],
      'numeric',
      '5'
    );
  };

  const renderSessionCard = (session, isPast) => (
    <View key={session.id} style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.specialistInfo}>
          <Text style={styles.specialistEmoji}>{session.avatar}</Text>
          <View style={styles.specialistDetails}>
            <Text style={styles.specialistName}>{session.specialist}</Text>
            <Text style={styles.specialistTitle}>{session.specialty}</Text>
          </View>
        </View>
        {session.status === 'completed' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ {t('common.completed')}</Text>
          </View>
        )}
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{formatDate(session.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>
            {session.time} · {session.duration} {t('common.minutes')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💶</Text>
          <Text style={styles.detailText}>€{session.price}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {!isPast ? (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReschedule(session)}
            >
              <Text style={styles.actionButtonText}>{t('common.reschedule')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(session.id)}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRating(session.id)}
            >
              <Text style={styles.actionButtonText}>
                ⭐ {t('common.rate')} ({session.rating}/5)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{t('common.receipt')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.bookings')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            {t('common.upcoming')} ({upcomingSessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}
          >
            {t('common.past')} ({pastSessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'upcoming' ? (
        <View>
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => renderSessionCard(session, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>{t('common.noSessions')}</Text>
              <Text style={styles.emptyText}>{t('common.bookASession')}</Text>
            </View>
          )}
        </View>
      ) : (
        <View>
          {pastSessions.length > 0 ? (
            pastSessions.map((session) => renderSessionCard(session, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>{t('common.noHistory')}</Text>
              <Text style={styles.emptyText}>{t('common.noSessionsYet')}</Text>
            </View>
          )}
        </View>
      )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E5DD',
  },
  tabActive: {
    borderBottomColor: '#2D7A4A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#2D7A4A',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  specialistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  specialistEmoji: {
    fontSize: 40,
  },
  specialistDetails: {
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  specialistTitle: {
    fontSize: 13,
    color: '#5A6E63',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4A',
  },
  sessionDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    fontSize: 16,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#5A6E63',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4A',
  },
  cancelButtonText: {
    color: '#E74C3C',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#5A6E63',
  },
});
