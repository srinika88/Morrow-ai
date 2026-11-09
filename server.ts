import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateChatReply, generateDailyReflection, generateDoctorQuestions } from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Routes

// Profile & Settings
app.get('/api/profile', (req, res) => {
  res.json(db.getProfile());
});

app.put('/api/profile', (req, res) => {
  const updated = db.updateProfile(req.body);
  res.json(updated);
});

// Overview / Dashboard
app.get('/api/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const profile = db.getProfile();
    const todayCheckIn = db.getTodayCheckIn();
    const medications = db.getMedications().filter((m) => m.active);
    const todayLogs = db.getMedicationLogs(today);
    const symptoms = db.getSymptoms().slice(0, 5);
    const recentActivities = db.getActivities().slice(0, 4);
    const energyEntries = db.getEnergyEntries().slice(0, 5);
    const reflection = await generateDailyReflection();
    const unreadNotifications = db.getNotifications().filter((n) => !n.read).length;

    // Calculate medication status
    const scheduledCount = medications.length;
    const takenCount = todayLogs.filter((l) => l.status === 'taken').length;
    const skippedCount = todayLogs.filter((l) => l.status === 'skipped').length;

    res.json({
      profile,
      today,
      todayCheckIn,
      medicationSummary: {
        scheduled: scheduledCount,
        taken: takenCount,
        skipped: skippedCount,
        remaining: Math.max(0, scheduledCount - (takenCount + skippedCount))
      },
      currentEnergy: todayCheckIn?.energyLevel ?? energyEntries[0]?.level ?? 6,
      currentMood: todayCheckIn?.mood ?? 'calm',
      painLevel: todayCheckIn?.painLevel ?? 2,
      sleepHours: todayCheckIn?.sleepHours ?? 7.5,
      sleepQuality: todayCheckIn?.sleepQuality ?? 4,
      recentSymptoms: symptoms,
      recentActivities,
      reflection,
      unreadNotifications
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load overview' });
  }
});

// Check-ins
app.get('/api/checkins', (req, res) => {
  res.json(db.getCheckIns());
});

app.post('/api/checkin', (req, res) => {
  try {
    const created = db.addCheckIn(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Symptoms
app.get('/api/symptoms', (req, res) => {
  res.json(db.getSymptoms());
});

app.post('/api/symptoms', (req, res) => {
  try {
    const created = db.addSymptom(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/symptoms/:id', (req, res) => {
  const success = db.deleteSymptom(req.params.id);
  res.json({ success });
});

// Medications
app.get('/api/medications', (req, res) => {
  res.json(db.getMedications());
});

app.post('/api/medications', (req, res) => {
  try {
    const created = db.addMedication(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/medications/:id', (req, res) => {
  const updated = db.updateMedication(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Medication not found' });
  } else {
    res.json(updated);
  }
});

app.delete('/api/medications/:id', (req, res) => {
  const success = db.deleteMedication(req.params.id);
  res.json({ success });
});

app.get('/api/medications/logs', (req, res) => {
  const date = (req.query.date as string) || undefined;
  res.json(db.getMedicationLogs(date));
});

app.post('/api/medications/log', (req, res) => {
  try {
    const log = db.logMedicationDose(req.body);
    res.status(201).json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Energy & Activities
app.get('/api/energy', (req, res) => {
  res.json(db.getEnergyEntries());
});

app.post('/api/energy', (req, res) => {
  try {
    const entry = db.addEnergyEntry(req.body);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/activities', (req, res) => {
  res.json(db.getActivities());
});

app.post('/api/activities', (req, res) => {
  try {
    const act = db.addActivity(req.body);
    res.status(201).json(act);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Insights
app.get('/api/insights', (req, res) => {
  db.recalculateInsights();
  res.json(db.getInsights());
});

// Community
app.get('/api/community', (req, res) => {
  res.json(db.getCommunityPosts());
});

app.post('/api/community', (req, res) => {
  try {
    const post = db.addCommunityPost(req.body);
    res.status(201).json(post);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/community/:id/react', (req, res) => {
  const reactionType = req.body.type as 'heart' | 'relate' | 'hug';
  const updated = db.reactToPost(req.params.id, reactionType);
  if (!updated) {
    res.status(404).json({ error: 'Post not found' });
  } else {
    res.json(updated);
  }
});

app.post('/api/community/:id/comment', (req, res) => {
  const { content, isAnonymous } = req.body;
  const updated = db.commentOnPost(req.params.id, content, Boolean(isAnonymous));
  if (!updated) {
    res.status(404).json({ error: 'Post not found' });
  } else {
    res.json(updated);
  }
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications());
});

app.put('/api/notifications/:id/read', (req, res) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

app.put('/api/notifications/read-all', (req, res) => {
  db.markAllNotificationsRead();
  res.json({ success: true });
});

// AI Chat
app.get('/api/chat/history', (req, res) => {
  res.json(db.getChatHistory());
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // 1. Record user message in DB
  const userMsg = db.addChatMessage({
    sender: 'user',
    content: message
  });

  // 2. Query Gemini Companion
  const history = db.getChatHistory();
  const replyPayload = await generateChatReply(
    message,
    history.map((h) => ({ sender: h.sender, content: h.content }))
  );

  // 3. Record Assistant message in DB
  const assistantMsg = db.addChatMessage({
    sender: 'assistant',
    content: replyPayload.reply,
    suggestedAction: replyPayload.suggestedAction
  });

  res.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    safetyDisclaimer: replyPayload.safetyDisclaimer,
    isEmergencyAlert: replyPayload.isEmergencyAlert
  });
});

app.post('/api/chat/clear', (req, res) => {
  db.clearChatHistory();
  res.json({ success: true });
});

// Reports Generation & Doctor Questions
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { startDate, endDate, sections } = req.body;
    const profile = db.getProfile();
    const symptoms = db.getSymptoms().filter((s) => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      return true;
    });
    const checkIns = db.getCheckIns().filter((c) => {
      if (startDate && c.date < startDate) return false;
      if (endDate && c.date > endDate) return false;
      return true;
    });
    const medications = db.getMedications();
    const medLogs = db.getMedicationLogs().filter((l) => {
      if (startDate && l.date < startDate) return false;
      if (endDate && l.date > endDate) return false;
      return true;
    });
    const insights = db.getInsights();
    const questions = await generateDoctorQuestions(`${startDate} to ${endDate}`);

    // Compute key statistics
    const totalDays = Math.max(1, checkIns.length);
    const avgSleep = (checkIns.reduce((sum, c) => sum + c.sleepHours, 0) / totalDays).toFixed(1);
    const avgPain = (checkIns.reduce((sum, c) => sum + c.painLevel, 0) / totalDays).toFixed(1);
    const avgEnergy = (checkIns.reduce((sum, c) => sum + c.energyLevel, 0) / totalDays).toFixed(1);

    const symptomFrequencyMap: Record<string, number> = {};
    const symptomSeverityMap: Record<string, number[]> = {};

    symptoms.forEach((s) => {
      symptomFrequencyMap[s.name] = (symptomFrequencyMap[s.name] || 0) + 1;
      if (!symptomSeverityMap[s.name]) symptomSeverityMap[s.name] = [];
      symptomSeverityMap[s.name].push(s.severity);
    });

    const symptomSummary = Object.keys(symptomFrequencyMap).map((name) => {
      const sevs = symptomSeverityMap[name];
      const avgSev = (sevs.reduce((a, b) => a + b, 0) / sevs.length).toFixed(1);
      return {
        name,
        count: symptomFrequencyMap[name],
        averageSeverity: Number(avgSev)
      };
    });

    // Medication adherence calculation
    const totalDoses = medLogs.length;
    const takenDoses = medLogs.filter((l) => l.status === 'taken').length;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 95;

    res.json({
      generatedAt: new Date().toISOString(),
      patient: {
        name: profile.name,
        age: profile.age,
        pronouns: profile.pronouns,
        conditions: profile.conditions,
        allergies: profile.allergies,
        goals: profile.goals
      },
      period: {
        startDate: startDate || checkIns[checkIns.length - 1]?.date || 'Past 14 days',
        endDate: endDate || todayCheckIn() || 'Today',
        daysTracked: totalDays
      },
      metrics: {
        avgSleep,
        avgPain,
        avgEnergy,
        totalSymptomsLogged: symptoms.length,
        adherenceRate
      },
      symptomSummary,
      recentSymptoms: symptoms.slice(0, 10),
      medications,
      adherenceRate,
      insights,
      questionsForDoctor: questions,
      sectionsIncluded: sections || ['summary', 'symptoms', 'medications', 'energy', 'questions']
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Report generation error' });
  }
});

function todayCheckIn(): string {
  return new Date().toISOString().split('T')[0];
}

// Data reset & export
app.post('/api/data/reset', (req, res) => {
  const seed = db.resetToSeed();
  res.json({ success: true, profile: seed.profile });
});

app.get('/api/data/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="morrow_health_data.json"');
  res.json(db.getAll());
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Morrow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Morrow server:', err);
  process.exit(1);
});
