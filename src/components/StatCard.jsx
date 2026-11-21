import { useTheme } from '../hooks/useTheme';

export default function StatCard({ 
  title, 
  value, 
  subtext 
}) {
  const { isDark } = useTheme();

  return (
    <div className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
      isDark
        ? 'bg-[#18191D] border-[#23252A] hover:border-[#32353D]'
        : 'bg-white border-[#E4E4E7] shadow-xs hover:border-zinc-300'
    }`}>
      <p className={`text-xs font-medium tracking-wide truncate ${
        isDark ? 'text-[#8E929B]' : 'text-zinc-500'
      }`}>
        {title}
      </p>
      <div className="mt-1.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${
          isDark ? 'text-white' : 'text-[#18181B]'
        }`}>
          {value}
        </span>
        {subtext && (
          <span className={`text-[11px] font-medium truncate ${
            isDark ? 'text-[#5F636E]' : 'text-zinc-400'
          }`}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
