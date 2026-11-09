import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Sparkles,
  Download,
  RotateCcw,
  PlusCircle,
  X,
  Check,
  Phone,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api.js';
import { UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface SettingsViewProps {
  profile: UserProfile;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onRefresh
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [pronouns, setPronouns] = useState(profile.pronouns);
  const [age, setAge] = useState(profile.age);
  const [conditions, setConditions] = useState<string[]>(profile.conditions || []);
  const [newCondition, setNewCondition] = useState('');
  const [goals, setGoals] = useState<string[]>(profile.goals || []);
  const [newGoal, setNewGoal] = useState('');
  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [newAllergy, setNewAllergy] = useState('');

  // Emergency Contact
  const [ecName, setEcName] = useState(profile.emergencyContact?.name || '');
  const [ecRel, setEcRel] = useState(profile.emergencyContact?.relationship || '');
  const [ecPhone, setEcPhone] = useState(profile.emergencyContact?.phone || '');

  // Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile.preferences?.notificationsEnabled ?? true
  );
  const [medReminders, setMedReminders] = useState(
    profile.preferences?.medicationReminders ?? true
  );
  const [checkInTime, setCheckInTime] = useState(
    profile.preferences?.checkInReminderTime || '08:30'
  );
  const [aiMemoryEnabled, setAiMemoryEnabled] = useState(
    profile.preferences?.aiMemoryEnabled ?? true
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (c: string) => {
    setConditions(conditions.filter((item) => item !== c));
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (g: string) => {
    setGoals(goals.filter((item) => item !== g));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (a: string) => {
    setAllergies(allergies.filter((item) => item !== a));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name,
        email,
        pronouns,
        age,
        conditions,
        goals,
        allergies,
        emergencyContact: {
          name: ecName,
          relationship: ecRel,
          phone: ecPhone
        },
        preferences: {
          notificationsEnabled,
          medicationReminders: medReminders,
          checkInReminderTime: checkInTime,
          aiMemoryEnabled,
          anonymousPostingDefault: profile.preferences?.anonymousPostingDefault ?? false
        }
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/data/export';
  };

  const handleResetData = async () => {
    if (
      !confirm(
        'Reset Morrow to initial demonstration seed data? This will restore realistic demo data.'
      )
    )
      return;

    try {
      await api.resetData();
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#DCD5F2', '#FAF8F3']
        });
      } catch (e) {}
      onRefresh();
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Error resetting data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
          Profile & Preferences
        </h2>
        <p className="text-sm text-[#686270] mt-1">
          Control your personal health context, notification schedules, and AI memory permissions.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Personal Details */}
        <section className="p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#35313A]/5 pb-3">
            <User className="w-5 h-5 text-[#574665]" />
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Pronouns
              </label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. she/her, they/them"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>
          </div>
        </section>

        {/* Health Conditions & Goals */}
        <section className="p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#35313A]/5 pb-3">
            <HeartHandshake className="w-5 h-5 text-[#574665]" />
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Health Context & Focus Areas
            </h3>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-xs font-semibold text-[#686270] uppercase mb-1.5">
              Current Diagnoses & Ongoing Conditions
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {conditions.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 text-xs py-1 px-3 rounded-xl bg-[#EEE9F7] text-[#574665] font-medium"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(c)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add condition (e.g. ME/CFS, Endometriosis, Mast Cell)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-2 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-xs font-semibold text-[#686270] uppercase mb-1.5">
              Personal Health Goals
            </label>
            <div className="space-y-1.5 mb-2">
              {goals.map((g) => (
                <div
                  key={g}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F3] border border-[#35313A]/5 text-xs"
                >
                  <span className="text-[#35313A]">{g}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(g)}
                    className="text-[#9B94A4] hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add goal (e.g. Track morning stiffness vs magnesium)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGoal();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddGoal}
                className="px-3 py-2 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-[#686270] uppercase mb-1.5">
              Sensitivities & Allergies
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 text-xs py-1 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200"
                >
                  <span>{a}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(a)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add drug or sensory sensitivity..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-2 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A]"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#35313A]/5 pb-3">
            <Phone className="w-5 h-5 text-[#574665]" />
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Emergency Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={ecRel}
                onChange={(e) => setEcRel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={ecPhone}
                onChange={(e) => setEcPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-[#FAF8F3]/50 text-[#35313A]"
              />
            </div>
          </div>
        </section>

        {/* AI Memory & Notification Preferences */}
        <section className="p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#35313A]/5 pb-3">
            <Sparkles className="w-5 h-5 text-[#574665]" />
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              AI Memory & Notification Preferences
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiMemoryEnabled}
                onChange={(e) => setAiMemoryEnabled(e.target.checked)}
                className="mt-0.5 rounded accent-[#574665]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#35313A]">
                  Enable AI Memory & Record Context
                </span>
                <p className="text-[#686270] mt-0.5">
                  Allows Morrow AI Companion to reference your past conversations, diagnosed conditions, and logged symptom episodes to provide personalized reflections.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="mt-0.5 rounded accent-[#574665]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#35313A]">
                  Enable Notification Center Alerts
                </span>
                <p className="text-[#686270] mt-0.5">
                  Receive in-app alerts for scheduled medication times and pacing pauses.
                </p>
              </div>
            </label>

            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-[#686270]">Daily Check-in Prompt Time:</span>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[#35313A]/15 bg-white text-[#35313A]"
              />
            </div>
          </div>
        </section>

        {/* Save CTA */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 rounded-xl bg-[#574665] text-white text-xs font-semibold hover:bg-[#3E324A] transition-colors disabled:opacity-50 shadow-xs flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Settings'}
            {saveSuccess && <Check className="w-4 h-4 text-emerald-300" />}
          </button>
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-medium">
              Profile updated successfully!
            </span>
          )}
        </div>
      </form>

      {/* Data Management & Export */}
      <section className="p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#35313A]/5 pb-3">
          <Shield className="w-5 h-5 text-[#574665]" />
          <h3 className="font-serif text-lg font-semibold text-[#35313A]">
            Data Ownership & Privacy
          </h3>
        </div>

        <p className="text-xs text-[#686270] leading-relaxed">
          Your health data belongs exclusively to you. You can export complete machine-readable JSON records anytime, or reset to sample seed data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportData}
            className="py-2 px-4 rounded-xl border border-[#35313A]/15 bg-[#FAF8F3] text-xs font-medium text-[#35313A] hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#574665]" />
            <span>Download All Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="py-2 px-4 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-medium text-rose-800 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demo Seed Data</span>
          </button>
        </div>
      </section>
    </div>
  );
};
