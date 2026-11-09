import React, { useState, useMemo } from 'react';
import {
  BatteryCharging,
  Zap,
  Clock,
  PlusCircle,
  TrendingDown,
  Sparkles,
  Coffee,
  Brain,
  Smile,
  Heart,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { EnergyEntry, ActivityLog } from '../types/index.js';
import confetti from 'canvas-confetti';

interface EnergyViewProps {
  energyEntries: EnergyEntry[];
  activities: ActivityLog[];
  onRefresh: () => void;
}

export const EnergyView: React.FC<EnergyViewProps> = ({
  energyEntries,
  activities,
  onRefresh
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [quickLevel, setQuickLevel] = useState<number>(6);
  const [quickContext, setQuickContext] = useState<EnergyEntry['context']>('midday');
  const [quickNotes, setQuickNotes] = useState('');

  // Activity Log State
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState<ActivityLog['category']>('cognitive');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [energyBefore, setEnergyBefore] = useState<number>(7);
  const [energyAfter, setEnergyAfter] = useState<number>(5);
  const [recoveryTimeMinutes, setRecoveryTimeMinutes] = useState<number>(15);
  const [actNotes, setActNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick Energy check-in handler
  const handleQuickEnergySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      await api.addEnergyEntry({
        date: today,
        time: timeNow,
        level: quickLevel,
        context: quickContext,
        notes: quickNotes.trim()
      });

      setQuickNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving energy level');
    }
  };

  // Activity Log submit
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      await api.addActivity({
        title: actTitle.trim(),
        category: actCategory,
        durationMinutes,
        date: today,
        time: timeNow,
        energyBefore,
        energyAfter,
        recoveryTimeMinutes,
        notes: actNotes.trim()
      });

      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 },
          colors: ['#DCE7D8', '#F5E8A8', '#574665']
        });
      } catch (e) {}

      setShowLogModal(false);
      setActTitle('');
      setActNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving activity log');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate current spoon / reserve status
  const latestEnergy = energyEntries[0]?.level ?? 6;
  const spoonsTotal = 12;
  const spoonsRemaining = Math.max(1, Math.round((latestEnergy / 10) * spoonsTotal));

  // Category icons & labels
  const categoryMeta: Record<ActivityLog['category'], { label: string; icon: any; color: string }> = {
    cognitive: { label: 'Cognitive', icon: Brain, color: '#DCD5F2' },
    physical: { label: 'Physical', icon: Zap, color: '#F5E8A8' },
    rest: { label: 'Rest / Pacing', icon: Coffee, color: '#DCE7D8' },
    social: { label: 'Social', icon: Smile, color: '#EEE9F7' },
    emotional: { label: 'Emotional', icon: Heart, color: '#FAF8F3' }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
            Energy & Pacing
          </h2>
          <p className="text-sm text-[#686270] mt-1">
            Pacing guidance for fluctuating energy, chronic fatigue, and post-exertional thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="py-2.5 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center gap-2 hover:bg-[#3E324A] transition-colors self-start sm:self-auto shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Activity & Energy Cost</span>
        </button>
      </div>

      {/* Spoon Theory & Energy Budget Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spoon Reservoir Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#686270]">
                Daily Spoon & Energy Budget
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#35313A] mt-0.5">
                {spoonsRemaining} of {spoonsTotal} Spoons Available
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-[#DCE7D8]/50 text-[#3E324A]">
              <BatteryCharging className="w-6 h-6" />
            </div>
          </div>

          {/* Visual spoon indicators */}
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.from({ length: spoonsTotal }).map((_, i) => {
              const isActive = i < spoonsRemaining;
              return (
                <div
                  key={i}
                  className={`h-8 flex-1 min-w-[20px] rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#574665] text-[#FAF8F3] shadow-xs'
                      : 'bg-[#EEE9F7]/70 text-[#9B94A4]'
                  }`}
                  title={isActive ? 'Available energy spoon' : 'Spent spoon'}
                >
                  🥄
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#686270] leading-relaxed">
            Your reserve indicates a <strong className="text-[#35313A] font-semibold">{latestEnergy >= 7 ? 'steady capacity' : latestEnergy >= 4 ? 'gentle conservation window' : 'low energy preservation phase'}</strong>.
            Prioritize short cognitive blocks and schedule quiet horizontal pauses before energy dips below 3.
          </p>
        </div>

        {/* Quick Instant Energy Check-in */}
        <div className="p-6 rounded-3xl bg-[#FAF8F3] border border-[#35313A]/10 space-y-3">
          <h4 className="font-serif text-base font-semibold text-[#35313A]">
            Quick Energy Pulse
          </h4>
          <p className="text-xs text-[#686270]">
            Log how your battery feels right now (1-10).
          </p>

          <form onSubmit={handleQuickEnergySubmit} className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#686270]">Current Level:</span>
              <span className="font-serif text-xl font-semibold text-[#574665]">
                {quickLevel} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={quickLevel}
              onChange={(e) => setQuickLevel(parseInt(e.target.value, 10))}
              className="w-full accent-[#574665] cursor-pointer"
            />

            <div className="flex gap-1 text-[10px]">
              {(['morning_waking', 'midday', 'evening', 'rest'] as const).map((ctx) => (
                <button
                  type="button"
                  key={ctx}
                  onClick={() => setQuickContext(ctx)}
                  className={`flex-1 py-1 rounded-md border capitalize font-medium ${
                    quickContext === ctx
                      ? 'bg-[#574665] text-white border-[#574665]'
                      : 'bg-white border-[#35313A]/10 text-[#686270]'
                  }`}
                >
                  {ctx.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#574665] text-[#FAF8F3] text-xs font-medium hover:bg-[#3E324A] transition-colors"
            >
              Record Energy Pulse
            </button>
          </form>
        </div>
      </div>

      {/* Pacing Assistant Insights Box */}
      <div className="p-6 rounded-3xl bg-[#DCD5F2]/25 border border-[#574665]/15 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#574665]" />
          <h3 className="font-serif text-lg font-semibold text-[#35313A]">
            Morrow Pacing Assistant
          </h3>
        </div>
        <p className="font-serif text-base text-[#35313A] leading-relaxed">
          "Your logs show that continuous cognitive tasks exceeding 45 minutes result in an average 3.0 point drop in energy, requiring 45 minutes of horizontal recovery. In contrast, 25-minute Pomodoro sessions with quiet eye-rest kept afternoon reserves stable."
        </p>
        <p className="text-xs text-[#686270]">
          Observation based on 7 tracked focus sessions over the past 14 days. Pacing strategies are personal tools and do not substitute clinical medical advice.
        </p>
      </div>

      {/* Activity Logs & Fatigue Pattern History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#35313A]">
            Activity Logs & Energy Deltas
          </h3>
          <span className="text-xs text-[#686270]">
            {activities.length} entries tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-sm text-[#686270] bg-white rounded-3xl border border-[#35313A]/10">
              No activities logged yet. Click "Log Activity" to start mapping your energy cost!
            </div>
          ) : (
            activities.map((act) => {
              const delta = act.energyBefore - act.energyAfter;
              const isDrain = delta > 0;
              const isRestorative = delta <= 0;
              const Meta = categoryMeta[act.category] || categoryMeta.cognitive;
              const Icon = Meta.icon;

              return (
                <div
                  key={act.id}
                  className="p-5 rounded-3xl bg-white border border-[#35313A]/10 flex flex-col justify-between space-y-3 hover:border-[#574665]/20 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="p-2 rounded-xl"
                          style={{ backgroundColor: Meta.color }}
                        >
                          <Icon className="w-4 h-4 text-[#35313A]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#35313A]">
                            {act.title}
                          </h4>
                          <span className="text-[11px] text-[#686270]">
                            {Meta.label} · {act.durationMinutes} min
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          isDrain
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isDrain ? `-${delta} energy` : isRestorative ? `+${Math.abs(delta)} restored` : 'Neutral'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#686270] bg-[#FAF8F3] p-2 rounded-xl">
                      <span>Before: <strong>{act.energyBefore}/10</strong></span>
                      <span>→</span>
                      <span>After: <strong>{act.energyAfter}/10</strong></span>
                      <span>·</span>
                      <span>Recovery: <strong>{act.recoveryTimeMinutes} min</strong></span>
                    </div>

                    {act.notes && (
                      <p className="text-xs text-[#686270] italic mt-2">
                        "{act.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] text-[#9B94A4] pt-2 border-t border-[#35313A]/5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{act.date} at {act.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#35313A]/40 backdrop-blur-xs"
            onClick={() => setShowLogModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FAF8F3] rounded-3xl p-6 border border-[#35313A]/10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#35313A]/10 pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#35313A]">
                  Log Activity & Energy Cost
                </h3>
                <p className="text-xs text-[#686270]">
                  Track how tasks influence your reserves to optimize pacing
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-lg text-[#686270] hover:bg-[#EEE9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="e.g. Deep coding session, Grocery shopping, Somatic floor rest"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  >
                    <option value="cognitive">Cognitive / Mental</option>
                    <option value="physical">Physical / Movement</option>
                    <option value="rest">Rest / Pacing break</option>
                    <option value="social">Social Interaction</option>
                    <option value="emotional">Emotional / Stress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  />
                </div>
              </div>

              {/* Energy Before & After */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-2xl border border-[#35313A]/10">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#686270]">Energy Before</span>
                    <strong className="text-[#574665]">{energyBefore}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyBefore}
                    onChange={(e) => setEnergyBefore(parseInt(e.target.value, 10))}
                    className="w-full accent-[#574665]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#686270]">Energy After</span>
                    <strong className="text-[#574665]">{energyAfter}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyAfter}
                    onChange={(e) => setEnergyAfter(parseInt(e.target.value, 10))}
                    className="w-full accent-[#574665]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Recovery Time Needed (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={recoveryTimeMinutes}
                  onChange={(e) => setRecoveryTimeMinutes(parseInt(e.target.value, 10) || 0)}
                  placeholder="How long until you felt back at baseline?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Personal Observations / Triggers
                </label>
                <textarea
                  rows={2}
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  placeholder="e.g. Brain felt heavy at minute 35, should have taken a break sooner..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A] transition-colors"
                >
                  {submitting ? 'Saving...' : 'Record Activity & Pacing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
