export type MoodType = 'great' | 'calm' | 'so-so' | 'low' | 'struggling';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  pronouns: string;
  age: number;
  conditions: string[];
  goals: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences: {
    notificationsEnabled: boolean;
    medicationReminders: boolean;
    checkInReminderTime: string; // "09:00"
    aiMemoryEnabled: boolean;
    anonymousPostingDefault: boolean;
  };
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  overallFeeling: string; // e.g. "Mild flare-up with brain fog"
  mood: MoodType;
  energyLevel: number; // 1-10
  painLevel: number; // 0-10
  sleepHours: number;
  sleepQuality: number; // 1-5
  notableSymptoms: string[];
  notes?: string;
}

export interface SymptomEntry {
  id: string;
  name: string;
  severity: number; // 1-10
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  location: string;
  frequency: 'isolated' | 'recurring' | 'constant' | 'intermittent';
  triggers: string[];
  associatedActivities: string[];
  notes?: string;
  loggedVia: 'manual' | 'ai_chat';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'Once daily' | 'Twice daily' | 'Three times daily' | 'As needed' | 'Weekly';
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  timeOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'Bedtime')[];
  instructions: string; // "Take with breakfast", "Take before sleep"
  startDate: string;
  endDate?: string;
  purpose: string;
  colorTag: string; // e.g. "#DCD5F2"
  active: boolean;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string;
  status: 'taken' | 'skipped';
  takenAt?: string;
  skipReason?: string;
  perceivedEffectiveness?: number; // 1-5
  sideEffects?: string[];
}

export interface EnergyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  level: number; // 1-10
  context: 'morning_waking' | 'midday' | 'evening' | 'post_activity' | 'rest';
  notes?: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  category: 'cognitive' | 'physical' | 'emotional' | 'social' | 'rest';
  durationMinutes: number;
  date: string;
  time: string;
  energyBefore: number; // 1-10
  energyAfter: number; // 1-10
  recoveryTimeMinutes: number;
  notes?: string;
}

export interface HealthInsight {
  id: string;
  title: string;
  category: 'sleep_symptom' | 'activity_fatigue' | 'triggers' | 'medication' | 'routine';
  observation: string;
  detailedAnalysis: string;
  periodDescription: string;
  occurrencesCount: number;
  confidence: 'high' | 'moderate' | 'emerging';
  supportingData: {
    label: string;
    value: string;
    dates: string[];
  }[];
  actionableSuggestion?: string;
  nonClinicalNote: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  category: 'Chronic illness' | 'Chronic pain' | 'Autoimmune health' | 'Digestive health' | 'Fatigue' | 'Undiagnosed symptoms' | 'Everyday wellbeing';
  authorName: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  createdAt: string;
  reactions: {
    heart: number;
    relate: number;
    hug: number;
  };
  userReaction?: 'heart' | 'relate' | 'hug';
  saved?: boolean;
  comments: CommunityComment[];
  tags: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'checkin' | 'pacing' | 'insight' | 'community';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'log_symptom' | 'log_energy' | 'log_medication' | 'view_insight';
    label: string;
    data: any;
  };
}
