import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Activity,
  Filter,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { SymptomEntry } from '../types/index.js';
import confetti from 'canvas-confetti';

interface SymptomsViewProps {
  symptoms: SymptomEntry[];
  onRefresh: () => void;
}

const COMMON_SYMPTOM_NAMES = [
  'Vestibular Migraine',
  'Tension Headache',
  'Brain Fog & Cognitive Lag',
  'Trapezius & Neck Stiffness',
  'Light Sensitivity (Photophobia)',
  'Postural Tachycardia / Dizziness',
  'Joint Pain & Myalgia',
  'Nausea & Gastric Sluggishness',
  'Sensory Overload'
];

const TRIGGER_PRESETS = [
  'Sleep deprivation (<6.5h)',
  'Prolonged screen glare',
  'Barometric pressure drop',
  'Mental / cognitive exertion',
  'Prolonged static posture',
  'High room humidity',
  'Skipped meal',
  'Sensory noisy environment'
];

export const SymptomsView: React.FC<SymptomsViewProps> = ({ symptoms, onRefresh }) => {
  const [filterSymptom, setFilterSymptom] = useState<string>('all');
  const [filterRange, setFilterRange] = useState<number>(14); // 7, 14, 30, 90
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState<number>(5);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [location, setLocation] = useState('Temples & behind eyes');
  const [frequency, setFrequency] = useState<SymptomEntry['frequency']>('recurring');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtered symptoms
  const filteredSymptoms = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterRange);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return symptoms.filter((s) => {
      if (s.date < cutoffStr) return false;
      if (filterSymptom !== 'all' && s.name !== filterSymptom) return false;
      return true;
    });
  }, [symptoms, filterRange, filterSymptom]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (filteredSymptoms.length === 0) return { total: 0, avgSeverity: 0, topTriggers: [] };
    const total = filteredSymptoms.length;
    const avgSeverity = (
      filteredSymptoms.reduce((sum, s) => sum + s.severity, 0) / total
    ).toFixed(1);

    const triggerCount: Record<string, number> = {};
    filteredSymptoms.forEach((s) => {
      s.triggers.forEach((t) => {
        triggerCount[t] = (triggerCount[t] || 0) + 1;
      });
    });

    const topTriggers = Object.entries(triggerCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { total, avgSeverity, topTriggers };
  }, [filteredSymptoms]);

  // Unique symptom names for filter
  const uniqueNames = useMemo(() => {
    return Array.from(new Set(symptoms.map((s) => s.name)));
  }, [symptoms]);

  const handleToggleTrigger = (t: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleAddCustomTrigger = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTrigger.trim()) {
      e.preventDefault();
      if (!selectedTriggers.includes(customTrigger.trim())) {
        setSelectedTriggers([...selectedTriggers, customTrigger.trim()]);
      }
      setCustomTrigger('');
    }
  };

  const handleSubmitSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await api.addSymptom({
        name: name.trim(),
        severity,
        date,
        time,
        durationMinutes,
        location: location.trim() || 'General',
        frequency,
        triggers: selectedTriggers,
        associatedActivities: [],
        notes: notes.trim(),
        loggedVia: 'manual'
      });

      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#DCD5F2', '#FAF8F3', '#574665']
        });
      } catch (err) {}

      setShowAddModal(false);
      setName('');
      setSelectedTriggers([]);
      setNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving symptom');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!confirm('Delete this symptom entry?')) return;
    try {
      await api.deleteSymptom(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
            My Health & Symptoms
          </h2>
          <p className="text-sm text-[#686270] mt-1">
            Map severity patterns, identify potential triggers, and monitor flare-up durations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center gap-2 hover:bg-[#3E324A] transition-colors self-start sm:self-auto shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Symptom</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Logged Episodes</p>
          <p className="font-serif text-3xl font-semibold text-[#35313A] mt-1">
            {stats.total}
          </p>
          <p className="text-xs text-[#9B94A4] mt-1">
            Over the selected {filterRange} days
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Average Severity</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-3xl font-semibold text-[#574665]">
              {stats.avgSeverity}
            </span>
            <span className="text-xs text-[#9B94A4]">/ 10</span>
          </div>
          <p className="text-xs text-[#9B94A4] mt-1">
            Across all logged episodes
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Most Common Trigger</p>
          <p className="font-serif text-lg font-semibold text-[#35313A] mt-1 truncate">
            {stats.topTriggers[0]?.[0] || 'No triggers logged yet'}
          </p>
          <p className="text-xs text-[#9B94A4] mt-1">
            {stats.topTriggers[0]
              ? `Reported in ${stats.topTriggers[0][1]} instances`
              : 'Add triggers when logging'}
          </p>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="p-6 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Symptom Severity & Occurrence Timeline
            </h3>
            <p className="text-xs text-[#686270]">
              Visual breakdown of episode intensity over the past {filterRange} days
            </p>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#35313A]/10">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setFilterRange(days)}
                className={`py-1 px-3 text-xs font-medium rounded-lg transition-colors ${
                  filterRange === days
                    ? 'bg-[#574665] text-white shadow-xs'
                    : 'text-[#686270] hover:text-[#35313A]'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* SVG Severity Bar / Line visualization */}
        {filteredSymptoms.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#686270]">
            No symptoms recorded in this time range.
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-44 w-full flex items-end gap-2 sm:gap-4 border-b border-[#35313A]/10 pb-2 overflow-x-auto">
              {filteredSymptoms.slice(-14).map((s, idx) => {
                const heightPercent = Math.max(15, (s.severity / 10) * 100);
                return (
                  <div
                    key={s.id || idx}
                    className="flex-1 min-w-[36px] max-w-[56px] flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-[#35313A] text-white text-[11px] py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none shadow-md">
                      {s.name}: {s.severity}/10 ({s.date})
                    </div>

                    <span className="text-[10px] font-semibold text-[#574665] mb-1">
                      {s.severity}
                    </span>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all ${
                        s.severity >= 7
                          ? 'bg-[#574665]'
                          : s.severity >= 4
                          ? 'bg-[#DCD5F2]'
                          : 'bg-[#DCE7D8]'
                      }`}
                    />

                    <span className="text-[9px] text-[#9B94A4] mt-2 truncate w-full text-center">
                      {s.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#9B94A4] pt-2">
              <span>Earlier</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#574665]" />
                  <span>High (7-10)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DCD5F2]" />
                  <span>Moderate (4-6)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DCE7D8]" />
                  <span>Mild (1-3)</span>
                </span>
              </div>
              <span>Recent</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar & History List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#574665]" />
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Detailed Symptom History
            </h3>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#686270]">Condition / Symptom:</span>
            <select
              value={filterSymptom}
              onChange={(e) => setFilterSymptom(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] focus:outline-none focus:ring-1 focus:ring-[#574665]"
            >
              <option value="all">All Symptoms ({symptoms.length})</option>
              {uniqueNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entries list */}
        <div className="space-y-3">
          {filteredSymptoms.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-[#35313A]/10 text-center text-sm text-[#686270]">
              No symptoms match the current filter.
            </div>
          ) : (
            filteredSymptoms.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white border border-[#35313A]/10 hover:border-[#574665]/20 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-base font-semibold text-[#35313A]">
                      {s.name}
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEE9F7] text-[#574665]">
                      Severity {s.severity}/10
                    </span>
                    <span className="text-xs text-[#686270]">
                      · Duration: {s.durationMinutes} min
                    </span>
                  </div>

                  <p className="text-xs text-[#686270]">
                    Location: <strong className="font-medium text-[#35313A]">{s.location}</strong> · Frequency: {s.frequency}
                  </p>

                  {s.triggers && s.triggers.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-[#9B94A4]">Potential triggers:</span>
                      {s.triggers.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F3] border border-[#35313A]/10 text-[#686270]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {s.notes && (
                    <p className="text-xs text-[#686270] italic pt-1">
                      "{s.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-[#9B94A4] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {s.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.time}
                    </span>
                    {s.loggedVia === 'ai_chat' && (
                      <span className="text-[#574665] flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" />
                        Morrow Companion
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSymptom(s.id)}
                  className="p-2 rounded-xl text-[#9B94A4] hover:text-rose-600 hover:bg-rose-50 self-end sm:self-start transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Symptom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#35313A]/50 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative w-full max-w-xl bg-[#FAF8F3] rounded-3xl shadow-2xl border border-[#35313A]/10 max-h-[90vh] flex flex-col z-10 overflow-hidden">
            <div className="p-5 border-b border-[#35313A]/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#35313A]">
                  Log Symptom Episode
                </h3>
                <p className="text-xs text-[#686270]">
                  Record precise details for your history and doctor reports
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#686270] hover:bg-[#EEE9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSymptom} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Symptom Name */}
              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase tracking-wider mb-1.5">
                  Symptom Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vestibular Migraine or Brain Fog"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] focus:outline-none focus:ring-2 focus:ring-[#574665]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_SYMPTOM_NAMES.slice(0, 4).map((sName) => (
                    <button
                      type="button"
                      key={sName}
                      onClick={() => setName(sName)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[#35313A]/10 bg-white text-[#686270] hover:bg-[#EEE9F7]"
                    >
                      {sName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Slider */}
              <div className="p-4 rounded-2xl bg-white border border-[#35313A]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#686270] uppercase tracking-wider">
                    Severity (1 - 10)
                  </span>
                  <span className="font-serif text-lg font-semibold text-[#574665]">
                    {severity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#574665] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9B94A4] mt-1">
                  <span>1 (Barely noticeable)</span>
                  <span>5 (Distracting)</span>
                  <span>10 (Debilitating)</span>
                </div>
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#686270] block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#686270] block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#686270] block mb-1">Duration (mins)</label>
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

              {/* Location & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#686270] block mb-1">Body Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Temples, Cervical spine, Left shoulder"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#686270] block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  >
                    <option value="recurring">Recurring</option>
                    <option value="intermittent">Intermittent</option>
                    <option value="isolated">Isolated Episode</option>
                    <option value="constant">Constant</option>
                  </select>
                </div>
              </div>

              {/* Triggers Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase tracking-wider mb-1.5">
                  Potential Triggers
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TRIGGER_PRESETS.map((t) => {
                    const sel = selectedTriggers.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => handleToggleTrigger(t)}
                        className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                          sel
                            ? 'bg-[#574665] border-[#574665] text-white'
                            : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  onKeyDown={handleAddCustomTrigger}
                  placeholder="Type other trigger and press Enter..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase tracking-wider mb-1">
                  Observations / Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Relief measures attempted, medication taken, light sensitivity severity..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm hover:bg-[#3E324A] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Symptom Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
