export const getStatusThemeClasses = (status, isDark) => {
  switch (status) {
    case 'Applied':
      return {
        dot: isDark ? 'bg-blue-400' : 'bg-blue-500',
        text: isDark ? 'text-blue-300' : 'text-blue-600',
        badge: isDark ? 'bg-blue-500/10 text-blue-300 border-blue-500/25' : 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'Screening':
      return {
        dot: isDark ? 'bg-amber-400' : 'bg-amber-500',
        text: isDark ? 'text-amber-300' : 'text-amber-700',
        badge: isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/25' : 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'Interview':
      return {
        dot: isDark ? 'bg-purple-400' : 'bg-[#7C3AED]',
        text: isDark ? 'text-purple-300' : 'text-purple-700',
        badge: isDark ? 'bg-purple-500/10 text-purple-300 border-purple-500/25' : 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'Offer':
      return {
        dot: isDark ? 'bg-emerald-400' : 'bg-emerald-500',
        text: isDark ? 'text-emerald-300' : 'text-emerald-700',
        badge: isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'Rejected':
    default:
      return {
        dot: isDark ? 'bg-zinc-400' : 'bg-zinc-400',
        text: isDark ? 'text-zinc-400' : 'text-zinc-600',
        badge: isDark ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25' : 'bg-zinc-100 text-zinc-600 border-zinc-200',
      };
  }
};
