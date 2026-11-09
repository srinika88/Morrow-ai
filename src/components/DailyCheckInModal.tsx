import React, { useState } from 'react';
import { X, Moon, BatteryCharging, ShieldAlert, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { DailyCheckIn, MoodType } from '../types/index.js';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (checkIn: DailyCheckIn) => void;
  initialData?: DailyCheckIn | null;
}

const COMMON_SYMPTOMS = [
  'Vestibular Migraine',
  'Tension Headache',
  'Brain Fog',
  'Neck Stiffness',
  'Light Sensitivity',
  'Postural Dizziness (POTS)',
  'Joint Pain',
  'Nausea',
  'Fatigue Flare'
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [mood, setMood] = useState<MoodType>(initialData?.mood || 'calm');
  const [overallFeeling, setOverallFeeling] = useState(
    initialData?.overallFeeling || ''
  );
  const [energyLevel, setEnergyLevel] = useState<number>(
    initialData?.energyLevel ?? 6
  );
  const [painLevel, setPainLevel] = useState<number>(
    initialData?.painLevel ?? 2
  );
  const [sleepHours, setSleepHours] = useState<number>(
    initialData?.sleepHours ?? 7.5
  );
  const [sleepQuality, setSleepQuality] = useState<number>(
    initialData?.sleepQuality ?? 4
  );
  const [notableSymptoms, setNotableSymptoms] = useState<string[]>(
    initialData?.notableSymptoms || []
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setNotableSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        date: initialData?.date || today,
        timestamp: new Date().toISOString(),
        overallFeeling: overallFeeling.trim() || 'Recorded daily health check-in',
        mood,
        energyLevel,
        painLevel,
        sleepHours,
        sleepQuality,
        notableSymptoms,
        notes: notes.trim()
      };

      const result = await api.submitCheckIn(payload);

      // Trigger celebratory gentle confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#DCD5F2', '#F5E8A8', '#DCE7D8', '#574665']
        });
      } catch (err) {
        // Safe if canvas unsupported
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const moodOptions: { type: MoodType; label: string; icon: string }[] = [
    { type: 'great', label: 'Restored', icon: '🌿' },
    { type: 'calm', label: 'Balanced', icon: '✨' },
    { type: 'so-so', label: 'Tender', icon: '☁️' },
    { type: 'low', label: 'Fragile', icon: '💧' },
    { type: 'struggling', label: 'Flare-up', icon: '⚡' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#35313A]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F3] rounded-3xl shadow-2xl border border-[#35313A]/10 max-h-[90vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#35313A]/10 flex items-center justify-between bg-[#FAF8F3]">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#35313A]">
              Daily Health Check-in
            </h2>
            <p className="text-xs text-[#686270] mt-0.5">
              Take a quiet moment to listen to your body today.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#686270] hover:bg-[#EEE9F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mood / General state */}
          <div>
            <label className="block text-xs font-semibold text-[#686270] uppercase tracking-wider mb-2.5">
              How does your body feel overall?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setMood(opt.type)}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                    mood === opt.type
                      ? 'bg-[#EEE9F7] border-[#574665] text-[#574665] shadow-xs scale-102'
                      : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                  }`}
                >
                  <span className="text-xl mb-1">{opt.icon}</span>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={overallFeeling}
              onChange={(e) => setOverallFeeling(e.target.value)}
              placeholder="e.g. Mild brain fog with morning cervical stiffness, but steady mood"
              className="mt-3 w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] placeholder-[#9B94A4] focus:outline-none focus:ring-2 focus:ring-[#574665]"
            />
          </div>

          {/* Energy & Pain Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Energy Slider */}
            <div className="p-4 rounded-2xl bg-white border border-[#35313A]/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#35313A]">
                  <BatteryCharging className="w-4 h-4 text-[#574665]" />
                  <span>Energy Level</span>
                </div>
                <span className="font-serif text-lg font-semibold text-[#574665]">
                  {energyLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                className="w-full accent-[#574665] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#9B94A4] mt-1">
                <span>1 (Depleted)</span>
                <span>5 (Moderate)</span>
                <span>10 (Abundant)</span>
              </div>
            </div>

            {/* Pain Slider */}
            <div className="p-4 rounded-2xl bg-white border border-[#35313A]/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#35313A]">
                  <ShieldAlert className="w-4 h-4 text-[#574665]" />
                  <span>Pain / Discomfort</span>
                </div>
                <span className="font-serif text-lg font-semibold text-[#574665]">
                  {painLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value, 10))}
                className="w-full accent-[#574665] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#9B94A4] mt-1">
                <span>0 (None)</span>
                <span>5 (Distracting)</span>
                <span>10 (Severe)</span>
              </div>
            </div>
          </div>

          {/* Sleep hours & quality */}
          <div className="p-4 rounded-2xl bg-white border border-[#35313A]/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#35313A] mb-3">
              <Moon className="w-4 h-4 text-[#574665]" />
              <span>Last Night's Sleep</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#686270] block mb-1.5">
                  Duration (hours)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="18"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-2 text-sm rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] focus:outline-none focus:ring-2 focus:ring-[#574665]"
                  />
                  <span className="text-xs text-[#686270]">hours</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#686270] block mb-1.5">
                  Restorative Quality
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => setSleepQuality(q)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        sleepQuality === q
                          ? 'bg-[#EEE9F7] border-[#574665] text-[#574665] font-semibold'
                          : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                      }`}
                    >
                      {q === 1 ? 'Poor' : q === 3 ? 'Fair' : q === 5 ? 'Deep' : `${q}★`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notable Symptoms Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#686270] uppercase tracking-wider mb-2">
              Any notable symptoms present today?
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym) => {
                const selected = notableSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all ${
                      selected
                        ? 'bg-[#574665] border-[#574665] text-white shadow-xs'
                        : 'bg-white border-[#35313A]/15 text-[#686270] hover:border-[#574665]/40'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#686270] uppercase tracking-wider mb-1.5">
              Personal Notes & Context (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. High weather humidity today, tried 10 min vagus nerve breathing..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] placeholder-[#9B94A4] focus:outline-none focus:ring-2 focus:ring-[#574665]"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#3E324A] transition-colors disabled:opacity-50 shadow-xs"
            >
              {submitting ? (
                <span>Saving check-in...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Today's Check-in</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
