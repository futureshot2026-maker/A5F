import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  const currentUser = {
    name: 'User Profile',
    email: 'user@example.com',
    joinDate: 'January 2024',
    completedSessions: 12,
    avatar: '👤',
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const healthGoals = [
    { id: '1', name: 'Stress Management', icon: '🧘' },
    { id: '2', name: 'Better Sleep', icon: '😴' },
    { id: '3', name: 'Work-Life Balance', icon: '⚖️' },
    { id: '4', name: 'Physical Health', icon: '💪' },
    { id: '5', name: 'Mental Health', icon: '🧠' },
    { id: '6', name: 'Nutrition', icon: '🥗' },
  ];

  const [selectedGoals, setSelectedGoals] = useState(['1', '3']);

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleChangeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    Alert.alert(t('common.languageChanged'), `Language changed to ${languageCode}`);
  };

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      t('common.confirmLogout'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          onPress: () => {
            // TODO: Logout and navigate to auth screen
            Alert.alert(t('common.success'), t('common.loggedOut'));
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('common.deleteAccount'),
      t('common.deleteAccountWarning'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          onPress: () => {
            Alert.alert(t('common.accountDeleted'), t('common.accountDeletedMessage'));
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.profile')}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileAvatar}>{currentUser.avatar}</Text>
        <Text style={styles.profileName}>{currentUser.name}</Text>
        <Text style={styles.profileEmail}>{currentUser.email}</Text>
        <Text style={styles.profileJoinDate}>
          {t('common.memberSince')} {currentUser.joinDate}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.completedSessions}</Text>
            <Text style={styles.statLabel}>{t('common.sessions')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>{t('common.hours')}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>{t('common.editProfile')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.healthGoals')}</Text>
        <View style={styles.goalsGrid}>
          {healthGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.goalCardSelected,
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text
                style={[
                  styles.goalName,
                  selectedGoals.includes(goal.id) && styles.goalNameSelected,
                ]}
              >
                {goal.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.language')}</Text>
        <View style={styles.languageContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                i18n.language === lang.code && styles.languageButtonActive,
              ]}
              onPress={() => handleChangeLanguage(lang.code)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  i18n.language === lang.code && styles.languageNameActive,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.notifications')}</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>{t('common.pushNotifications')}</Text>
            <Text style={styles.settingDescription}>{t('common.getReminders')}</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E0E5DD', true: '#B8E6C9' }}
            thumbColor={notifications ? '#2D7A4A' : '#999'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>{t('common.emailNotifications')}</Text>
            <Text style={styles.settingDescription}>{t('common.receiveEmailUpdates')}</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#E0E5DD', true: '#B8E6C9' }}
            thumbColor={emailNotifications ? '#2D7A4A' : '#999'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>{t('common.privateProfile')}</Text>
            <Text style={styles.settingDescription}>{t('common.hideProfilePublic')}</Text>
          </View>
          <Switch
            value={privateProfile}
            onValueChange={setPrivateProfile}
            trackColor={{ false: '#E0E5DD', true: '#B8E6C9' }}
            thumbColor={privateProfile ? '#2D7A4A' : '#999'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.support')}</Text>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportIcon}>❓</Text>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>{t('common.faq')}</Text>
            <Text style={styles.supportDesc}>Common questions and answers</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportIcon}>📧</Text>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>{t('common.contactSupport')}</Text>
            <Text style={styles.supportDesc}>Get help from our team</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportIcon}>📋</Text>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>{t('common.privacyPolicy')}</Text>
            <Text style={styles.supportDesc}>Our privacy commitment</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportIcon}>⚖️</Text>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>{t('common.termsOfService')}</Text>
            <Text style={styles.supportDesc}>Terms and conditions</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <Text style={styles.dangerButtonText}>🚪 {t('common.logout')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.dangerButtonText, styles.deleteButtonText]}>
            🗑️ {t('common.deleteAccount')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Vida Plena v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          {t('common.built')} ❤️ {t('common.forWellness')}
        </Text>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
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
  profileEmail: {
    fontSize: 14,
    color: '#5A6E63',
    marginBottom: 4,
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7A4A',
  },
  statLabel: {
    fontSize: 12,
    color: '#5A6E63',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E5DD',
  },
  editButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: '#2D7A4A',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 12,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  goalCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2D7A4A',
  },
  goalIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  goalName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A6E63',
    textAlign: 'center',
  },
  goalNameSelected: {
    color: '#2D7A4A',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  languageButtonActive: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6E63',
  },
  languageNameActive: {
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E5DD',
  },
  supportItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  supportIcon: {
    fontSize: 24,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2B1F',
  },
  supportDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  dangerButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  dangerButtonText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#E74C3C',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
