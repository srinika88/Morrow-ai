import {
  UserProfile,
  DailyCheckIn,
  SymptomEntry,
  Medication,
  MedicationLog,
  EnergyEntry,
  ActivityLog,
  HealthInsight,
  CommunityPost,
  NotificationItem,
  ChatMessage
} from '../types/index.js';

export const api = {
  // Overview
  async getOverview() {
    const res = await fetch('/api/overview');
    if (!res.ok) throw new Error('Failed to load overview');
    return res.json();
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Check-ins
  async getCheckIns(): Promise<DailyCheckIn[]> {
    const res = await fetch('/api/checkins');
    if (!res.ok) throw new Error('Failed to load check-ins');
    return res.json();
  },

  async submitCheckIn(data: Omit<DailyCheckIn, 'id'>): Promise<DailyCheckIn> {
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit check-in');
    return res.json();
  },

  // Symptoms
  async getSymptoms(): Promise<SymptomEntry[]> {
    const res = await fetch('/api/symptoms');
    if (!res.ok) throw new Error('Failed to load symptoms');
    return res.json();
  },

  async addSymptom(data: Omit<SymptomEntry, 'id'>): Promise<SymptomEntry> {
    const res = await fetch('/api/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add symptom');
    return res.json();
  },

  async deleteSymptom(id: string): Promise<void> {
    const res = await fetch(`/api/symptoms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete symptom');
  },

  // Medications
  async getMedications(): Promise<Medication[]> {
    const res = await fetch('/api/medications');
    if (!res.ok) throw new Error('Failed to load medications');
    return res.json();
  },

  async addMedication(data: Omit<Medication, 'id'>): Promise<Medication> {
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add medication');
    return res.json();
  },

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const res = await fetch(`/api/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update medication');
    return res.json();
  },

  async deleteMedication(id: string): Promise<void> {
    const res = await fetch(`/api/medications/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete medication');
  },

  async getMedicationLogs(date?: string): Promise<MedicationLog[]> {
    const url = date ? `/api/medications/logs?date=${date}` : '/api/medications/logs';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load medication logs');
    return res.json();
  },

  async logMedicationDose(data: Omit<MedicationLog, 'id'>): Promise<MedicationLog> {
    const res = await fetch('/api/medications/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log dose');
    return res.json();
  },

  // Energy & Activities
  async getEnergyEntries(): Promise<EnergyEntry[]> {
    const res = await fetch('/api/energy');
    if (!res.ok) throw new Error('Failed to load energy entries');
    return res.json();
  },

  async addEnergyEntry(data: Omit<EnergyEntry, 'id'>): Promise<EnergyEntry> {
    const res = await fetch('/api/energy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record energy');
    return res.json();
  },

  async getActivities(): Promise<ActivityLog[]> {
    const res = await fetch('/api/activities');
    if (!res.ok) throw new Error('Failed to load activities');
    return res.json();
  },

  async addActivity(data: Omit<ActivityLog, 'id'>): Promise<ActivityLog> {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log activity');
    return res.json();
  },

  // Insights
  async getInsights(): Promise<HealthInsight[]> {
    const res = await fetch('/api/insights');
    if (!res.ok) throw new Error('Failed to load insights');
    return res.json();
  },

  // Community
  async getCommunityPosts(): Promise<CommunityPost[]> {
    const res = await fetch('/api/community');
    if (!res.ok) throw new Error('Failed to load community posts');
    return res.json();
  },

  async createCommunityPost(data: {
    title: string;
    body: string;
    category: any;
    authorName: string;
    isAnonymous: boolean;
    tags: string[];
  }): Promise<CommunityPost> {
    const res = await fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async reactToPost(id: string, type: 'heart' | 'relate' | 'hug'): Promise<CommunityPost> {
    const res = await fetch(`/api/community/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if (!res.ok) throw new Error('Failed to react');
    return res.json();
  },

  async commentOnPost(id: string, content: string, isAnonymous: boolean): Promise<CommunityPost> {
    const res = await fetch(`/api/community/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, isAnonymous })
    });
    if (!res.ok) throw new Error('Failed to comment');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', { method: 'PUT' });
  },

  // Chat
  async getChatHistory(): Promise<ChatMessage[]> {
    const res = await fetch('/api/chat/history');
    if (!res.ok) throw new Error('Failed to load chat history');
    return res.json();
  },

  async sendMessage(message: string): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    safetyDisclaimer?: string;
    isEmergencyAlert?: boolean;
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async clearChat(): Promise<void> {
    await fetch('/api/chat/clear', { method: 'POST' });
  },

  // Reports
  async generateReport(params: { startDate?: string; endDate?: string; sections?: string[] }) {
    const res = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  // Data reset & export
  async resetData(): Promise<void> {
    const res = await fetch('/api/data/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset data');
  }
};
