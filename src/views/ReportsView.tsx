import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Sparkles,
  Check,
  ShieldCheck,
  Activity,
  Pill,
  Moon,
  BatteryCharging,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api.js';
import { UserProfile } from '../types/index.js';

interface ReportsViewProps {
  profile: UserProfile | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ profile }) => {
  const [rangePreset, setRangePreset] = useState<'14d' | '30d' | '90d'>('14d');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [sections, setSections] = useState<string[]>([
    'summary',
    'symptoms',
    'medications',
    'energy',
    'questions'
  ]);

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, [startDate, endDate]);

  const handleRangePresetChange = (preset: '14d' | '30d' | '90d') => {
    setRangePreset(preset);
    const d = new Date();
    const days = preset === '14d' ? 14 : preset === '30d' ? 30 : 90;
    d.setDate(d.getDate() - days);
    setStartDate(d.toISOString().split('T')[0]);
  };

  const toggleSection = (sec: string) => {
    setSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await api.generateReport({ startDate, endDate, sections });
      setReportData(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!reportData) return;
    const patient = reportData.patient;
    const metrics = reportData.metrics;

    let md = `# MORROW CLINICAL HEALTH SUMMARY\n`;
    md += `Patient: ${patient.name} (${patient.pronouns}), Age: ${patient.age}\n`;
    md += `Diagnosed Conditions: ${patient.conditions?.join(', ')}\n`;
    md += `Period: ${reportData.period.startDate} to ${reportData.period.endDate}\n`;
    md += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    md += `## 1. Executive Summary & Baselines\n`;
    md += `- Average Sleep: ${metrics.avgSleep} hrs/night\n`;
    md += `- Average Pain Rating: ${metrics.avgPain} / 10\n`;
    md += `- Average Energy Reserve: ${metrics.avgEnergy} / 10\n`;
    md += `- Medication Adherence: ${metrics.adherenceRate}%\n\n`;

    md += `## 2. Symptom Frequency & Severity\n`;
    reportData.symptomSummary?.forEach((s: any) => {
      md += `- **${s.name}**: ${s.count} episodes logged (Average Severity: ${s.averageSeverity}/10)\n`;
    });
    md += `\n`;

    md += `## 3. Active Medications\n`;
    reportData.medications?.forEach((m: any) => {
      md += `- **${m.name}** ${m.dosage}: ${m.frequency} (${m.timeOfDay?.join(', ')}) - ${m.purpose}\n`;
    });
    md += `\n`;

    md += `## 4. Discussion Questions for Provider\n`;
    reportData.questionsForDoctor?.forEach((q: string, i: number) => {
      md += `${i + 1}. ${q}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Morrow_Health_Report_${patient.name.replace(/\s+/g, '_')}_${reportData.period.endDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header (hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
            Doctor-Ready Reports
          </h2>
          <p className="text-sm text-[#686270] mt-1">
            Clinical-grade summary designed for efficient review with your neurologist, rheumatologist, or primary care doctor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="py-2 px-3.5 rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] text-xs font-medium hover:bg-[#FAF8F3] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Text</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-4 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Configuration Controls (hidden in print) */}
      <div className="print:hidden p-5 rounded-3xl bg-white border border-[#35313A]/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#574665]" />
            <span className="text-xs font-semibold text-[#35313A]">Select Date Range:</span>
            <div className="flex gap-1 ml-2">
              {(['14d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleRangePresetChange(p)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                    rangePreset === p
                      ? 'bg-[#574665] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#686270] hover:text-[#35313A]'
                  }`}
                >
                  {p === '14d' ? 'Last 14 Days' : p === '30d' ? 'Last 30 Days' : 'Last 3 Months'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#35313A]/15 text-[#35313A]"
            />
            <span className="text-[#9B94A4]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#35313A]/15 text-[#35313A]"
            />
          </div>
        </div>

        {/* Section toggles */}
        <div className="pt-2 border-t border-[#35313A]/5 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#686270] font-medium mr-1">Include sections:</span>
          {[
            { id: 'summary', label: 'Overview Metrics' },
            { id: 'symptoms', label: 'Symptom Breakdown' },
            { id: 'medications', label: 'Medications & Adherence' },
            { id: 'energy', label: 'Pacing & Energy Patterns' },
            { id: 'questions', label: 'Questions for Doctor' }
          ].map((sec) => {
            const isChecked = sections.includes(sec.id);
            return (
              <button
                key={sec.id}
                onClick={() => toggleSection(sec.id)}
                className={`py-1 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isChecked
                    ? 'bg-[#EEE9F7] text-[#574665] border-[#574665] font-semibold'
                    : 'bg-white text-[#9B94A4] border-[#35313A]/10'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 text-[#574665]" />}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Report Document Surface */}
      {loading || !reportData ? (
        <div className="p-12 text-center text-sm text-[#686270] bg-white rounded-3xl border border-[#35313A]/10">
          Compiling report summary...
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#35313A]/15 shadow-sm space-y-8 font-sans print:border-none print:p-0 print:shadow-none text-[#35313A]">
          {/* Header of Report */}
          <div className="border-b-2 border-[#35313A] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#35313A]">
                  MORROW
                </span>
                <span className="text-xs uppercase font-semibold text-[#686270] tracking-widest">
                  · Patient Health Summary
                </span>
              </div>
              <p className="text-xs text-[#686270] mt-1">
                Prepared for Clinical Consultation & Care Plan Review
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-[#686270] space-y-0.5">
              <p>
                <strong className="text-[#35313A]">Date Range:</strong> {reportData.period.startDate} to {reportData.period.endDate}
              </p>
              <p>
                <strong className="text-[#35313A]">Days Documented:</strong> {reportData.period.daysTracked} days
              </p>
              <p>
                <strong className="text-[#35313A]">Generated:</strong> {new Date(reportData.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Patient Details & Clinical Baseline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF8F3] border border-[#35313A]/10 text-xs">
            <div>
              <h4 className="font-semibold text-sm text-[#35313A] uppercase tracking-wider mb-1">
                Patient Demographics
              </h4>
              <p>
                <strong>Name:</strong> {reportData.patient.name} ({reportData.patient.pronouns})
              </p>
              <p>
                <strong>Age:</strong> {reportData.patient.age}
              </p>
              <p className="mt-1">
                <strong>Current Conditions:</strong> {reportData.patient.conditions.join(', ')}
              </p>
              <p className="text-[#686270] mt-0.5">
                <strong>Allergies / Sensitivities:</strong> {reportData.patient.allergies.join(', ') || 'None recorded'}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-[#35313A] uppercase tracking-wider mb-1">
                Patient Self-Reported Goals
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-[#686270]">
                {reportData.patient.goals.map((g: string, i: number) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 1. Executive Summary & Metrics */}
          {sections.includes('summary') && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold border-b border-[#35313A]/20 pb-1 text-[#35313A]">
                1. Executive Baseline Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white border border-[#35313A]/15 rounded-xl">
                  <p className="text-[10px] uppercase text-[#686270]">Avg Nightly Sleep</p>
                  <p className="font-serif text-2xl font-bold text-[#35313A] mt-0.5">
                    {reportData.metrics.avgSleep}h
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#35313A]/15 rounded-xl">
                  <p className="text-[10px] uppercase text-[#686270]">Avg Pain Score</p>
                  <p className="font-serif text-2xl font-bold text-[#574665] mt-0.5">
                    {reportData.metrics.avgPain} <span className="text-xs font-normal">/10</span>
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#35313A]/15 rounded-xl">
                  <p className="text-[10px] uppercase text-[#686270]">Avg Energy Capacity</p>
                  <p className="font-serif text-2xl font-bold text-[#35313A] mt-0.5">
                    {reportData.metrics.avgEnergy} <span className="text-xs font-normal">/10</span>
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#35313A]/15 rounded-xl">
                  <p className="text-[10px] uppercase text-[#686270]">Med Adherence Rate</p>
                  <p className="font-serif text-2xl font-bold text-emerald-800 mt-0.5">
                    {reportData.metrics.adherenceRate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Symptom Frequency & Severity Table */}
          {sections.includes('symptoms') && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold border-b border-[#35313A]/20 pb-1 text-[#35313A]">
                2. Symptom Episodes & Severity Trends
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#35313A]/20 text-[#686270]">
                    <th className="py-2">Symptom</th>
                    <th className="py-2">Frequency</th>
                    <th className="py-2">Avg Severity</th>
                    <th className="py-2">Common Triggers / Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35313A]/10">
                  {reportData.symptomSummary?.map((s: any, idx: number) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2 font-medium text-[#35313A]">{s.name}</td>
                      <td className="py-2 text-[#686270]">{s.count} episodes</td>
                      <td className="py-2 font-semibold text-[#574665]">{s.averageSeverity} / 10</td>
                      <td className="py-2 text-[#686270]">Sleep &lt; 6.2h, Computer work &gt; 45m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Active Medications */}
          {sections.includes('medications') && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold border-b border-[#35313A]/20 pb-1 text-[#35313A]">
                3. Medication Regimen & Adherence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {reportData.medications?.map((m: any) => (
                  <div key={m.id} className="p-3 border border-[#35313A]/10 rounded-xl bg-[#FAF8F3]/50">
                    <p className="font-semibold text-sm text-[#35313A]">
                      {m.name} — {m.dosage}
                    </p>
                    <p className="text-[#686270] mt-0.5">
                      Schedule: {m.frequency} ({m.timeOfDay.join(', ')})
                    </p>
                    <p className="text-[#686270]">
                      Purpose: <span className="italic">{m.purpose}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Observed Associations & Pacing */}
          {sections.includes('energy') && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold border-b border-[#35313A]/20 pb-1 text-[#35313A]">
                4. Correlated Patterns & Pacing Observations
              </h3>
              <div className="space-y-2 text-xs text-[#686270]">
                {reportData.insights?.map((ins: any) => (
                  <div key={ins.id} className="p-3 border border-[#35313A]/10 rounded-xl bg-white">
                    <p className="font-semibold text-sm text-[#35313A]">{ins.title}</p>
                    <p className="mt-0.5">{ins.observation}</p>
                    <p className="text-[11px] text-[#9B94A4] mt-1">{ins.detailedAnalysis}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Discussion Questions for Provider */}
          {sections.includes('questions') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#35313A]/20 pb-1">
                <Sparkles className="w-4 h-4 text-[#574665]" />
                <h3 className="font-serif text-lg font-bold text-[#35313A]">
                  5. Suggested Discussion Points for Healthcare Provider
                </h3>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs text-[#35313A] leading-relaxed">
                {reportData.questionsForDoctor?.map((q: string, idx: number) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-[#EEE9F7]/40 border border-[#DCD5F2]/60">
                    <span className="font-medium">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Clinical Disclaimer Sign-off */}
          <div className="pt-6 border-t border-[#35313A]/20 text-[11px] text-[#9B94A4] leading-relaxed">
            <p>
              This report is generated by Morrow based on patient-logged symptom episodes, sleep logs, and medication tracking. It is intended to assist medical professionals during clinical evaluation and does not constitute a diagnostic claim or medical prescription.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
