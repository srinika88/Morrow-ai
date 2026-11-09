import React from 'react';
import {
  Sparkles,
  BatteryCharging,
  Moon,
  Pill,
  Activity,
  ArrowRight,
  PlusCircle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { NavTab } from '../components/Navigation.js';
import { UserProfile, DailyCheckIn, SymptomEntry, ActivityLog } from '../types/index.js';

interface HomeViewProps {
  overview: any;
  profile: UserProfile | null;
  onOpenCheckIn: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  overview,
  profile,
  onOpenCheckIn,
  onNavigate
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = profile?.name ? profile.name.split(' ')[0] : 'there';
  const todayCheckIn: DailyCheckIn | undefined = overview?.todayCheckIn;
  const medSummary = overview?.medicationSummary || { scheduled: 4, taken: 3, remaining: 1 };
  const currentEnergy = overview?.currentEnergy ?? 6;
  const currentMood = overview?.currentMood ?? 'calm';
  const sleepHours = overview?.sleepHours ?? 7.5;
  const recentSymptoms: SymptomEntry[] = overview?.recentSymptoms || [];
  const recentActivities: ActivityLog[] = overview?.recentActivities || [];
  const reflection = overview?.reflection || 'Tracking your baseline daily creates clarity over time.';

  const moodLabels: Record<string, { label: string; icon: string }> = {
    great: { label: 'Restored & Clear', icon: '🌿' },
    calm: { label: 'Balanced Baseline', icon: '✨' },
    'so-so': { label: 'Tender Energy', icon: '☁️' },
    low: { label: 'Fragile / Fatigued', icon: '💧' },
    struggling: { label: 'Active Flare-up', icon: '⚡' }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EEE9F7] via-[#FAF8F3] to-[#F5E8A8]/30 border border-[#35313A]/10 p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#574665] bg-[#FAF8F3]/80 px-3 py-1 rounded-full border border-[#35313A]/10 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#35313A] tracking-tight">
            {getGreeting()}, {name}.
          </h2>
          <p className="font-sans text-base text-[#686270] mt-2 leading-relaxed">
            How are you feeling today? Check in with your body to keep your pacing and symptoms aligned.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCheckIn}
              className="py-2.5 px-5 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center gap-2 shadow-xs hover:bg-[#3E324A] transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{todayCheckIn ? "Update Today's Check-in" : "Begin Daily Check-in"}</span>
            </button>
            <button
              onClick={() => onNavigate('companion')}
              className="py-2.5 px-4 rounded-xl bg-white border border-[#35313A]/15 text-[#35313A] font-medium text-sm flex items-center gap-2 hover:bg-[#FAF8F3] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#574665]" />
              <span>Talk with Morrow</span>
            </button>
          </div>
        </div>
      </section>

      {/* AI Contextual Daily Reflection */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#DCD5F2]/25 border border-[#574665]/15 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[#574665] text-[#FAF8F3] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#574665]">
              Morrow's Daily Observation
            </span>
            <span className="text-[11px] text-[#686270]">· Based on your records</span>
          </div>
          <p className="font-serif text-base sm:text-lg text-[#35313A] mt-1 leading-snug">
            "{reflection}"
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => onNavigate('insights')}
              className="text-xs font-semibold text-[#574665] hover:text-[#3E324A] flex items-center gap-1 group"
            >
              <span>Explore health insights</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-xs text-[#9B94A4]">·</span>
            <button
              onClick={() => onNavigate('companion')}
              className="text-xs text-[#686270] hover:text-[#35313A]"
            >
              Discuss with AI Companion
            </button>
          </div>
        </div>
      </section>

      {/* Daily Health Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#35313A]">
            Today's Health Snapshot
          </h3>
          <span className="text-xs text-[#686270]">
            {todayCheckIn ? 'Updated today' : 'Estimated from recent logs'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Mood */}
          <div
            onClick={onOpenCheckIn}
            className="p-4 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#686270] mb-2">
              <span>Mood State</span>
              <span>{moodLabels[currentMood]?.icon || '✨'}</span>
            </div>
            <p className="font-serif text-lg font-semibold text-[#35313A] truncate">
              {moodLabels[currentMood]?.label || 'Balanced'}
            </p>
            <p className="text-[11px] text-[#9B94A4] mt-1 truncate">
              {todayCheckIn?.overallFeeling || 'Daily tone logged'}
            </p>
          </div>

          {/* Card 2: Energy */}
          <div
            onClick={() => onNavigate('energy')}
            className="p-4 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#686270] mb-2">
              <span>Energy</span>
              <BatteryCharging className="w-4 h-4 text-[#574665]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-semibold text-[#35313A]">
                {currentEnergy}
              </span>
              <span className="text-xs text-[#9B94A4]">/10</span>
            </div>
            <p className="text-[11px] text-[#9B94A4] mt-1">
              {currentEnergy >= 7 ? 'Steady reserves' : currentEnergy >= 4 ? 'Moderate pacing' : 'Rest recommended'}
            </p>
          </div>

          {/* Card 3: Pain / Comfort */}
          <div
            onClick={() => onNavigate('symptoms')}
            className="p-4 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#686270] mb-2">
              <span>Pain Level</span>
              <ShieldAlert className="w-4 h-4 text-[#574665]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-semibold text-[#35313A]">
                {overview?.painLevel ?? 2}
              </span>
              <span className="text-xs text-[#9B94A4]">/10</span>
            </div>
            <p className="text-[11px] text-[#9B94A4] mt-1">
              {overview?.painLevel > 4 ? 'Mild flare logged' : 'Manageable range'}
            </p>
          </div>

          {/* Card 4: Medication */}
          <div
            onClick={() => onNavigate('medications')}
            className="p-4 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#686270] mb-2">
              <span>Medications</span>
              <Pill className="w-4 h-4 text-[#574665]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-semibold text-[#35313A]">
                {medSummary.taken}/{medSummary.scheduled}
              </span>
              <span className="text-xs text-[#9B94A4]">taken</span>
            </div>
            <p className="text-[11px] text-[#9B94A4] mt-1">
              {medSummary.remaining > 0 ? `${medSummary.remaining} pending today` : 'All doses completed'}
            </p>
          </div>

          {/* Card 5: Sleep */}
          <div
            onClick={onOpenCheckIn}
            className="p-4 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#686270] mb-2">
              <span>Sleep</span>
              <Moon className="w-4 h-4 text-[#574665]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-semibold text-[#35313A]">
                {sleepHours}
              </span>
              <span className="text-xs text-[#9B94A4]">hrs</span>
            </div>
            <p className="text-[11px] text-[#9B94A4] mt-1">
              {overview?.sleepQuality ? `${overview.sleepQuality}/5 quality rating` : 'Logged'}
            </p>
          </div>

          {/* Card 6: Symptoms */}
          <div
            onClick={() => onNavigate('symptoms')}
            className="p-4 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#686270] mb-2">
              <span>Symptoms</span>
              <Activity className="w-4 h-4 text-[#574665]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-semibold text-[#35313A]">
                {recentSymptoms.length}
              </span>
              <span className="text-xs text-[#9B94A4]">logged</span>
            </div>
            <p className="text-[11px] text-[#9B94A4] mt-1 truncate">
              {recentSymptoms[0]?.name ? `${recentSymptoms[0].name}` : 'No active flare'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Recent Timeline & Quick Pacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chronological Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-[#35313A]">
              Recent Health Entries
            </h3>
            <button
              onClick={() => onNavigate('symptoms')}
              className="text-xs text-[#574665] hover:text-[#3E324A] font-medium"
            >
              View full timeline
            </button>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#35313A]/10 divide-y divide-[#35313A]/5">
            {recentSymptoms.length === 0 && recentActivities.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#686270]">
                No entries logged yet. Complete your first check-in to get started!
              </p>
            ) : (
              [...recentSymptoms.slice(0, 3).map((s) => ({ type: 'symptom', data: s, date: `${s.date}T${s.time}` })),
               ...recentActivities.slice(0, 3).map((a) => ({ type: 'activity', data: a, date: `${a.date}T${a.time}` }))
              ]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 4)
                .map((entry, idx) => {
                  if (entry.type === 'symptom') {
                    const s = entry.data as SymptomEntry;
                    return (
                      <div key={`sym_${idx}`} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-[#EEE9F7] text-[#574665] shrink-0 mt-0.5">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-[#35313A]">
                              {s.name}
                            </h4>
                            <span className="text-xs font-semibold text-[#574665] px-2 py-0.5 rounded-md bg-[#EEE9F7]">
                              Severity {s.severity}/10
                            </span>
                          </div>
                          <p className="text-xs text-[#686270] mt-0.5">
                            {s.location} · {s.durationMinutes} min · {s.triggers.slice(0, 2).join(', ')}
                          </p>
                          <div className="text-[11px] text-[#9B94A4] mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{s.date} at {s.time}</span>
                            {s.loggedVia === 'ai_chat' && (
                              <span className="text-[#574665]">· via Morrow Companion</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    const a = entry.data as ActivityLog;
                    return (
                      <div key={`act_${idx}`} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-[#DCE7D8] text-[#3E324A] shrink-0 mt-0.5">
                          <BatteryCharging className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-[#35313A]">
                              {a.title}
                            </h4>
                            <span className="text-xs text-[#686270]">
                              {a.durationMinutes} min
                            </span>
                          </div>
                          <p className="text-xs text-[#686270] mt-0.5">
                            Energy {a.energyBefore} → {a.energyAfter} (Cost: {a.energyBefore - a.energyAfter > 0 ? `-${a.energyBefore - a.energyAfter}` : 'Restorative'})
                          </p>
                          <div className="text-[11px] text-[#9B94A4] mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{a.date} at {a.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })
            )}
          </div>
        </div>

        {/* Right Col: Quick Medication & Pacing Assistant */}
        <div className="space-y-6">
          {/* Medications Today widget */}
          <div className="bg-white rounded-3xl p-5 border border-[#35313A]/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#574665]" />
                <h4 className="font-serif text-base font-semibold text-[#35313A]">
                  Today's Medications
                </h4>
              </div>
              <button
                onClick={() => onNavigate('medications')}
                className="text-xs text-[#574665] hover:text-[#3E324A] font-medium"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#35313A]/5 text-xs">
                <div>
                  <p className="font-medium text-[#35313A]">Amitriptyline</p>
                  <p className="text-[#686270]">25mg · Bedtime (21:00)</p>
                </div>
                <span className="text-[11px] text-[#574665] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Scheduled
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#35313A]/5 text-xs">
                <div>
                  <p className="font-medium text-[#35313A]">Magnesium Glycinate</p>
                  <p className="text-[#686270]">400mg · Bedtime (21:30)</p>
                </div>
                <span className="text-[11px] text-[#574665] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Scheduled
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#35313A]/5 text-xs">
                <div>
                  <p className="font-medium text-[#35313A]">Electrolyte Hydration</p>
                  <p className="text-[#686270]">1 Packet · Morning (09:00)</p>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Taken
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('medications')}
              className="w-full py-2 rounded-xl border border-[#574665]/20 text-xs font-semibold text-[#574665] hover:bg-[#EEE9F7] transition-colors"
            >
              Open Medication Tracker
            </button>
          </div>

          {/* Quick Doctor Report prompt */}
          <div className="p-5 rounded-3xl bg-[#DCE7D8]/40 border border-[#35313A]/10 space-y-2.5">
            <h4 className="font-serif text-base font-semibold text-[#35313A]">
              Doctor Appointment Coming Up?
            </h4>
            <p className="text-xs text-[#686270] leading-relaxed">
              Generate a clinical-ready summary of your last 30 days of symptoms, medication adherence, and energy pacing.
            </p>
            <button
              onClick={() => onNavigate('reports')}
              className="py-2 px-3.5 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A] transition-colors inline-flex items-center gap-1.5"
            >
              <span>Build Doctor Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
