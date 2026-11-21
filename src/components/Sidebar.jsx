import { 
  LayoutDashboard, 
  Briefcase, 
  Kanban, 
  BarChart3, 
  Settings, 
  X,
  Layers,
  User,
  LogOut,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Sidebar({ 
  activeNav, 
  setActiveNav, 
  isOpen, 
  onClose,
  applicationsCount = 0 
}) {
  const { user, signOut, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Applications', label: 'Applications', icon: Briefcase, badge: applicationsCount > 0 ? String(applicationsCount) : null },
    { id: 'Kanban Board', label: 'Kanban Board', icon: Kanban },
    { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 border-r flex flex-col justify-between transition-all duration-200 ease-out lg:translate-x-0 ${
          isDark 
            ? 'bg-[#141518] border-[#23252A]' 
            : 'bg-white border-[#E4E4E7]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand & Workspace */}
        <div>
          <div className={`h-14 px-4 flex items-center justify-between border-b ${
            isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-md border flex items-center justify-center text-[#7C3AED] ${
                isDark ? 'bg-[#1C1E23] border-[#2B2D34]' : 'bg-purple-50 border-purple-200'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className={`font-semibold text-sm tracking-tight ${
                  isDark ? 'text-white' : 'text-[#18181B]'
                }`}>
                  ApplyTrack
                </span>
                <p className={`text-[11px] ${
                  isDark ? 'text-[#5F636E]' : 'text-zinc-500'
                }`}>
                  Job Search Hub
                </p>
              </div>
            </div>

            {/* Mobile Close Button - Touch Friendly */}
            <button 
              onClick={onClose}
              className={`lg:hidden w-8 h-8 rounded-md flex items-center justify-center transition cursor-pointer ${
                isDark 
                  ? 'text-[#8E929B] hover:text-white hover:bg-[#1E1F24]' 
                  : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3">
            <p className={`text-[10px] font-medium tracking-wider uppercase px-2 mb-1.5 ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`}>
              Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? isDark
                          ? 'bg-[#22242A] text-white border-l-2 border-[#7C3AED]'
                          : 'bg-purple-50 text-[#7C3AED] border-l-2 border-[#7C3AED] font-semibold'
                        : isDark
                          ? 'text-[#8E929B] hover:bg-[#1A1B20] hover:text-[#EDEDED] border-l-2 border-transparent'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon 
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive 
                            ? 'text-[#7C3AED]' 
                            : isDark ? 'text-[#8E929B]' : 'text-zinc-400'
                        }`} 
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ml-2 ${
                        isActive 
                          ? isDark
                            ? 'bg-[#18191D] text-white'
                            : 'bg-white text-[#7C3AED] shadow-xs border border-purple-200'
                          : isDark
                            ? 'bg-[#1C1E23] text-[#8E929B]'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Workspace Info & Logout at Bottom */}
        <div className={`p-3 border-t space-y-2 ${
          isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
        }`}>
          <div className={`flex items-center justify-between px-2 py-1.5 rounded-md border transition-colors ${
            isDark 
              ? 'bg-[#18191D]/60 border-[#23252A]/60' 
              : 'bg-[#F8F9FC] border-[#E4E4E7]'
          }`}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-medium text-[#7C3AED] shrink-0 ${
                isDark 
                  ? 'bg-[#22242A] border-[#2B2D34]' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : (user?.email ? userInitial : <User className="w-3.5 h-3.5" />)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-medium truncate ${
                    isDark ? 'text-white' : 'text-[#18181B]'
                  }`} title={user?.email || 'Logged in user'}>
                    {user?.email || 'Authenticated User'}
                  </p>
                  {isAdmin && (
                    <span className="text-[9px] bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] px-1 py-0.1 rounded font-mono shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <p className={`text-[10px] truncate ${
                  isDark ? 'text-[#5F636E]' : 'text-zinc-500'
                }`}>
                  {isAdmin ? 'System Administrator' : 'Standard Workspace'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-1.5 rounded transition cursor-pointer ${
                  isDark 
                    ? 'text-[#8E929B] hover:text-[#EDEDED] hover:bg-[#1E1F24]' 
                    : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
                title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleLogout}
                className={`p-1.5 rounded transition cursor-pointer ${
                  isDark 
                    ? 'text-[#8E929B] hover:text-rose-400 hover:bg-rose-500/10' 
                    : 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
