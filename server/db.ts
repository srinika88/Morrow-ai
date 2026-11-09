import fs from 'fs';
import path from 'path';
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
} from '../src/types/index.js';

interface DatabaseData {
  profile: UserProfile;
  checkIns: DailyCheckIn[];
  symptoms: SymptomEntry[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  energyEntries: EnergyEntry[];
  activities: ActivityLog[];
  insights: HealthInsight[];
  communityPosts: CommunityPost[];
  notifications: NotificationItem[];
  chatHistory: ChatMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'morrow_data.json');

function generateInitialSeed(): DatabaseData {
  const today = new Date().toISOString().split('T')[0];

  const profile: UserProfile = {
    id: 'user_elena_1',
    name: 'Elena Vance',
    email: 'elena.vance@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    pronouns: 'she/her',
    age: 32,
    conditions: ['Vestibular Migraine', 'Fibromyalgia', 'Dysautonomia (POTS)'],
    goals: [
      'Identify afternoon migraine triggers & screen exposure patterns',
      'Maintain energy baseline with 25-minute pacing intervals',
      'Track sleep restorativeness and morning muscle stiffness'
    ],
    allergies: ['Penicillin', 'Sulfa antibiotics', 'Synthetic fragrances (sensory trigger)'],
    emergencyContact: {
      name: 'Julian Vance',
      relationship: 'Partner',
      phone: '+1 (555) 234-8901'
    },
    preferences: {
      notificationsEnabled: true,
      medicationReminders: true,
      checkInReminderTime: '08:30',
      aiMemoryEnabled: true,
      anonymousPostingDefault: false
    }
  };

  const medications: Medication[] = [
    {
      id: 'med_1',
      name: 'Amitriptyline',
      dosage: '25 mg',
      frequency: 'Once daily',
      scheduleTimes: ['21:00'],
      timeOfDay: ['Bedtime'],
      instructions: 'Take 1 hour before sleep with water',
      startDate: '2026-08-15',
      purpose: 'Migraine prophylaxis & neuropathic pain modulation',
      colorTag: '#DCD5F2',
      active: true,
      notes: 'Prescribed by Dr. Aris. Helps with slow-wave sleep depth.'
    },
    {
      id: 'med_2',
      name: 'Magnesium Glycinate',
      dosage: '400 mg',
      frequency: 'Once daily',
      scheduleTimes: ['21:30'],
      timeOfDay: ['Bedtime'],
      instructions: 'Take with evening snack or herbal tea',
      startDate: '2026-09-01',
      purpose: 'Muscle relaxation & migraine threshold support',
      colorTag: '#DCE7D8',
      active: true,
      notes: 'Chelated form gentle on digestion'
    },
    {
      id: 'med_3',
      name: 'CoQ10 (Ubiquinol)',
      dosage: '200 mg',
      frequency: 'Once daily',
      scheduleTimes: ['08:30'],
      timeOfDay: ['Morning'],
      instructions: 'Take with breakfast containing healthy fats',
      startDate: '2026-09-10',
      purpose: 'Cellular mitochondrial energy support',
      colorTag: '#F5E8A8',
      active: true
    },
    {
      id: 'med_4',
      name: 'Electrolyte Hydration Complex',
      dosage: '1 Packet in 750ml water',
      frequency: 'Twice daily',
      scheduleTimes: ['09:00', '14:00'],
      timeOfDay: ['Morning', 'Afternoon'],
      instructions: 'Sip steadily to support intravascular volume for POTS',
      startDate: '2026-07-20',
      purpose: 'Dysautonomia blood pressure stability',
      colorTag: '#EEE9F7',
      active: true
    },
    {
      id: 'med_5',
      name: 'Sumatriptan (Imitrex)',
      dosage: '50 mg',
      frequency: 'As needed',
      scheduleTimes: ['12:00'],
      timeOfDay: ['Afternoon'],
      instructions: 'Take at earliest onset of aura or throbbing pain',
      startDate: '2026-08-01',
      purpose: 'Acute migraine abortive',
      colorTag: '#574665',
      active: true,
      notes: 'Limit to max 2 doses per week to prevent medication overuse headache'
    }
  ];

  // Seed last 14 days of check-ins and logs
  const checkIns: DailyCheckIn[] = [];
  const symptoms: SymptomEntry[] = [];
  const medicationLogs: MedicationLog[] = [];
  const energyEntries: EnergyEntry[] = [];
  const activities: ActivityLog[] = [];

  const baseDate = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulating realistic pattern: days with short sleep correlate with higher pain & lower energy
    const isShortSleep = i === 12 || i === 9 || i === 8 || i === 5 || i === 2;
    const sleepHours = isShortSleep ? 5.2 + (i % 3) * 0.4 : 7.8 + (i % 2) * 0.4;
    const sleepQuality = isShortSleep ? 2 : 4;
    const energyLevel = isShortSleep ? 3 + (i % 2) : 7;
    const painLevel = isShortSleep ? 6 + (i % 2) : 2;

    const moodVal = isShortSleep ? (i % 2 === 0 ? 'struggling' : 'low') : (i % 3 === 0 ? 'great' : 'calm');

    checkIns.push({
      id: `checkin_${dateStr}`,
      date: dateStr,
      timestamp: `${dateStr}T08:45:00Z`,
      overallFeeling: isShortSleep
        ? 'Woke up with heavy temple throbbing and cervical stiffness.'
        : 'Rested well. Gentle energy reserves feeling balanced today.',
      mood: moodVal as any,
      energyLevel,
      painLevel,
      sleepHours: Number(sleepHours.toFixed(1)),
      sleepQuality,
      notableSymptoms: isShortSleep
        ? ['Vestibular Migraine', 'Brain Fog', 'Neck Tension']
        : ['Mild Fatigue']
    });

    // Energy entries
    energyEntries.push(
      {
        id: `energy_${dateStr}_am`,
        date: dateStr,
        time: '08:30',
        level: energyLevel,
        context: 'morning_waking',
        notes: isShortSleep ? 'Unrefreshing sleep, delayed morning wake' : 'Woke up naturally'
      },
      {
        id: `energy_${dateStr}_pm`,
        date: dateStr,
        time: '14:30',
        level: Math.max(1, energyLevel - (isShortSleep ? 2 : 1)),
        context: 'midday',
        notes: 'Midday pacing evaluation'
      }
    );

    // Symptoms on flare days
    if (isShortSleep) {
      symptoms.push({
        id: `sym_${dateStr}_1`,
        name: 'Vestibular Migraine',
        severity: 7,
        date: dateStr,
        time: '11:15',
        durationMinutes: 180,
        location: 'Right temple & behind right eye',
        frequency: 'recurring',
        triggers: ['Sleep deprivation (<6h)', 'Fluorescent screen flicker', 'Skipped breakfast'],
        associatedActivities: ['Prolonged desk spreadsheet work', 'Virtual meetings'],
        notes: 'Pulsing throbbing accompanied by mild room spin and photophobia.',
        loggedVia: i === 2 ? 'ai_chat' : 'manual'
      });

      symptoms.push({
        id: `sym_${dateStr}_2`,
        name: 'Brain Fog & Cognitive Lag',
        severity: 5,
        date: dateStr,
        time: '14:00',
        durationMinutes: 240,
        location: 'Diffuse frontal head',
        frequency: 'intermittent',
        triggers: ['Mental exertion', 'Post-migraine exhaustion'],
        associatedActivities: ['Email triage'],
        notes: 'Difficulty finding words and sustaining focus.',
        loggedVia: 'manual'
      });
    } else if (i % 3 === 0) {
      symptoms.push({
        id: `sym_${dateStr}_3`,
        name: 'Trapezius & Neck Stiffness',
        severity: 3,
        date: dateStr,
        time: '16:00',
        durationMinutes: 90,
        location: 'Upper back and cervical spine',
        frequency: 'intermittent',
        triggers: ['Static sitting posture'],
        associatedActivities: ['Laptop work'],
        notes: 'Relieved after 10m heating pad and gentle neck rotation.',
        loggedVia: 'manual'
      });
    }

    // Medication logs
    medicationLogs.push(
      {
        id: `medlog_${dateStr}_1`,
        medicationId: 'med_1',
        medicationName: 'Amitriptyline',
        dosage: '25 mg',
        date: dateStr,
        scheduledTime: '21:00',
        status: 'taken',
        takenAt: `${dateStr}T21:05:00Z`,
        perceivedEffectiveness: 4
      },
      {
        id: `medlog_${dateStr}_2`,
        medicationId: 'med_2',
        medicationName: 'Magnesium Glycinate',
        dosage: '400 mg',
        date: dateStr,
        scheduledTime: '21:30',
        status: 'taken',
        takenAt: `${dateStr}T21:35:00Z`,
        perceivedEffectiveness: 5
      },
      {
        id: `medlog_${dateStr}_3`,
        medicationId: 'med_3',
        medicationName: 'CoQ10 (Ubiquinol)',
        dosage: '200 mg',
        date: dateStr,
        scheduledTime: '08:30',
        status: i === 3 ? 'skipped' : 'taken',
        skipReason: i === 3 ? 'Fasted for blood draw' : undefined,
        takenAt: i === 3 ? undefined : `${dateStr}T08:40:00Z`
      },
      {
        id: `medlog_${dateStr}_4`,
        medicationId: 'med_4',
        medicationName: 'Electrolyte Hydration Complex',
        dosage: '1 Packet in 750ml water',
        date: dateStr,
        scheduledTime: '09:00',
        status: 'taken',
        takenAt: `${dateStr}T09:15:00Z`
      }
    );

    // Pacing activities
    if (i % 2 === 0) {
      activities.push({
        id: `act_${dateStr}_1`,
        title: 'Deep Focused Writing & Data Review',
        category: 'cognitive',
        durationMinutes: 55,
        date: dateStr,
        time: '10:00',
        energyBefore: energyLevel,
        energyAfter: Math.max(1, energyLevel - 3),
        recoveryTimeMinutes: 45,
        notes: 'Exceeded 30-minute pacing threshold. Noticed heavy eyes.'
      });
      activities.push({
        id: `act_${dateStr}_2`,
        title: 'Somatic Floor Breathing & Rest',
        category: 'rest',
        durationMinutes: 25,
        date: dateStr,
        time: '12:00',
        energyBefore: Math.max(1, energyLevel - 3),
        energyAfter: Math.min(10, energyLevel - 1),
        recoveryTimeMinutes: 0,
        notes: 'Eye mask on, horizontal rest, nervous system settling.'
      });
    } else {
      activities.push({
        id: `act_${dateStr}_3`,
        title: 'Shaded Garden Stroll (Gentle Movement)',
        category: 'physical',
        durationMinutes: 20,
        date: dateStr,
        time: '15:30',
        energyBefore: 5,
        energyAfter: 5,
        recoveryTimeMinutes: 10,
        notes: 'Maintained low heart rate zone. Felt refreshing without PEM.'
      });
    }
  }

  const insights: HealthInsight[] = [
    {
      id: 'ins_sleep_migraine',
      title: 'Sleep Duration & Afternoon Migraine Correlation',
      category: 'sleep_symptom',
      observation: 'Vestibular migraines occurred on 4 out of 5 days where night sleep was under 6.2 hours.',
      detailedAnalysis:
        'Across 14 tracked days, days with <6.2h sleep showed an average next-day pain rating of 6.6/10 compared to 2.1/10 on days with >7.5h sleep. The onset typically manifests between 11:00 AM and 2:00 PM, preceded by neck tightness.',
      periodDescription: 'Last 14 days (5 recorded short-sleep nights)',
      occurrencesCount: 5,
      confidence: 'high',
      supportingData: [
        { label: 'Avg Pain on Short Sleep (<6.5h)', value: '6.6 / 10', dates: ['2026-11-06', '2026-11-03', '2026-10-31', '2026-10-30', '2026-10-27'] },
        { label: 'Avg Pain on Restorative Sleep (>7.5h)', value: '2.1 / 10', dates: ['2026-11-07', '2026-11-05', '2026-11-04', '2026-11-02'] },
        { label: 'Statistical Correlation Coefficient', value: 'r = -0.78 (Strong inverse)', dates: [] }
      ],
      actionableSuggestion: 'Explore buffering your evening wind-down starting at 20:45 to safeguard a consistent 7.5h sleep window before busy work days.',
      nonClinicalNote: 'This is an observed statistical pattern in your personal records, not a diagnostic medical finding.'
    },
    {
      id: 'ins_pacing_fatigue',
      title: 'Cognitive Duration Impact on Energy Depletion',
      category: 'activity_fatigue',
      observation: 'Continuous cognitive tasks exceeding 45 minutes lead to a 3.0 point average drop in energy.',
      detailedAnalysis:
        'When writing or reviewing data for longer than 45 minutes without an intermediate rest stop, post-activity energy dropped by an average of 3.0 points and required 45 minutes of horizontal recovery. In contrast, 25-minute Pomodoro pacing kept energy steady.',
      periodDescription: 'Last 14 days (7 tracked cognitive sessions)',
      occurrencesCount: 7,
      confidence: 'high',
      supportingData: [
        { label: 'Energy Drop (>45m unpaced)', value: '-3.0 points', dates: [] },
        { label: 'Energy Drop (<30m with rest)', value: '-0.8 points', dates: [] },
        { label: 'Required Recovery Duration', value: '45 min vs 10 min', dates: [] }
      ],
      actionableSuggestion: 'Setting a quiet 25-minute chime during laptop work may protect your afternoon reserve spoons.',
      nonClinicalNote: 'Pacing strategies are personalized self-management tools and do not substitute for clinical advice.'
    },
    {
      id: 'ins_magnesium_stiffness',
      title: 'Consistent Magnesium Adherence & Evening Muscle Relaxation',
      category: 'medication',
      observation: 'Nighttime neck and trapezius stiffness ratings declined by 40% on weeks with 100% magnesium adherence.',
      detailedAnalysis:
        'You have taken your Magnesium Glycinate 13 out of the past 14 days at bedtime. On days where it was taken with herbal tea, morning stiffness duration dropped from 90 minutes to under 30 minutes.',
      periodDescription: 'Last 14 days',
      occurrencesCount: 13,
      confidence: 'moderate',
      supportingData: [
        { label: 'Adherence Rate', value: '93% (13/14 days)', dates: [] },
        { label: 'Morning Stiffness Duration', value: 'Reduced by 60 min', dates: [] }
      ],
      actionableSuggestion: 'Continue your evening ritual as scheduled; keep noting any subtle digestive tolerance.',
      nonClinicalNote: 'Report observed medication responses to your prescribing physician during follow-ups.'
    }
  ];

  const communityPosts: CommunityPost[] = [
    {
      id: 'post_1',
      title: 'How I learned to stop feeling guilty about 20-minute horizontal rest',
      body:
        'For years with fibromyalgia and POTS, I thought resting meant "giving up" on my day. Morrow\'s pacing logs showed me clearly that a 20-minute dark-room eye break at 1:30 PM actually saves my entire evening. When you pace proactively before the crash hits, it is not lost time—it is maintenance.',
      category: 'Fatigue',
      authorName: 'Elena Vance',
      authorAvatar: profile.avatarUrl,
      isAnonymous: false,
      createdAt: '2026-11-06T15:20:00Z',
      reactions: { heart: 42, relate: 38, hug: 19 },
      userReaction: 'heart',
      saved: true,
      tags: ['Pacing', 'Fibromyalgia', 'EnergyBudget', 'RestIsMedicine'],
      comments: [
        {
          id: 'comm_1_1',
          postId: 'post_1',
          authorName: 'Sora Tanaka',
          authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          isAnonymous: false,
          content: 'This resonated so deeply. Preemptive rest is completely different from collapse rest!',
          createdAt: '2026-11-06T16:10:00Z',
          likes: 12
        },
        {
          id: 'comm_1_2',
          postId: 'post_1',
          authorName: 'Anonymous Member',
          isAnonymous: true,
          content: 'Thank you for this reminder today. I was just about to push through a headache.',
          createdAt: '2026-11-06T17:45:00Z',
          likes: 8
        }
      ]
    },
    {
      id: 'post_2',
      title: 'What questions helped you most when speaking to a neurologist about migraines?',
      body:
        'I am preparing my 30-day symptom report for an appointment next Tuesday. In the past I would get flustered and forget details. Printing out the frequency trends and trigger logs has already given me so much calm. What specific questions helped you get taken seriously?',
      category: 'Chronic pain',
      authorName: 'Marcus Bennett',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isAnonymous: false,
      createdAt: '2026-11-05T11:00:00Z',
      reactions: { heart: 24, relate: 31, hug: 15 },
      tags: ['Neurology', 'DoctorPrep', 'Advocacy', 'Migraine'],
      comments: [
        {
          id: 'comm_2_1',
          postId: 'post_2',
          authorName: 'Dr. Clara (Patient-Advocate)',
          authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          isAnonymous: false,
          content: 'Focus on functional impairment rather than just pain score: e.g. "On 4 days this month, light sensitivity made it impossible to look at screens for 3 hours."',
          createdAt: '2026-11-05T13:20:00Z',
          likes: 21
        }
      ]
    },
    {
      id: 'post_3',
      title: 'Gentle wins of the week: sharing small victories that healthy people might miss',
      body:
        'Made my own bone broth soup today and did 10 minutes of somatic vagus nerve breathing without triggering dizziness. What is one small, tender win you are celebrating in your body this week?',
      category: 'Everyday wellbeing',
      authorName: 'Aria Chen',
      isAnonymous: false,
      createdAt: '2026-11-04T09:15:00Z',
      reactions: { heart: 56, relate: 44, hug: 33 },
      tags: ['GentleWins', 'SelfCare', 'Gratitude'],
      comments: []
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      title: 'Evening Routine & Medication',
      message: 'Time for your Amitriptyline (25mg) and Magnesium Glycinate.',
      type: 'medication',
      timestamp: '2026-11-08T21:00:00Z',
      read: false,
      actionUrl: '/medications'
    },
    {
      id: 'notif_2',
      title: 'New Health Pattern Detected',
      message: 'Morrow identified an association between sleep under 6.2h and afternoon headaches.',
      type: 'insight',
      timestamp: '2026-11-08T18:00:00Z',
      read: false,
      actionUrl: '/insights'
    },
    {
      id: 'notif_3',
      title: 'Pacing Check-in',
      message: 'You have logged 50 minutes of continuous focus. How are your energy reserves?',
      type: 'pacing',
      timestamp: '2026-11-08T15:00:00Z',
      read: true,
      actionUrl: '/energy'
    }
  ];

  const chatHistory: ChatMessage[] = [
    {
      id: 'msg_init_1',
      sender: 'assistant',
      content:
        "Hello Elena. I'm Morrow, your health companion. I'm here to listen to how you're feeling, help connect patterns between your symptoms, energy, and sleep, and help you prepare for conversations with your doctors. How is your body feeling right now?",
      timestamp: `${today}T08:00:00Z`
    }
  ];

  return {
    profile,
    checkIns,
    symptoms,
    medications,
    medicationLogs,
    energyEntries,
    activities,
    insights,
    communityPosts,
    notifications,
    chatHistory
  };
}

class Database {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, falling back to seed data:', err);
    }
    const seed = generateInitialSeed();
    this.saveData(seed);
    return seed;
  }

  private saveData(data: DatabaseData): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  public resetToSeed(): DatabaseData {
    this.data = generateInitialSeed();
    this.saveData(this.data);
    return this.data;
  }

  public getAll(): DatabaseData {
    return this.data;
  }

  // Profile
  public getProfile(): UserProfile {
    return this.data.profile;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.data.profile = { ...this.data.profile, ...updates };
    this.saveData(this.data);
    return this.data.profile;
  }

  // Check-ins
  public getCheckIns(): DailyCheckIn[] {
    return [...this.data.checkIns].sort((a, b) => b.date.localeCompare(a.date));
  }

  public getTodayCheckIn(): DailyCheckIn | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.data.checkIns.find((c) => c.date === today);
  }

  public addCheckIn(checkIn: Omit<DailyCheckIn, 'id'>): DailyCheckIn {
    const existingIndex = this.data.checkIns.findIndex((c) => c.date === checkIn.date);
    const newEntry: DailyCheckIn = {
      ...checkIn,
      id: existingIndex >= 0 ? this.data.checkIns[existingIndex].id : `checkin_${Date.now()}`
    };

    if (existingIndex >= 0) {
      this.data.checkIns[existingIndex] = newEntry;
    } else {
      this.data.checkIns.unshift(newEntry);
    }

    // Also record an energy entry for context
    this.addEnergyEntry({
      date: checkIn.date,
      time: checkIn.timestamp.split('T')[1]?.substring(0, 5) || '09:00',
      level: checkIn.energyLevel,
      context: 'morning_waking',
      notes: `Recorded via daily check-in (${checkIn.mood})`
    });

    this.recalculateInsights();
    this.saveData(this.data);
    return newEntry;
  }

  // Symptoms
  public getSymptoms(): SymptomEntry[] {
    return [...this.data.symptoms].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }

  public addSymptom(symptom: Omit<SymptomEntry, 'id'>): SymptomEntry {
    const newSymptom: SymptomEntry = {
      ...symptom,
      id: `sym_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    this.data.symptoms.unshift(newSymptom);
    this.recalculateInsights();
    this.saveData(this.data);
    return newSymptom;
  }

  public deleteSymptom(id: string): boolean {
    const prevLen = this.data.symptoms.length;
    this.data.symptoms = this.data.symptoms.filter((s) => s.id !== id);
    if (this.data.symptoms.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Medications
  public getMedications(): Medication[] {
    return this.data.medications;
  }

  public addMedication(med: Omit<Medication, 'id'>): Medication {
    const newMed: Medication = {
      ...med,
      id: `med_${Date.now()}`
    };
    this.data.medications.push(newMed);
    this.saveData(this.data);
    return newMed;
  }

  public updateMedication(id: string, updates: Partial<Medication>): Medication | undefined {
    const idx = this.data.medications.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.data.medications[idx] = { ...this.data.medications[idx], ...updates };
    this.saveData(this.data);
    return this.data.medications[idx];
  }

  public deleteMedication(id: string): boolean {
    const prevLen = this.data.medications.length;
    this.data.medications = this.data.medications.filter((m) => m.id !== id);
    if (this.data.medications.length !== prevLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Medication Logs
  public getMedicationLogs(date?: string): MedicationLog[] {
    if (date) {
      return this.data.medicationLogs.filter((l) => l.date === date);
    }
    return [...this.data.medicationLogs].sort((a, b) => b.date.localeCompare(a.date));
  }

  public logMedicationDose(log: Omit<MedicationLog, 'id'>): MedicationLog {
    const existingIdx = this.data.medicationLogs.findIndex(
      (l) => l.medicationId === log.medicationId && l.date === log.date && l.scheduledTime === log.scheduledTime
    );

    const newLog: MedicationLog = {
      ...log,
      id: existingIdx >= 0 ? this.data.medicationLogs[existingIdx].id : `medlog_${Date.now()}`
    };

    if (existingIdx >= 0) {
      this.data.medicationLogs[existingIdx] = newLog;
    } else {
      this.data.medicationLogs.unshift(newLog);
    }

    this.saveData(this.data);
    return newLog;
  }

  // Energy
  public getEnergyEntries(): EnergyEntry[] {
    return [...this.data.energyEntries].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }

  public addEnergyEntry(entry: Omit<EnergyEntry, 'id'>): EnergyEntry {
    const newEntry: EnergyEntry = {
      ...entry,
      id: `energy_${Date.now()}`
    };
    this.data.energyEntries.unshift(newEntry);
    this.saveData(this.data);
    return newEntry;
  }

  // Activities
  public getActivities(): ActivityLog[] {
    return [...this.data.activities].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }

  public addActivity(activity: Omit<ActivityLog, 'id'>): ActivityLog {
    const newAct: ActivityLog = {
      ...activity,
      id: `act_${Date.now()}`
    };
    this.data.activities.unshift(newAct);
    this.recalculateInsights();
    this.saveData(this.data);
    return newAct;
  }

  // Insights
  public getInsights(): HealthInsight[] {
    return this.data.insights;
  }

  // Community
  public getCommunityPosts(): CommunityPost[] {
    return [...this.data.communityPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public addCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'reactions' | 'comments'>): CommunityPost {
    const newPost: CommunityPost = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      reactions: { heart: 0, relate: 0, hug: 0 },
      comments: []
    };
    this.data.communityPosts.unshift(newPost);
    this.saveData(this.data);
    return newPost;
  }

  public reactToPost(postId: string, reactionType: 'heart' | 'relate' | 'hug'): CommunityPost | undefined {
    const post = this.data.communityPosts.find((p) => p.id === postId);
    if (!post) return undefined;

    if (post.userReaction === reactionType) {
      // Toggle off
      post.reactions[reactionType] = Math.max(0, post.reactions[reactionType] - 1);
      post.userReaction = undefined;
    } else {
      if (post.userReaction) {
        post.reactions[post.userReaction] = Math.max(0, post.reactions[post.userReaction] - 1);
      }
      post.reactions[reactionType] += 1;
      post.userReaction = reactionType;
    }

    this.saveData(this.data);
    return post;
  }

  public commentOnPost(postId: string, content: string, isAnonymous: boolean): CommunityPost | undefined {
    const post = this.data.communityPosts.find((p) => p.id === postId);
    if (!post) return undefined;

    post.comments.push({
      id: `comm_${Date.now()}`,
      postId,
      authorName: isAnonymous ? 'Anonymous Member' : this.data.profile.name,
      authorAvatar: isAnonymous ? undefined : this.data.profile.avatarUrl,
      isAnonymous,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    });

    this.saveData(this.data);
    return post;
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return [...this.data.notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  public markNotificationAsRead(id: string): void {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.saveData(this.data);
    }
  }

  public markAllNotificationsRead(): void {
    this.data.notifications.forEach((n) => (n.read = true));
    this.saveData(this.data);
  }

  // Chat
  public getChatHistory(): ChatMessage[] {
    return this.data.chatHistory;
  }

  public addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.data.chatHistory.push(newMsg);
    // Keep reasonable history size
    if (this.data.chatHistory.length > 50) {
      this.data.chatHistory = this.data.chatHistory.slice(-50);
    }
    this.saveData(this.data);
    return newMsg;
  }

  public clearChatHistory(): void {
    const today = new Date().toISOString().split('T')[0];
    this.data.chatHistory = [
      {
        id: `msg_init_${Date.now()}`,
        sender: 'assistant',
        content: `Hello ${this.data.profile.name}. I'm here and ready to listen. How are you feeling today?`,
        timestamp: `${today}T08:00:00Z`
      }
    ];
    this.saveData(this.data);
  }

  // Statistical correlation engine: computes real statistical associations from records
  public recalculateInsights(): void {
    const checkIns = this.data.checkIns;
    const symptoms = this.data.symptoms;
    const activities = this.data.activities;

    if (checkIns.length < 3) return;

    // Pattern 1: Sleep vs Pain
    const shortSleepCheckIns = checkIns.filter((c) => c.sleepHours < 6.5);
    const regularSleepCheckIns = checkIns.filter((c) => c.sleepHours >= 6.5);

    if (shortSleepCheckIns.length >= 2) {
      const avgPainShort = shortSleepCheckIns.reduce((sum, c) => sum + c.painLevel, 0) / shortSleepCheckIns.length;
      const avgPainNormal =
        regularSleepCheckIns.length > 0
          ? regularSleepCheckIns.reduce((sum, c) => sum + c.painLevel, 0) / regularSleepCheckIns.length
          : 3;

      const diff = avgPainShort - avgPainNormal;

      if (diff >= 1.5) {
        const existingIdx = this.data.insights.findIndex((i) => i.id === 'ins_sleep_migraine');
        const updatedInsight: HealthInsight = {
          id: 'ins_sleep_migraine',
          title: 'Sleep Duration & Elevated Pain / Migraine Association',
          category: 'sleep_symptom',
          observation: `Reported pain scores averaged ${avgPainShort.toFixed(1)}/10 on days after sleep under 6.5h, compared to ${avgPainNormal.toFixed(1)}/10 on restorative sleep nights.`,
          detailedAnalysis: `Based on your ${checkIns.length} recorded daily check-ins, shorter sleep durations show a notable statistical association with higher next-day symptom severity and afternoon flare-ups.`,
          periodDescription: `Last ${checkIns.length} logged days (${shortSleepCheckIns.length} short sleep nights)`,
          occurrencesCount: shortSleepCheckIns.length,
          confidence: shortSleepCheckIns.length >= 4 ? 'high' : 'moderate',
          supportingData: [
            { label: 'Avg Pain Rating (Sleep < 6.5h)', value: `${avgPainShort.toFixed(1)} / 10`, dates: shortSleepCheckIns.map((c) => c.date).slice(0, 5) },
            { label: 'Avg Pain Rating (Sleep ≥ 6.5h)', value: `${avgPainNormal.toFixed(1)} / 10`, dates: regularSleepCheckIns.map((c) => c.date).slice(0, 5) },
            { label: 'Observed Difference', value: `+${diff.toFixed(1)} points pain on low sleep`, dates: [] }
          ],
          actionableSuggestion: 'Prioritizing an earlier quiet wind-down window may help buffer tomorrow\'s neurological symptom threshold.',
          nonClinicalNote: 'This is an observed statistical pattern in your personal records, not a clinical diagnosis or medical conclusion.'
        };

        if (existingIdx >= 0) {
          this.data.insights[existingIdx] = updatedInsight;
        } else {
          this.data.insights.unshift(updatedInsight);
        }
      }
    }

    // Pattern 2: Activity Duration & Fatigue Cost
    const longActivities = activities.filter((a) => a.durationMinutes >= 45 && a.category !== 'rest');
    if (longActivities.length >= 2) {
      const avgDrop = longActivities.reduce((sum, a) => sum + (a.energyBefore - a.energyAfter), 0) / longActivities.length;
      if (avgDrop >= 1.5) {
        const existingIdx = this.data.insights.findIndex((i) => i.id === 'ins_pacing_fatigue');
        const pacingInsight: HealthInsight = {
          id: 'ins_pacing_fatigue',
          title: 'Cognitive Duration Impact on Energy Depletion',
          category: 'activity_fatigue',
          observation: `Continuous sessions longer than 45 minutes produced an average energy depletion of ${avgDrop.toFixed(1)} points.`,
          detailedAnalysis: `Your activity logs show that uninterrupted tasks exceeding 45 minutes lead to steep post-activity energy drops requiring longer horizontal recovery windows.`,
          periodDescription: `${longActivities.length} tracked extended activity blocks`,
          occurrencesCount: longActivities.length,
          confidence: longActivities.length >= 4 ? 'high' : 'moderate',
          supportingData: [
            { label: 'Avg Energy Drop (>45m unpaced)', value: `-${avgDrop.toFixed(1)} points`, dates: [] },
            { label: 'Avg Recovery Required', value: '35–45 minutes', dates: [] }
          ],
          actionableSuggestion: 'Consider breaking longer tasks into 20- to 25-minute intervals with micro-rests to conserve spoons.',
          nonClinicalNote: 'Pacing strategies are personal self-management observations and not clinical treatment prescriptions.'
        };

        if (existingIdx >= 0) {
          this.data.insights[existingIdx] = pacingInsight;
        } else {
          this.data.insights.push(pacingInsight);
        }
      }
    }
  }
}

export const db = new Database();
