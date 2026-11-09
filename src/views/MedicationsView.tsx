import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api.js';
import { Medication, MedicationLog } from '../types/index.js';
import confetti from 'canvas-confetti';

interface MedicationsViewProps {
  medications: Medication[];
  onRefresh: () => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  medications,
  onRefresh
}) => {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [skipModalMed, setSkipModalMed] = useState<{ med: Medication; time: string } | null>(null);
  const [skipReason, setSkipReason] = useState('');

  // Add Medication Form State
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Medication['frequency']>('Once daily');
  const [timeOfDay, setTimeOfDay] = useState<('Morning' | 'Afternoon' | 'Evening' | 'Bedtime')[]>(['Morning']);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [instructions, setInstructions] = useState('');
  const [purpose, setPurpose] = useState('');
  const [colorTag, setColorTag] = useState('#DCD5F2');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  const loadLogs = async () => {
    try {
      const data = await api.getMedicationLogs(selectedDate);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load medication logs:', err);
    }
  };

  const activeMeds = medications.filter((m) => m.active);

  // Group medications by time of day
  const timeCategories: ('Morning' | 'Afternoon' | 'Evening' | 'Bedtime')[] = [
    'Morning',
    'Afternoon',
    'Evening',
    'Bedtime'
  ];

  const handleMarkTaken = async (med: Medication, time: string) => {
    try {
      await api.logMedicationDose({
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        date: selectedDate,
        scheduledTime: time,
        status: 'taken',
        takenAt: new Date().toISOString(),
        perceivedEffectiveness: 4
      });

      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.6 },
          colors: [med.colorTag, '#574665', '#FAF8F3']
        });
      } catch (e) {}

      loadLogs();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error logging medication');
    }
  };

  const handleConfirmSkip = async () => {
    if (!skipModalMed) return;
    try {
      await api.logMedicationDose({
        medicationId: skipModalMed.med.id,
        medicationName: skipModalMed.med.name,
        dosage: skipModalMed.med.dosage,
        date: selectedDate,
        scheduledTime: skipModalMed.time,
        status: 'skipped',
        skipReason: skipReason.trim() || 'Dose skipped'
      });
      setSkipModalMed(null);
      setSkipReason('');
      loadLogs();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error skipping medication');
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) return;

    setSubmitting(true);
    try {
      await api.addMedication({
        name: medName.trim(),
        dosage: dosage.trim(),
        frequency,
        timeOfDay,
        scheduleTimes: [scheduleTime],
        instructions: instructions.trim() || 'Take with water',
        startDate: selectedDate,
        purpose: purpose.trim() || 'Symptom management',
        colorTag,
        active: true,
        notes: notes.trim()
      });

      setShowAddModal(false);
      setMedName('');
      setDosage('');
      setInstructions('');
      setPurpose('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error adding medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medication from your regimen?')) return;
    try {
      await api.deleteMedication(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate adherence for selected day
  const dailyStats = useMemo(() => {
    let totalScheduled = 0;
    activeMeds.forEach((m) => {
      totalScheduled += m.scheduleTimes.length;
    });

    const taken = logs.filter((l) => l.status === 'taken').length;
    const skipped = logs.filter((l) => l.status === 'skipped').length;
    const rate = totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 100;

    return { totalScheduled, taken, skipped, rate };
  }, [activeMeds, logs]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
            Medication Management
          </h2>
          <p className="text-sm text-[#686270] mt-1">
            Track daily adherence, scheduled doses, and perceived effectiveness over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] focus:outline-none"
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center gap-2 hover:bg-[#3E324A] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Adherence & Status Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Daily Adherence</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-3xl font-semibold text-[#574665]">
              {dailyStats.rate}%
            </span>
            <span className="text-xs text-[#9B94A4]">
              ({dailyStats.taken}/{dailyStats.totalScheduled} doses)
            </span>
          </div>
          <p className="text-[11px] text-[#9B94A4] mt-1">
            For {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Active Prescriptions</p>
          <p className="font-serif text-3xl font-semibold text-[#35313A] mt-1">
            {activeMeds.length}
          </p>
          <p className="text-[11px] text-[#9B94A4] mt-1">
            Across daily & as-needed schedules
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Doses Completed</p>
          <p className="font-serif text-3xl font-semibold text-emerald-700 mt-1">
            {dailyStats.taken}
          </p>
          <p className="text-[11px] text-[#9B94A4] mt-1">
            Confirmed taken with timestamp
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#35313A]/10">
          <p className="text-xs text-[#686270] font-medium">Skipped with Reason</p>
          <p className="font-serif text-3xl font-semibold text-[#686270] mt-1">
            {dailyStats.skipped}
          </p>
          <p className="text-[11px] text-[#9B94A4] mt-1">
            Recorded for doctor review
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#35313A]/10 flex items-center gap-3 text-xs text-[#686270]">
        <HeartHandshake className="w-4 h-4 text-[#574665] shrink-0" />
        <span>
          Morrow tracks your personal adherence and tolerance observations. Never alter your prescribed dosage, titration schedule, or stop medications without consulting your healthcare provider.
        </span>
      </div>

      {/* Today's Schedule Grouped by Time of Day */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-semibold text-[#35313A]">
          Scheduled Doses for {selectedDate}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timeCategories.map((period) => {
            const periodMeds = activeMeds.filter((m) => m.timeOfDay.includes(period));
            if (periodMeds.length === 0) return null;

            return (
              <div
                key={period}
                className="p-5 rounded-3xl bg-white border border-[#35313A]/10 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#35313A]/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#574665]" />
                    <h4 className="font-serif text-base font-semibold text-[#35313A]">
                      {period}
                    </h4>
                  </div>
                  <span className="text-xs text-[#9B94A4]">
                    {periodMeds.length} scheduled
                  </span>
                </div>

                <div className="space-y-3">
                  {periodMeds.map((med) => {
                    const scheduledTime = med.scheduleTimes[0] || '09:00';
                    const log = logs.find(
                      (l) => l.medicationId === med.id && l.scheduledTime === scheduledTime
                    );

                    const isTaken = log?.status === 'taken';
                    const isSkipped = log?.status === 'skipped';

                    return (
                      <div
                        key={med.id}
                        className="p-3.5 rounded-2xl border border-[#35313A]/10 bg-[#FAF8F3]/60 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: med.colorTag || '#574665' }}
                            />
                            <h5 className="text-sm font-semibold text-[#35313A] truncate">
                              {med.name}
                            </h5>
                            <span className="text-xs text-[#686270]">
                              {med.dosage}
                            </span>
                          </div>

                          <p className="text-xs text-[#686270]">
                            {med.instructions} · <span className="italic">{med.purpose}</span>
                          </p>

                          {isSkipped && log?.skipReason && (
                            <p className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                              Skipped: {log.skipReason}
                            </p>
                          )}

                          {isTaken && log?.takenAt && (
                            <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Taken at {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isTaken ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800">
                              Completed
                            </span>
                          ) : isSkipped ? (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800">
                              Skipped
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleMarkTaken(med, scheduledTime)}
                                className="py-1.5 px-3 rounded-xl bg-[#574665] text-[#FAF8F3] text-xs font-medium hover:bg-[#3E324A] transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Take</span>
                              </button>
                              <button
                                onClick={() => setSkipModalMed({ med, time: scheduledTime })}
                                className="py-1.5 px-2.5 rounded-xl border border-[#35313A]/15 text-[#686270] text-xs hover:bg-white transition-colors"
                              >
                                Skip
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Medication List & Details */}
      <div className="space-y-4 pt-4">
        <h3 className="font-serif text-xl font-semibold text-[#35313A]">
          Prescription Regimen Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-3xl bg-white border border-[#35313A]/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-[#35313A]">
                      {m.name}
                    </h4>
                    <p className="text-xs text-[#574665] font-medium">
                      {m.dosage} · {m.frequency}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMedication(m.id)}
                    className="p-1.5 rounded-lg text-[#9B94A4] hover:text-rose-600 transition-colors"
                    title="Remove medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-[#686270] space-y-1">
                  <p>
                    <strong className="text-[#35313A]">Purpose:</strong> {m.purpose}
                  </p>
                  <p>
                    <strong className="text-[#35313A]">Instructions:</strong> {m.instructions}
                  </p>
                  <p>
                    <strong className="text-[#35313A]">Schedule:</strong> {m.timeOfDay.join(', ')} ({m.scheduleTimes.join(', ')})
                  </p>
                  {m.notes && (
                    <p className="italic text-[#9B94A4] pt-1 border-t border-[#35313A]/5">
                      "{m.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#9B94A4] pt-2 border-t border-[#35313A]/5 flex items-center justify-between">
                <span>Started: {m.startDate}</span>
                <span className="text-emerald-700 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skip Dose Reason Modal */}
      {skipModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#35313A]/40 backdrop-blur-xs"
            onClick={() => setSkipModalMed(null)}
          />
          <div className="relative w-full max-w-md bg-[#FAF8F3] rounded-3xl p-6 border border-[#35313A]/10 shadow-2xl z-10 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Skip Dose: {skipModalMed.med.name}
            </h3>
            <p className="text-xs text-[#686270]">
              Logging the reason helps your doctor evaluate whether dosage adjustments or alternative therapies are needed.
            </p>

            <div className="space-y-1.5">
              {['Fasting / Medical test', 'Mild stomach sensitivity', 'Forgot dose on time', 'Felt well enough without it', 'Experiencing side effects'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSkipReason(r)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all ${
                    skipReason === r
                      ? 'bg-[#574665] text-white border-[#574665]'
                      : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Or write custom reason..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSkipModalMed(null)}
                className="flex-1 py-2 rounded-xl border border-[#35313A]/15 text-xs text-[#686270]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="flex-1 py-2 rounded-xl bg-[#574665] text-white text-xs font-medium"
              >
                Record Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#35313A]/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FAF8F3] rounded-3xl p-6 border border-[#35313A]/10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#35313A]/10 pb-3">
              <h3 className="font-serif text-xl font-semibold text-[#35313A]">
                Add Medication
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#686270] hover:bg-[#EEE9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Medication / Supplement Name *
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Propranolol, Magnesium, Low-Dose Naltrexone"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 20 mg, 1 tablet"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed (PRN)</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                    Time Window
                  </label>
                  <div className="flex gap-1">
                    {(['Morning', 'Afternoon', 'Evening', 'Bedtime'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTimeOfDay([t])}
                        className={`flex-1 py-2 text-[10px] rounded-lg border font-medium ${
                          timeOfDay.includes(t)
                            ? 'bg-[#574665] text-white border-[#574665]'
                            : 'bg-white border-[#35313A]/10 text-[#686270]'
                        }`}
                      >
                        {t[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Purpose / Indication
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Migraine prevention, POTS blood volume, Nerve calming"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Instructions & Notes
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take with breakfast containing healthy fats"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A] transition-colors"
                >
                  {submitting ? 'Saving...' : 'Add to Medications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
