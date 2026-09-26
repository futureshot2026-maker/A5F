import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [stressLevel, setStressLevel] = useState(45);
  const [wellnessScore, setWellnessScore] = useState(72);

  const StatCard = ({ icon, label, value, unit = '' }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}{unit}</Text>
    </View>
  );

  const ActionButton = ({ icon, label, onPress, color = '#2D7A4A' }) => (
    <TouchableOpacity
      style={[styles.actionButton, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('dashboard.title')}</Text>
        <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="😰"
          label={t('dashboard.stress_level')}
          value={stressLevel}
          unit="%"
        />
        <StatCard
          icon="⭐"
          label={t('dashboard.wellness_score')}
          value={wellnessScore}
          unit="%"
        />
        <StatCard
          icon="👨‍👩‍👧"
          label={t('dashboard.family_time')}
          value="2h"
        />
        <StatCard
          icon="😴"
          label="Sleep Quality"
          value="7.5h"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ActionButton
          icon="🧘"
          label={t('dashboard.today_meditation')}
          onPress={() => console.log('Start meditation')}
        />
        <ActionButton
          icon="⏱️"
          label={t('dashboard.quick_rest')}
          onPress={() => console.log('Start quick rest')}
          color="#D4A574"
        />
        <ActionButton
          icon="💧"
          label={t('dashboard.water_reminder')}
          onPress={() => console.log('Log water intake')}
          color="#6B7BA8"
        />
      </View>

      {/* Wellness Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Today's Wellness Tip</Text>
        <Text style={styles.tipText}>
          Take 5 minutes to breathe deeply and reconnect with your family. Small moments create big impacts!
        </Text>
      </View>

      {/* Call to Action */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Therapy')}
      >
        <Text style={styles.primaryButtonText}>Book a Therapy Session</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF8',
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#5A6E63',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#5A6E63',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D7A4A',
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
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2B1F',
  },
  tipCard: {
    backgroundColor: '#E8F5ED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2D7A4A',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7A4A',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#2D7A4A',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
