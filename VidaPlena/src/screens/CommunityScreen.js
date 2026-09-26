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

export const CommunityScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('groups');

  const supportGroups = [
    {
      id: '1',
      name: 'Work-Life Balance',
      description: 'Para personas que buscan mejorar su equilibrio vida-trabajo',
      members: 234,
      icon: '⚖️',
      color: '#E8F5E9',
    },
    {
      id: '2',
      name: 'Stress Management',
      description: 'Técnicas y estrategias para manejar el estrés diario',
      members: 156,
      icon: '🧘',
      color: '#F3E5F5',
    },
    {
      id: '3',
      name: 'Health & Fitness',
      description: 'Comunidad enfocada en salud física y bienestar',
      members: 412,
      icon: '💪',
      color: '#E3F2FD',
    },
    {
      id: '4',
      name: 'Mental Health',
      description: 'Soporte en salud mental y bienestar emocional',
      members: 289,
      icon: '🧠',
      color: '#FFF3E0',
    },
  ];

  const weeklyChallenges = [
    {
      id: '1',
      title: '7-Day Meditation Challenge',
      description: 'Medita 10 minutos cada día durante una semana',
      participants: 145,
      daysLeft: 3,
      progress: 70,
      icon: '🧘‍♀️',
    },
    {
      id: '2',
      title: 'Water Intake Challenge',
      description: 'Bebe 8 vasos de agua diariamente',
      participants: 89,
      daysLeft: 5,
      progress: 40,
      icon: '💧',
    },
    {
      id: '3',
      title: 'Digital Detox',
      description: 'Menos tiempo en redes sociales, más tiempo en familia',
      participants: 72,
      daysLeft: 1,
      progress: 95,
      icon: '📱',
    },
  ];

  const discussions = [
    {
      id: '1',
      title: 'Tips for productive mornings',
      author: 'María García',
      replies: 24,
      likes: 156,
      timestamp: '2h',
    },
    {
      id: '2',
      title: 'Best relaxation techniques?',
      author: 'Carlos López',
      replies: 18,
      likes: 89,
      timestamp: '4h',
    },
    {
      id: '3',
      title: 'How to maintain work-life balance in remote work',
      author: 'Ana Martínez',
      replies: 42,
      likes: 234,
      timestamp: '1d',
    },
  ];

  const renderGroupCard = (group) => (
    <TouchableOpacity
      key={group.id}
      style={[styles.groupCard, { borderLeftColor: group.color }]}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupIcon}>{group.icon}</Text>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupMembers}>{group.members} members</Text>
        </View>
      </View>
      <Text style={styles.groupDescription}>{group.description}</Text>
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>{t('common.join')}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderChallenge = (challenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeIcon}>{challenge.icon}</Text>
        <View style={styles.challengeTitle}>
          <Text style={styles.challengeName}>{challenge.title}</Text>
          <Text style={styles.challengeParticipants}>
            {challenge.participants} joining
          </Text>
        </View>
        <Text style={styles.daysLeft}>{challenge.daysLeft}d</Text>
      </View>
      <Text style={styles.challengeDescription}>{challenge.description}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${challenge.progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{challenge.progress}%</Text>
      </View>
      <TouchableOpacity style={styles.participateButton}>
        <Text style={styles.participateButtonText}>{t('common.join')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDiscussion = (discussion) => (
    <TouchableOpacity key={discussion.id} style={styles.discussionCard}>
      <Text style={styles.discussionTitle}>{discussion.title}</Text>
      <Text style={styles.discussionAuthor}>by {discussion.author}</Text>
      <View style={styles.discussionStats}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statText}>{discussion.replies}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statText}>{discussion.likes}</Text>
        </View>
        <Text style={styles.discussionTime}>{discussion.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.community')}</Text>
        <Text style={styles.subtitle}>{t('common.connectWellness')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'groups' && styles.tabTextActive,
            ]}
          >
            {t('common.groups')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'challenges' && styles.tabTextActive,
            ]}
          >
            {t('common.challenges')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discuss' && styles.tabActive]}
          onPress={() => setActiveTab('discuss')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'discuss' && styles.tabTextActive,
            ]}
          >
            {t('common.discussions')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'groups' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('common.supportGroups')}</Text>
          </View>
          {supportGroups.map((group) => renderGroupCard(group))}
        </View>
      )}

      {activeTab === 'challenges' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('common.currentChallenges')}</Text>
          </View>
          {weeklyChallenges.map((challenge) => renderChallenge(challenge))}
        </View>
      )}

      {activeTab === 'discuss' && (
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('common.recentDiscussions')}</Text>
          </View>
          {discussions.map((discussion) => renderDiscussion(discussion))}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#5A6E63',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  tabActive: {
    backgroundColor: '#2D7A4A',
    borderColor: '#2D7A4A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6E63',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  groupIcon: {
    fontSize: 32,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
    color: '#999',
  },
  groupDescription: {
    fontSize: 13,
    color: '#5A6E63',
    marginBottom: 12,
    lineHeight: 18,
  },
  joinButton: {
    backgroundColor: '#2D7A4A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  challengeIcon: {
    fontSize: 28,
  },
  challengeTitle: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2B1F',
  },
  challengeParticipants: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  daysLeft: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D7A4A',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  challengeDescription: {
    fontSize: 13,
    color: '#5A6E63',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E5DD',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D7A4A',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4A',
  },
  participateButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  participateButtonText: {
    color: '#2D7A4A',
    fontSize: 13,
    fontWeight: '600',
  },
  discussionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E5DD',
  },
  discussionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2B1F',
    marginBottom: 6,
  },
  discussionAuthor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  discussionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A6E63',
  },
  discussionTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
});
