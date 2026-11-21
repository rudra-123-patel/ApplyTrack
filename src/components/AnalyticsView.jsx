import { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Building2,
  PieChart as PieIcon,
  BarChart2,
  Layers,
  Award,
  XCircle,
  Target,
  Sparkles,
  Activity
} from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { useTheme } from '../hooks/useTheme';
import { 
  getOverviewMetrics, 
  getStatusDistribution, 
  getMonthlyActivity, 
  getApplicationTrend, 
  getJobRoleBreakdown, 
  getCompanyBreakdown, 
  getInsights 
} from '../utils/analytics';

// 1. Tooltip for Donut Chart (Status Distribution)
function StatusTooltip({ active, payload, isDark }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`p-2.5 rounded-lg shadow-xl text-xs border backdrop-blur-xs transition-all ${
        isDark 
          ? 'bg-[#18191D]/95 border-[#2B2D34] text-white shadow-black/40' 
          : 'bg-white/95 border-[#E4E4E7] text-[#18181B] shadow-zinc-900/10'
      }`}>
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full shrink-0" 
            style={{ backgroundColor: data.payload.color }} 
          />
          <span className="font-medium">{data.name}:</span>
          <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
            {data.value}
          </span>
          <span className={`text-[10px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
            ({data.payload.percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
}

// 2. Tooltip for Monthly Submissions Bar Chart
function MonthlyTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-xl text-xs space-y-1.5 border backdrop-blur-xs min-w-[150px] ${
        isDark 
          ? 'bg-[#18191D]/95 border-[#2B2D34] text-white shadow-black/40' 
          : 'bg-white/95 border-[#E4E4E7] text-[#18181B] shadow-zinc-900/10'
      }`}>
        <p className={`font-semibold pb-1 border-b text-[11px] uppercase tracking-wider ${
          isDark ? 'border-[#26282E] text-white' : 'border-[#E4E4E7] text-[#18181B]'
        }`}>
          {label}
        </p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-600'}`}>
              <span 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              {item.name}:
            </span>
            <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// 3. Tooltip for Trend Area Chart
function TrendTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-xl text-xs space-y-1.5 border backdrop-blur-xs min-w-[150px] ${
        isDark 
          ? 'bg-[#18191D]/95 border-[#2B2D34] text-white shadow-black/40' 
          : 'bg-white/95 border-[#E4E4E7] text-[#18181B] shadow-zinc-900/10'
      }`}>
        <p className={`font-semibold pb-1 border-b text-[11px] uppercase tracking-wider ${
          isDark ? 'border-[#26282E] text-white' : 'border-[#E4E4E7] text-[#18181B]'
        }`}>
          {label}
        </p>
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className={isDark ? 'text-[#8E929B]' : 'text-zinc-600'}>
            Cumulative Applications:
          </span>
          <span className="font-mono font-bold text-[#7C3AED]">
            {payload[0].value}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

// Chart Empty State Placeholder
function ChartEmptyState({ icon: Icon, title, description, isDark }) {
  return (
    <div className={`h-48 rounded-lg border border-dashed flex flex-col items-center justify-center p-4 text-center ${
      isDark ? 'border-[#23252A] bg-[#141518]/50' : 'border-zinc-200 bg-zinc-50/50'
    }`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
        isDark ? 'bg-[#1E2025] text-[#5F636E]' : 'bg-zinc-100 text-zinc-400'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className={`text-xs font-medium ${isDark ? 'text-[#EDEDED]' : 'text-zinc-700'}`}>
        {title}
      </p>
      <p className={`text-[11px] mt-0.5 max-w-[220px] ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
        {description}
      </p>
    </div>
  );
}

export default function AnalyticsView() {
  const { applications } = useApplications();
  const { isDark } = useTheme();

  // Pure calculations separated from UI components
  const metrics = useMemo(() => getOverviewMetrics(applications), [applications]);
  const statusData = useMemo(() => getStatusDistribution(applications), [applications]);
  const monthlyData = useMemo(() => getMonthlyActivity(applications), [applications]);
  const trendData = useMemo(() => getApplicationTrend(applications), [applications]);
  const roleBreakdown = useMemo(() => getJobRoleBreakdown(applications, 5), [applications]);
  const companyBreakdown = useMemo(() => getCompanyBreakdown(applications, 5), [applications]);
  const insights = useMemo(() => getInsights(applications), [applications]);

  const hasData = applications.length > 0;

  return (
    <div className="space-y-4">
      {/* Analytics Page Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border transition-all ${
        isDark 
          ? 'bg-[#18191D] border-[#23252A]' 
          : 'bg-white border-[#E4E4E7] shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            isDark 
              ? 'bg-[#202227] border-[#2B2D34] text-[#7C3AED]' 
              : 'bg-purple-50 border-purple-200 text-[#7C3AED]'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm sm:text-base font-semibold tracking-tight ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                Pipeline Analytics & Insights
              </h1>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-medium ${
                isDark 
                  ? 'bg-[#141518] border-[#23252A] text-[#8E929B]' 
                  : 'bg-zinc-100 border-zinc-200 text-zinc-600'
              }`}>
                {metrics.total} tracked positions
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${
              isDark ? 'text-[#8E929B]' : 'text-zinc-500'
            }`}>
              Real-time funnel conversion, activity velocity, and pipeline intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
            isDark 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cloud Synchronized</span>
          </span>
        </div>
      </div>

      {/* 1. Overview KPI Statistics (6 cards) */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Card 1: Total Applications */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840]' 
              : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
              }`}>
                Total
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                isDark ? 'bg-[#202227] text-purple-300' : 'bg-purple-50 text-[#7C3AED]'
              }`}>
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono tracking-tight mt-2 ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              {metrics.total}
            </p>
            <span className={`text-[10px] mt-0.5 block truncate ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`}>
              {metrics.total > 0 ? 'All recorded entries' : 'No entries logged'}
            </span>
          </div>

          {/* Card 2: Interviews */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840]' 
              : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
              }`}>
                Interviews
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                isDark ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-[#7C3AED]'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono tracking-tight mt-2 text-[#7C3AED] dark:text-purple-300">
              {metrics.interviewCount}
            </p>
            <span className={`text-[10px] mt-0.5 block truncate ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`}>
              {metrics.total > 0 ? `${Math.round((metrics.interviewCount / metrics.total) * 100)}% of pipeline` : '0%'}
            </span>
          </div>

          {/* Card 3: Offers Received */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840]' 
              : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
              }`}>
                Offers
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono tracking-tight mt-2 text-emerald-600 dark:text-emerald-400">
              {metrics.offersReceived}
            </p>
            <span className={`text-[10px] mt-0.5 block truncate ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`}>
              Confirmed offers
            </span>
          </div>

          {/* Card 4: Rejections */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840]' 
              : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
              }`}>
                Rejections
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                isDark ? 'bg-zinc-500/10 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
              }`}>
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono tracking-tight mt-2 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              {metrics.rejectionCount}
            </p>
            <span className={`text-[10px] mt-0.5 block truncate ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`}>
              Closed positions
            </span>
          </div>

          {/* Card 5: Interview Conversion Rate */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840]' 
              : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
              }`}>
                Interview Rate
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}>
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono tracking-tight mt-2 ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              {metrics.interviewConversionRate}%
            </p>
            <span className={`text-[10px] mt-0.5 block truncate ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`} title="(Interviews + Offers) / Total">
              Interview or offer
            </span>
          </div>

          {/* Card 6: Offer Conversion Rate */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840]' 
              : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
              }`}>
                Offer Rate
              </span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono tracking-tight mt-2 text-emerald-600 dark:text-emerald-400">
              {metrics.offerConversionRate}%
            </p>
            <span className={`text-[10px] mt-0.5 block truncate ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`} title="Offers / Total">
              Offers from total
            </span>
          </div>

        </div>
      </section>

      {/* Row 1: Status Distribution (Donut Chart) & Monthly Activity (Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Status Distribution Donut (5 cols) */}
        <div className={`lg:col-span-5 p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
          isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isDark ? 'bg-[#202227] text-[#7C3AED]' : 'bg-purple-50 text-[#7C3AED]'
                }`}>
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    Status Distribution
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Active pipeline breakdown
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#141518] border-[#23252A] text-[#8E929B]' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
              }`}>
                {metrics.total} total
              </span>
            </div>

            {/* Donut Chart Visual */}
            <div className="relative h-48 sm:h-52 my-3 flex items-center justify-center">
              {hasData && statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        animationDuration={600}
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            className="hover:opacity-85 transition cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusTooltip isDark={isDark} />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={`text-2xl font-bold font-mono tracking-tight ${
                      isDark ? 'text-white' : 'text-[#18181B]'
                    }`}>
                      {metrics.total}
                    </span>
                    <span className={`text-[10px] font-medium tracking-wider uppercase ${
                      isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                    }`}>
                      Positions
                    </span>
                  </div>
                </>
              ) : (
                <ChartEmptyState
                  icon={PieIcon}
                  title="No application data"
                  description="Add job applications to view the active pipeline distribution."
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          {/* Status Breakdown Legend (5 Stage Cards) */}
          <div className={`grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-3 border-t ${
            isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
          }`}>
            {hasData && statusData.length > 0 ? (
              statusData.map((item) => (
                <div 
                  key={item.name} 
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                    isDark 
                      ? 'bg-[#141518] border-[#23252A] hover:border-[#363840]' 
                      : 'bg-[#F8F9FC] border-[#E4E4E7] hover:border-zinc-300'
                  }`}
                >
                  <div className={`flex items-center gap-1 text-[10px] font-medium truncate max-w-full ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    <span 
                      className="w-1.5 h-1.5 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
                      {item.value}
                    </span>
                    <span className={`text-[9px] ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <span className={`text-[11px] col-span-5 text-center py-2 ${
                isDark ? 'text-[#5F636E]' : 'text-zinc-400'
              }`}>
                No pipeline data recorded yet
              </span>
            )}
          </div>
        </div>

        {/* Monthly Submissions Bar Chart (7 cols) */}
        <div className={`lg:col-span-7 p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
          isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isDark ? 'bg-[#202227] text-[#7C3AED]' : 'bg-purple-50 text-[#7C3AED]'
                }`}>
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    Monthly Application Submissions
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Applications submitted vs. interviews progressed
                  </p>
                </div>
              </div>

              {/* Legend with matching colors */}
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1.5 font-medium ${
                  isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#7C3AED]" />
                  Applications
                </span>
                <span className={`flex items-center gap-1.5 font-medium ${
                  isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                  Interviews
                </span>
              </div>
            </div>

            {/* Bar Chart Visual */}
            <div className="h-48 sm:h-52 my-3 flex items-center justify-center">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? '#23252A' : '#F1F2F6'} 
                      vertical={false} 
                    />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDark ? '#474A54' : '#CBD5E1'} 
                      tick={{ fill: isDark ? '#8E929B' : '#71717A', fontSize: 11 }} 
                      tickLine={false}
                      axisLine={{ stroke: isDark ? '#23252A' : '#E4E4E7' }}
                    />
                    <YAxis 
                      stroke={isDark ? '#474A54' : '#CBD5E1'} 
                      tick={{ fill: isDark ? '#8E929B' : '#71717A', fontSize: 11 }} 
                      tickLine={false}
                      axisLine={{ stroke: isDark ? '#23252A' : '#E4E4E7' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      content={<MonthlyTooltip isDark={isDark} />} 
                      cursor={{ fill: isDark ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.05)', radius: 4 }} 
                    />
                    <Bar 
                      dataKey="applications" 
                      name="Applications" 
                      fill="#7C3AED" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={18}
                      animationDuration={600}
                    />
                    <Bar 
                      dataKey="interviews" 
                      name="Interviews" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={18}
                      animationDuration={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState
                  icon={BarChart2}
                  title="No monthly timeline"
                  description="Monthly application and interview metrics will populate as applications are submitted."
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
            isDark ? 'border-[#23252A] text-[#5F636E]' : 'border-[#E4E4E7] text-zinc-500'
          }`}>
            <span>Chronological breakdown from applied dates</span>
            <span className="font-mono">{monthlyData.length} active periods</span>
          </div>
        </div>

      </div>

      {/* Row 2: Cumulative Trend (Area Chart) & Job Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Cumulative Application Trend (6 cols) */}
        <div className={`lg:col-span-6 p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
          isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isDark ? 'bg-[#202227] text-[#7C3AED]' : 'bg-purple-50 text-[#7C3AED]'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    Cumulative Application Trajectory
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Growth velocity and cumulative submission timeline
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#141518] border-[#23252A] text-[#8E929B]' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
              }`}>
                {metrics.total} cumulative
              </span>
            </div>

            {/* Area Chart Visual */}
            <div className="h-48 sm:h-52 my-3 flex items-center justify-center">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="areaTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={isDark ? 0.35 : 0.22} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? '#23252A' : '#F1F2F6'} 
                      vertical={false} 
                    />
                    <XAxis 
                      dataKey="period" 
                      stroke={isDark ? '#474A54' : '#CBD5E1'} 
                      tick={{ fill: isDark ? '#8E929B' : '#71717A', fontSize: 11 }} 
                      tickLine={false}
                      axisLine={{ stroke: isDark ? '#23252A' : '#E4E4E7' }}
                    />
                    <YAxis 
                      stroke={isDark ? '#474A54' : '#CBD5E1'} 
                      tick={{ fill: isDark ? '#8E929B' : '#71717A', fontSize: 11 }} 
                      tickLine={false}
                      axisLine={{ stroke: isDark ? '#23252A' : '#E4E4E7' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<TrendTooltip isDark={isDark} />} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      name="Cumulative Total"
                      stroke="#7C3AED"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#areaTrendGradient)"
                      animationDuration={600}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState
                  icon={TrendingUp}
                  title="No trajectory data"
                  description="Cumulative trend will chart application volume across past and future months."
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
            isDark ? 'border-[#23252A] text-[#5F636E]' : 'border-[#E4E4E7] text-zinc-500'
          }`}>
            <span>Aggregated cumulative volume</span>
            <span className="font-mono">Peak: {metrics.total} positions</span>
          </div>
        </div>

        {/* Top Job Roles Applied (6 cols) */}
        <div className={`lg:col-span-6 p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
          isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isDark ? 'bg-[#202227] text-[#7C3AED]' : 'bg-purple-50 text-[#7C3AED]'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    Top Target Roles
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Most frequent role titles submitted
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#141518] border-[#23252A] text-[#8E929B]' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
              }`}>
                {roleBreakdown.length} roles shown
              </span>
            </div>

            {/* Roles Progress List */}
            <div className="space-y-3.5 my-3.5">
              {roleBreakdown.length > 0 ? (
                roleBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium truncate max-w-[280px] sm:max-w-[340px] ${
                        isDark ? 'text-[#EDEDED]' : 'text-zinc-800'
                      }`} title={item.role}>
                        {item.role}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono">
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
                          {item.count}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
                          ({item.percent}%)
                        </span>
                      </div>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden border ${
                      isDark 
                        ? 'bg-[#141518] border-[#23252A]' 
                        : 'bg-zinc-100 border-zinc-200'
                    }`}>
                      <div 
                        className="bg-gradient-to-r from-[#7C3AED] to-[#9061F9] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.percent, 8)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <ChartEmptyState
                  icon={Briefcase}
                  title="No job roles tracked"
                  description="Target role frequencies will appear here as positions are logged."
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
            isDark ? 'border-[#23252A] text-[#5F636E]' : 'border-[#E4E4E7] text-zinc-500'
          }`}>
            <span>Role frequency across submissions</span>
            <span>Normalized breakdown</span>
          </div>
        </div>

      </div>

      {/* Row 3: Company Breakdown & Automated Pipeline Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Top Companies Targeted (6 cols) */}
        <div className={`lg:col-span-6 p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
          isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isDark ? 'bg-[#202227] text-[#7C3AED]' : 'bg-purple-50 text-[#7C3AED]'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    Leading Target Companies
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Companies receiving multiple submissions
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDark ? 'bg-[#141518] border-[#23252A] text-[#8E929B]' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
              }`}>
                {companyBreakdown.length} companies listed
              </span>
            </div>

            {/* Company List */}
            <div className="space-y-2 my-3">
              {companyBreakdown.length > 0 ? (
                companyBreakdown.map((comp, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                      isDark 
                        ? 'bg-[#141518] border-[#23252A] hover:border-[#363840]' 
                        : 'bg-[#F8F9FC] border-[#E4E4E7] hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDark 
                          ? 'bg-[#202227] border-[#2B2D34] text-white' 
                          : 'bg-white border-zinc-200 text-zinc-800 shadow-xs'
                      }`}>
                        {comp.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${
                          isDark ? 'text-white' : 'text-[#18181B]'
                        }`}>
                          {comp.company}
                        </p>
                        <p className={`text-[10px] truncate ${
                          isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                        }`}>
                          {comp.roles.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className={`text-xs font-bold ${
                        isDark ? 'text-white' : 'text-[#18181B]'
                      }`}>
                        {comp.count} {comp.count === 1 ? 'app' : 'apps'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        isDark 
                          ? 'bg-[#1E2025] border-[#2B2D34] text-[#8E929B]' 
                          : 'bg-white border-zinc-200 text-zinc-600 shadow-xs'
                      }`}>
                        {comp.percent}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <ChartEmptyState
                  icon={Building2}
                  title="No companies tracked"
                  description="Companies with submitted applications will rank by volume here."
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
            isDark ? 'border-[#23252A] text-[#5F636E]' : 'border-[#E4E4E7] text-zinc-500'
          }`}>
            <span>Ranked by submission volume</span>
            <span>Top targets</span>
          </div>
        </div>

        {/* Automated Pipeline Insights (6 cols) */}
        <div className={`lg:col-span-6 p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
          isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isDark ? 'bg-[#202227] text-[#7C3AED]' : 'bg-purple-50 text-[#7C3AED]'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    Automated Pipeline Insights
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Real-time pattern analysis from stored submissions
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                Live calculation
              </span>
            </div>

            {/* 2x2 Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
              
              {/* Insight 1: Primary Target Role */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isDark 
                  ? 'bg-[#141518] border-[#23252A] hover:border-[#363840]' 
                  : 'bg-[#F8F9FC] border-[#E4E4E7] hover:border-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                  }`}>
                    Primary Target Role
                  </span>
                  <Briefcase className="w-3.5 h-3.5 text-[#7C3AED]" />
                </div>
                <div className="mt-2.5">
                  <p className={`text-xs sm:text-sm font-bold truncate ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`} title={insights.mostAppliedRole?.role || 'No role data'}>
                    {insights.mostAppliedRole ? insights.mostAppliedRole.role : 'No role data'}
                  </p>
                  <p className={`text-[10px] mt-0.5 truncate ${
                    isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                  }`}>
                    {insights.mostAppliedRole 
                      ? `${insights.mostAppliedRole.count} applications (${insights.mostAppliedRole.percent}% of total)` 
                      : 'Awaiting submissions'}
                  </p>
                </div>
              </div>

              {/* Insight 2: Total Interviews */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isDark 
                  ? 'bg-[#141518] border-[#23252A] hover:border-[#363840]' 
                  : 'bg-[#F8F9FC] border-[#E4E4E7] hover:border-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                  }`}>
                    Total Interviews
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="mt-2.5">
                  <p className={`text-xs sm:text-sm font-bold ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    {insights.totalInterviews} Active Stages
                  </p>
                  <p className={`text-[10px] mt-0.5 truncate ${
                    isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                  }`}>
                    {insights.totalInterviews > 0
                      ? `${insights.interviewConversionRate}% of submissions progressed`
                      : 'No interview rounds recorded'}
                  </p>
                </div>
              </div>

              {/* Insight 3: Current Interview Conversion Rate */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isDark 
                  ? 'bg-[#141518] border-[#23252A] hover:border-[#363840]' 
                  : 'bg-[#F8F9FC] border-[#E4E4E7] hover:border-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                  }`}>
                    Interview Conversion
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2.5">
                  <p className={`text-xs sm:text-sm font-bold ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`}>
                    {insights.interviewConversionRate}%
                  </p>
                  <p className={`text-[10px] mt-0.5 truncate ${
                    isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                  }`}>
                    Reached interview or offer status
                  </p>
                </div>
              </div>

              {/* Insight 4: Most Recent Activity */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isDark 
                  ? 'bg-[#141518] border-[#23252A] hover:border-[#363840]' 
                  : 'bg-[#F8F9FC] border-[#E4E4E7] hover:border-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                  }`}>
                    Latest Submission
                  </span>
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-2.5">
                  <p className={`text-xs sm:text-sm font-bold truncate ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`} title={insights.mostRecentActivity ? `${insights.mostRecentActivity.company} (${insights.mostRecentActivity.role})` : 'No recent activity'}>
                    {insights.mostRecentActivity 
                      ? `${insights.mostRecentActivity.company}` 
                      : 'No recent activity'}
                  </p>
                  <p className={`text-[10px] mt-0.5 truncate ${
                    isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                  }`}>
                    {insights.mostRecentActivity 
                      ? `Applied ${insights.mostRecentActivity.date}` 
                      : 'Submit an application to view'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
            isDark ? 'border-[#23252A] text-[#5F636E]' : 'border-[#E4E4E7] text-zinc-500'
          }`}>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Calculated from stored records
            </span>
            <span>Real-time intelligence</span>
          </div>
        </div>

      </div>
    </div>
  );
}
