import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export interface ChatResponsePayload {
  reply: string;
  suggestedAction?: {
    type: 'log_symptom' | 'log_energy' | 'log_medication' | 'view_insight';
    label: string;
    data: any;
  };
  safetyDisclaimer?: string;
  isEmergencyAlert?: boolean;
}

const RED_FLAG_SYMPTOMS = [
  'crushing chest pain',
  'sudden numbness on one side',
  'facial drooping',
  'inability to speak',
  'coughing blood',
  'suicide',
  'severe anaphylaxis',
  'cannot breathe'
];

export async function generateChatReply(
  userMessage: string,
  recentHistory: { sender: string; content: string }[]
): Promise<ChatResponsePayload> {
  // Check urgent emergency safeguards
  const lowerMsg = userMessage.toLowerCase();
  for (const redFlag of RED_FLAG_SYMPTOMS) {
    if (lowerMsg.includes(redFlag)) {
      return {
        reply:
          "I am hearing symptoms that require immediate clinical evaluation. Please call emergency services (such as 911 in the US/Canada or 999/112 in the UK/EU) or go to the nearest emergency department right away. Morrow is an observational health companion and cannot provide emergency medical intervention.",
        isEmergencyAlert: true,
        safetyDisclaimer: "Emergency notice: Seek immediate professional medical help."
      };
    }
  }

  const profile = db.getProfile();
  const symptoms = db.getSymptoms().slice(0, 5);
  const medications = db.getMedications();
  const checkIns = db.getCheckIns().slice(0, 4);
  const insights = db.getInsights();

  // Prepare context summary for Morrow's intelligence
  const contextSummary = `
User: ${profile.name}, ${profile.age}yo (${profile.pronouns}).
Diagnosed conditions: ${profile.conditions.join(', ') || 'None listed'}.
Goals: ${profile.goals.join('; ')}.
Current medications: ${medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ')}.
Recent symptoms logged: ${symptoms.map((s) => `${s.date}: ${s.name} (severity ${s.severity}/10)`).join(', ') || 'None recently'}.
Recent check-in trends: ${checkIns.map((c) => `${c.date}: energy ${c.energyLevel}/10, pain ${c.painLevel}/10, sleep ${c.sleepHours}h`).join('; ')}.
Observed patterns: ${insights.map((i) => i.observation).join(' ')}
`;

  const systemInstruction = `
You are Morrow, an empathetic, observant, and gentle personal health companion for people living with chronic illnesses or ongoing symptoms.
Your tone is warm, conversational, calm, respectful, and grounded (like a compassionate wellness specialist who understands the chronic illness experience, pacing, spoons, and sensory overwhelm).

Guiding Boundaries:
1. Distinguish between user-reported information, observed data patterns, and general wellness education.
2. NEVER diagnose conditions, prescribe medications, or advise changing treatment plans.
3. Suggest consulting their physician/specialist when appropriate.
4. If the user mentions experiencing a new or ongoing symptom (e.g. headache, nausea, brain fog, joint pain, fatigue spike), acknowledge it with empathy, ask 1-2 thoughtful clarifying questions (e.g. onset, severity, triggers, light sensitivity), and OFFER TO LOG IT for them.
5. You can extract structured health logs. If you detect the user describing a symptom, activity, or medication dose they want to record, include a special JSON block at the very end of your response formatted as:
\`\`\`action
{
  "type": "log_symptom",
  "label": "Log [Symptom Name]",
  "data": {
    "name": "Symptom Name",
    "severity": 5,
    "location": "location if mentioned or General",
    "durationMinutes": 60,
    "triggers": ["possible triggers mentioned"],
    "notes": "User description"
  }
}
\`\`\`
Or for energy:
\`\`\`action
{
  "type": "log_energy",
  "label": "Record Energy Level",
  "data": { "level": 4, "notes": "Context" }
}
\`\`\`
Keep your main reply text warm, concise (2-4 brief paragraphs), and easy to read.

User context:
${contextSummary}
`;

  const ai = getAiClient();

  if (!ai) {
    // Intelligent offline/fallback response if API key is not yet set in environment
    return generateFallbackResponse(userMessage, profile, symptoms, medications);
  }

  try {
    const contents = [
      ...recentHistory.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction
      }
    });

    const rawText = response.text || '';
    return parseActionFromResponse(rawText);
  } catch (error: any) {
    console.error('Gemini API call failed, using graceful companion fallback:', error);
    return generateFallbackResponse(userMessage, profile, symptoms, medications);
  }
}

function parseActionFromResponse(rawText: string): ChatResponsePayload {
  const actionRegex = /```action\s*([\s\S]*?)\s*```/;
  const match = rawText.match(actionRegex);

  let reply = rawText;
  let suggestedAction: ChatResponsePayload['suggestedAction'] = undefined;

  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && parsed.type) {
        suggestedAction = parsed;
      }
      reply = rawText.replace(match[0], '').trim();
    } catch (e) {
      console.warn('Failed to parse action json from LLM:', e);
    }
  }

  return {
    reply: reply.trim(),
    suggestedAction,
    safetyDisclaimer: 'Morrow provides observational tracking support, not medical diagnosis or treatment advice.'
  };
}

function generateFallbackResponse(
  userMessage: string,
  profile: any,
  symptoms: any[],
  medications: any[]
): ChatResponsePayload {
  const lower = userMessage.toLowerCase();

  // Headache / Migraine detection
  if (lower.includes('headache') || lower.includes('migraine')) {
    const severityMatch = lower.match(/\b([1-9]|10)\b/);
    const severity = severityMatch ? parseInt(severityMatch[1], 10) : 6;
    return {
      reply: `I'm sorry you're navigating a migraine flare right now. I know how draining that throb and sensory overload can be. Would you like me to log this in your symptom tracker so you have an accurate record for your records? In the meantime, gentle dimming of your screen and sipping your electrolytes might give your nervous system some buffer.`,
      suggestedAction: {
        type: 'log_symptom',
        label: 'Log Migraine Flare',
        data: {
          name: 'Migraine / Headache Flare',
          severity,
          location: 'Temples & eyes',
          durationMinutes: 120,
          triggers: lower.includes('screen') ? ['Screen glare / mental focus'] : ['Afternoon fatigue'],
          notes: userMessage
        }
      },
      safetyDisclaimer: 'Morrow provides observational tracking support, not medical advice.'
    };
  }

  // Energy / Fatigue
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('fatigue') || lower.includes('energy')) {
    return {
      reply: `Thank you for checking in and honoring that fatigue. When managing conditions like fibromyalgia and POTS, noticing an energy dip before pushing through is a vital pacing win. How low are your reserves feeling on a 1 to 10 scale? We can log this to see if it links to your recent activity.`,
      suggestedAction: {
        type: 'log_energy',
        label: 'Log Current Energy Level',
        data: {
          level: 3,
          notes: 'Afternoon energy dip - pacing observation'
        }
      }
    };
  }

  // Medication discussion
  if (lower.includes('medication') || lower.includes('pill') || lower.includes('dose') || lower.includes('amitriptyline') || lower.includes('magnesium')) {
    return {
      reply: `Tracking how your body responds to your regimen—like your evening Amitriptyline or chelated Magnesium—is so helpful when speaking with your prescribing doctor. Have you had any noticeable side effects or shifts in morning stiffness lately?`,
      suggestedAction: {
        type: 'log_medication',
        label: 'Review Today\'s Medication Schedule',
        data: {}
      }
    };
  }

  // General empathetic health response
  return {
    reply: `Thank you for sharing that with me, ${profile.name}. Navigating your health day-to-day takes a lot of presence. I'm keeping an eye on your logged sleep, pacing intervals, and symptom trends so you don't have to carry it all in your head. Is there a specific symptom or feeling you'd like to explore or log right now?`,
    safetyDisclaimer: 'Morrow provides observational tracking support, not medical advice.'
  };
}

export async function generateDailyReflection(): Promise<string> {
  const checkIns = db.getCheckIns().slice(0, 5);
  const symptoms = db.getSymptoms().slice(0, 5);
  const profile = db.getProfile();

  if (checkIns.length === 0) {
    return "Welcome to Morrow. Complete your morning check-in to start mapping your personal health baseline.";
  }

  const ai = getAiClient();
  if (ai) {
    try {
      const prompt = `Based strictly on this user health data, generate a single thoughtful, empathetic 1-2 sentence reflection for their daily dashboard. Do not give medical advice.
User: ${profile.name}.
Past days data: ${checkIns.map((c) => `${c.date}: energy ${c.energyLevel}/10, sleep ${c.sleepHours}h, pain ${c.painLevel}/10`).join('; ')}.
Recent symptoms: ${symptoms.map((s) => s.name).join(', ')}.`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const text = res.text?.trim();
      if (text) return text;
    } catch (e) {
      console.warn('Daily reflection LLM fallback:', e);
    }
  }

  // Statistical fallback observation
  const lowEnergyDays = checkIns.filter((c) => c.energyLevel <= 4).length;
  if (lowEnergyDays >= 2) {
    return `You've reported lower energy on ${lowEnergyDays} of your past few days. Would you like to review your recent activity blocks and rest pacing?`;
  }

  const avgSleep = checkIns.reduce((sum, c) => sum + c.sleepHours, 0) / checkIns.length;
  return `Your average sleep has rested at ${avgSleep.toFixed(1)} hours this week. Gentle consistency is supporting your baseline stability.`;
}

export async function generateDoctorQuestions(dateRange: string): Promise<string[]> {
  const symptoms = db.getSymptoms();
  const medications = db.getMedications();
  const profile = db.getProfile();

  const ai = getAiClient();
  if (ai) {
    try {
      const prompt = `Based on the following patient health log for ${profile.name} (${profile.conditions.join(', ')}), generate 4 concise, high-value questions the patient can ask their physician at their next appointment. Focus on functional impact, medication response, and trigger management. Return JSON array of strings.
Symptoms: ${symptoms.slice(0, 8).map((s) => `${s.name} (severity ${s.severity}/10, triggers: ${s.triggers.join(', ')})`).join('; ')}
Medications: ${medications.map((m) => `${m.name} ${m.dosage}`).join(', ')}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(res.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Doctor questions generation fallback:', e);
    }
  }

  return [
    'Given that short sleep (<6.2h) consistently precedes afternoon migraine onset, could an adjustment to evening sleep hygiene or medication timing help?',
    'Are my current dosages of Amitriptyline and Magnesium providing sufficient prophylaxis for the frequency of vestibular flares I am still logging?',
    'What non-pharmacological pacing strategies do you recommend when cognitive fatigue sets in after 45 minutes of computer work?',
    'Would a formal referral to an occupational therapist or vestibular physical therapist be beneficial for my standing balance and dizziness?'
  ];
}
