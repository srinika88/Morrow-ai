import React from 'react';
import {
  Sparkles,
  Compass,
  ArrowRight,
  TrendingDown,
  Info,
  Calendar,
  CheckCircle,
  HelpCircle,
  Share2
} from 'lucide-react';
import { HealthInsight } from '../types/index.js';
import { NavTab } from '../components/Navigation.js';

interface InsightsViewProps {
  insights: HealthInsight[];
  onNavigateToCompanion: (prompt?: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  insights,
  onNavigateToCompanion
}) => {
  const getConfidenceBadge = (confidence: HealthInsight['confidence']) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            High Evidence ({confidence})
          </span>
        );
      case 'moderate':
        return (
          <span className="text-[11px] font-semibold text-[#574665] bg-[#EEE9F7] px-2.5 py-0.5 rounded-md border border-[#DCD5F2]">
            Moderate Pattern
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
            Emerging Correlation
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
          Personal Health Insights
        </h2>
        <p className="text-sm text-[#686270] mt-1">
          Algorithmic pattern detection across your symptoms, restorative sleep, pacing intervals, and medication adherence.
        </p>
      </div>

      {/* Epistemological Transparency Notice */}
      <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#35313A]/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#574665] shrink-0 mt-0.5" />
        <div className="text-xs text-[#686270] leading-relaxed">
          <strong className="text-[#35313A] font-semibold">Correlation vs. Causation:</strong>{' '}
          Morrow analyzes authorized historical records to uncover mathematical associations in your data. While statistical correlations can highlight personal trends and help you prepare questions for your doctor, they are not diagnostic conclusions. Always discuss medical adjustments with your physician.
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="space-y-6">
        {insights.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#686270] bg-white rounded-3xl border border-[#35313A]/10">
            Morrow is compiling your initial baseline. Continue recording daily check-ins and symptoms to reveal patterns!
          </div>
        ) : (
          insights.map((ins) => (
            <div
              key={ins.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-[#35313A]/10 shadow-xs space-y-5 hover:border-[#574665]/25 transition-all"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#35313A]/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#574665]">
                    {ins.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-[#9B94A4]">·</span>
                  <span className="text-xs text-[#686270] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ins.periodDescription}
                  </span>
                </div>
                <div>{getConfidenceBadge(ins.confidence)}</div>
              </div>

              {/* Observation & Analysis */}
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-semibold text-[#35313A] leading-snug">
                  {ins.title}
                </h3>
                <p className="font-serif text-lg text-[#574665] leading-relaxed">
                  "{ins.observation}"
                </p>
                <p className="text-sm text-[#686270] leading-relaxed pt-1">
                  {ins.detailedAnalysis}
                </p>
              </div>

              {/* Supporting Evidence Metrics */}
              {ins.supportingData && ins.supportingData.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#35313A]/5 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#35313A]">
                    Supporting Historical Records ({ins.occurrencesCount} occurrences detected)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {ins.supportingData.map((data, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-[#35313A]/5">
                        <p className="text-[11px] text-[#686270] truncate">{data.label}</p>
                        <p className="font-serif text-base font-semibold text-[#35313A] mt-0.5">
                          {data.value}
                        </p>
                        {data.dates && data.dates.length > 0 && (
                          <p className="text-[10px] text-[#9B94A4] mt-1 truncate">
                            Dates: {data.dates.slice(0, 3).join(', ')}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Suggestion */}
              {ins.actionableSuggestion && (
                <div className="p-4 rounded-2xl bg-[#DCE7D8]/40 border border-[#DCE7D8] flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div className="text-xs text-[#35313A]">
                    <strong className="font-semibold">Gentle Pacing Suggestion:</strong>{' '}
                    {ins.actionableSuggestion}
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#35313A]/5">
                <span className="text-[11px] text-[#9B94A4] italic">
                  {ins.nonClinicalNote}
                </span>

                <button
                  onClick={() =>
                    onNavigateToCompanion(
                      `I want to understand the pattern where "${ins.observation}". Can you help me unpack this?`
                    )
                  }
                  className="py-2 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] text-xs font-medium hover:bg-[#3E324A] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discuss Pattern with Morrow</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
