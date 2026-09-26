import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const SpecialistDashboardScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const specialistData = {
    name: 'Dr. María García',
    specialty: 'Psychologist',
    rating: 4.9,
    reviews: 284,
    avatar: '👩‍⚕️',
  };

  const stats = {
    totalSessions: 127,
    thisMonth: 12,
    earnings: {
      thisMonth: 2520,
      total: 28000,
    },
    rating: 4.9,
  };

  const upcomingSessions = [
    {
      id: '1',
      clientName: 'Juan Pérez',
      clientAvatar: '👨‍💼',
      date: new Date(Date.now() + 86400000),
      time: '14:00',
      duration: 60,
      amount: 42,
    },
    {
      id: '2',
      clientName: 'María López',
      clientAvatar: '👩‍💻',
      date: new Date(Date.now() + 172800000),
      time: '16:00',
      duration: 60,
      amount: 42,
    },
  ];

  const earnings = [
    {
      id: '1',
      clientName: 'Ana García',
      date: new Date(Date.now() - 86400000 * 3),
      amount: 42,
      status: 'paid',
    },
    {
      id: '2',
      clientName: 'Carlos Rodríguez',
      date: new Date(Date.now() - 86400000 * 5),
      amount: 42,
      status: 'paid',
    },
    {
      id: '3',
      clientName: 'Isabel Martínez',
      date: new Date(Date.now() - 86400000 * 7),
      amount: 63,
      status: 'paid',
    },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Profile */}
      <View style={styles.profileCard}>
        <Text style={styles.profileAvatar}>{specialistData.avatar}</Text>
        <Text style={styles.profileName}>{specialistData.name}</Text>
        <Text style={styles.profileSpec}>{specialistData.specialty}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {specialistData.rating}</Text>
          <Text style={styles.reviews}>({specialistData.reviews} reviews)</Text>
        </View>
      </View>

      {/* Key Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💶</Text>
          <Text style={styles.statValue}>€{stats.earnings.thisMonth}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'overview' && styles.tabTextActive,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'bookings' && styles.tabTextActive,
            ]}
          >
            Bookings ({upcomingSessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.tabActive]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'earnings' && styles.tabTextActive,
            ]}
          >
            Earnings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Sessions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>

            {upcomingSessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.clientAvatar}>{session.clientAvatar}</Text>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.clientName}>{session.clientName}</Text>
                    <Text style={styles.sessionTime}>
                      {formatDate(session.date)} at {session.time}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join 🎥</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance This Month</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartBar}>
                <Text style={styles.chartLabel}>Sessions</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: '80%' }]} />
                </View>
                <Text style={styles.chartValue}>{stats.thisMonth}/15</Text>
              </View>
              <View style={styles.chartBar}>
                <Text style={styles.chartLabel}>Earnings</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: '60%' }]} />
                </View>
                <Text style={styles.chartValue}>€{stats.earnings.thisMonth}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📝</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Edit Profile</Text>
                <Text style={styles.actionDesc}>Update bio, pricing, availability</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>⏰</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Manage Schedule</Text>
                <Text style={styles.actionDesc}>Set your working hours</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View Analytics</Text>
                <Text style={styles.actionDesc}>Detailed performance metrics</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <View style={styles.section}>
          {upcomingSessions.map((session) => (
            <View key={session.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.clientAvatar}>{session.clientAvatar}</Text>
                <View style={styles.bookingInfo}>
                  <Text style={styles.clientName}>{session.clientName}</Text>
                  <Text style={styles.bookingTime}>
                    {formatDate(session.date)} at {session.time} · {session.duration}m
                  </Text>
                </View>
              </View>

              <View style={styles.bookingActions}>
                <TouchableOpacity style={styles.primaryAction}>
                  <Text style={styles.actionText}>Join Video Call 🎥</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryAction}>
                  <Text style={styles.secondaryActionText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <View>
          <View style={styles.earningsHeader}>
            <View>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
              <Text style={styles.earningsAmount}>€{stats.earnings.total}</Text>
            </View>
            <View>
              <Text style={styles.earningsLabel}>This Month</Text>
              <Text style={styles.earningsAmountMonth}>€{stats.earnings.thisMonth}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            {earnings.map((earning) => (
              <View key={earning.id} style={styles.earningCard}>
                <View style={styles.earningLeft}>
                  <Text style={styles.earningIcon}>✓</Text>
                  <View style={styles.earningInfo}>
                    <Text style={styles.earningClient}>{earning.clientName}</Text>
                    <Text style={styles.earningDate}>
                      {formatDate(earning.date)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.earningAmount}>+€{earning.amount}</Text>
              </View>
            ))}
          </View>

          <View style={styles.payoutSection}>
            <Text style={styles.sectionTitle}>Payout Settings</Text>
            <TouchableOpacity style={styles.payoutCard}>
              <Text style={styles.payoutIcon}>💳</Text>
              <View style={styles.payoutContent}>
                <Text style={styles.payoutTitle}>Bank Account</Text>
                <Text style={styles.payoutDesc}>**** **** **** 1234</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.payoutCard}>
              <Text style={styles.payoutIcon}>📅</Text>
              <View style={styles.payoutContent}>
                <Text style={styles.payoutTitle}>Payout Schedule</Text>
                <Text style={styles.payoutDesc}>Monthly on the 5th</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  profileAvatar: {
    fontSize: 56,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 4,
  },
  profileSpec: {
    fontSize: 14,
    color: '#5A6E63',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7A4A',
  },
  reviews: {
    fontSize: 12,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  tabActive: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6E63',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4A',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  clientAvatar: {
    fontSize: 32,
  },
  sessionInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  sessionTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  chartBar: {
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2B1F',
    marginBottom: 6,
  },
  bar: {
    height: 8,
    backgroundColor: '#E0E5DD',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#2D7A4A',
  },
  chartValue: {
    fontSize: 12,
    color: '#999',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  actionDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#2D7A4A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryAction: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  secondaryActionText: {
    color: '#2D7A4A',
    fontSize: 12,
    fontWeight: '600',
  },
  earningsHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4A',
  },
  earningsAmountMonth: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  earningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  earningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  earningIcon: {
    fontSize: 20,
    color: '#2D7A4A',
  },
  earningInfo: {
    flex: 1,
  },
  earningClient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  earningDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  earningAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D7A4A',
  },
  payoutSection: {
    marginBottom: 24,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  payoutIcon: {
    fontSize: 24,
  },
  payoutContent: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  payoutDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
