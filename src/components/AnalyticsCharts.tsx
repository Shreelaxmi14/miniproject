import React from 'react';
import { ThumbsUp, Minus, ThumbsDown, BarChart3, PieChart } from 'lucide-react';

interface AnalyticsChartsProps {
  categoryCounts: Record<string, number>;
  deptStats: Record<string, { events: number; registrations: number }>;
  sentimentCounts: { positive: number; neutral: number; negative: number };
  totalRegistrations: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  categoryCounts,
  deptStats,
  sentimentCounts,
  totalRegistrations
}) => {
  // Category chart computation
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...categories.map(c => c[1]), 1);

  // Department participation computation
  const departments = Object.entries(deptStats)
    .sort((a, b) => b[1].registrations - a[1].registrations)
    .slice(0, 6);
  const maxDeptRegs = Math.max(...departments.map(d => d[1].registrations), 1);

  // Sentiment percentages
  const totalSentiment =
    sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;
  const positivePct = Math.round((sentimentCounts.positive / totalSentiment) * 100);
  const neutralPct = Math.round((sentimentCounts.neutral / totalSentiment) * 100);
  const negativePct = Math.max(0, 100 - positivePct - neutralPct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Category Popularity Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Event Distribution by Category</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active campus programs across domains
              </p>
            </div>
          </div>

          <div className="space-y-3.5 mt-2">
            {categories.map(([cat, count]) => {
              const widthPct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {count} {count === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          Showing real-time campus event categorizations
        </div>
      </div>

      {/* 2. Department-wise Participation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Department-wise Student Turnout</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total event registrations by hosting department
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            {departments.map(([deptName, stats]) => {
              const widthPct = Math.round((stats.registrations / maxDeptRegs) * 100);
              return (
                <div key={deptName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[190px]" title={deptName}>
                      {deptName}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {stats.registrations} regs · {stats.events} evts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Total Student Registrations:</span>
          <span className="font-bold text-slate-900 tabular-nums">{totalRegistrations}</span>
        </div>
      </div>

      {/* 3. Feedback Sentiment Polarity Analysis */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-purple-600" />
                <span>AI Feedback Sentiment Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Natural Language polarity from attendee reviews
              </p>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-5">
            <div
              style={{ width: `${positivePct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Positive: ${positivePct}%`}
            />
            <div
              style={{ width: `${neutralPct}%` }}
              className="bg-slate-400 transition-all duration-500"
              title={`Neutral: ${neutralPct}%`}
            />
            <div
              style={{ width: `${negativePct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Critical: ${negativePct}%`}
            />
          </div>

          {/* Breakdown Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-900">Positive Feedback</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 tabular-nums">
                  {sentimentCounts.positive} reviews ({positivePct}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800">Neutral Observations</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {sentimentCounts.neutral} reviews ({neutralPct}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-900">Critical / Improvement</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-700 tabular-nums">
                  {sentimentCounts.negative} reviews ({negativePct}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Lexicon Engine:</span>
          <span className="font-medium text-slate-800">VADER & Polarity Classification</span>
        </div>
      </div>
    </div>
  );
};
