import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { statusConfig, calculateMonthlyActivity } from '../data/applications';
import { useTheme } from '../hooks/useTheme';

function CustomPieTooltip({ active, payload, isDark }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`p-2 rounded-md shadow-lg text-[11px] border ${
        isDark ? 'bg-[#18191D] border-[#26282E]' : 'bg-white border-[#E4E4E7]'
      }`}>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>{data.name}:</span>
          <span className={`font-mono ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

function CustomBarTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    return (
      <div className={`p-2.5 rounded-md shadow-xl text-[11px] space-y-1 border ${
        isDark ? 'bg-[#1B1C22] border-[#2E3038]' : 'bg-white border-[#E4E4E7]'
      }`}>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}:
            </span>
            <span className={`font-mono font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ApplicationChart({ applications = [] }) {
  const { isDark } = useTheme();

  // Dynamically calculate status breakdown from current applications state
  const statusData = useMemo(() => {
    const counts = {
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      } else {
        counts.Applied += 1;
      }
    });

    return [
      { name: 'Applied', value: counts.Applied, color: statusConfig.Applied.color },
      { name: 'Screening', value: counts.Screening, color: statusConfig.Screening.color },
      { name: 'Interview', value: counts.Interview, color: statusConfig.Interview.color },
      { name: 'Offer', value: counts.Offer, color: statusConfig.Offer.color },
      { name: 'Rejected', value: counts.Rejected, color: statusConfig.Rejected.color },
    ].filter((item) => item.value > 0);
  }, [applications]);

  // Dynamically calculate monthly activity directly from current applications state
  const dynamicMonthlyActivity = useMemo(() => {
    return calculateMonthlyActivity(applications);
  }, [applications]);

  const totalApplications = applications.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

      {/* Donut Chart: Application Status Overview (5 cols) */}
      <div className={`lg:col-span-5 p-4 rounded-lg border flex flex-col justify-between transition-all ${
        isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xs font-semibold tracking-tight ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              Status Distribution
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
              Breakdown across active pipeline stages
            </p>
          </div>
          <span className={`text-[11px] font-mono ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
            {totalApplications} total
          </span>
        </div>

        {/* Compact Donut */}
        <div className="relative h-44 my-1 flex items-center justify-center">
          {totalApplications > 0 && statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-85 transition cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
                  {totalApplications}
                </span>
                <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
                  Total
                </span>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <p className={`text-xs ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>No active applications recorded</p>
            </div>
          )}
        </div>

        {/* Status Breakdown Legend (5 boxes) */}
        <div className={`grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-2 border-t min-h-[50px] items-center ${
          isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
        }`}>
          {totalApplications > 0 && statusData.length > 0 ? (
            statusData.map((item) => {
              const percent = totalApplications > 0 ? Math.round((item.value / totalApplications) * 100) : 0;
              return (
                <div key={item.name} className={`flex flex-col items-center p-1.5 rounded transition-colors ${
                  isDark ? 'bg-[#131417] border border-[#23252A]/40' : 'bg-[#F8F9FC] border border-[#E4E4E7]'
                }`}>
                  <div className={`flex items-center gap-1 text-[10px] ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                    <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>{item.value}</span>
                    <span className={`text-[10px] ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>{percent}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <span className={`text-[11px] col-span-5 text-center ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
              Add applications to view status distribution
            </span>
          )}
        </div>
      </div>

      {/* Bar Chart: Monthly Activity (7 cols) */}
      <div className={`lg:col-span-7 p-4 rounded-lg border flex flex-col justify-between transition-all ${
        isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xs font-semibold tracking-tight ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              Monthly Submissions
            </h2>
            <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
              Applications submitted vs. interviews progressed
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-600'}`}>
              <span className="w-2 h-2 rounded-xs bg-[#7C3AED]" />
              Applications
            </span>
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-600'}`}>
              <span className="w-2 h-2 rounded-xs bg-[#34D399]" />
              Interviews
            </span>
          </div>
        </div>

        {/* Compact Bar Chart */}
        <div className="h-44 my-1 flex items-center justify-center">
          {dynamicMonthlyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dynamicMonthlyActivity}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#202227' : '#E4E4E7'} vertical={false} />
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
                  content={<CustomBarTooltip isDark={isDark} />} 
                  cursor={{ fill: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(124, 58, 237, 0.06)', radius: 4 }} 
                />
                <Bar
                  dataKey="applications"
                  name="Applications"
                  fill="#7C3AED"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="interviews"
                  name="Interviews"
                  fill="#34D399"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center p-4">
              <p className={`text-xs ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>No timeline submissions found</p>
            </div>
          )}
        </div>

        <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
          isDark ? 'border-[#23252A] text-[#5F636E]' : 'border-[#E4E4E7] text-zinc-500'
        }`}>
          <span>Dynamically calculated from applied dates</span>
          <span>{totalApplications} active applications</span>
        </div>
      </div>

    </div>
  );
}
