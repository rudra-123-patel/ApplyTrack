import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  onOpenModal, 
  onToggleSidebar 
}) {
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const notifRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: 'Stripe Technical Interview',
      desc: 'System Design round scheduled for tomorrow at 2:00 PM EST.',
      time: '10m ago'
    },
    {
      id: 2,
      title: 'Offer Received from Linear',
      desc: 'Written offer letter received for Staff Product Engineer.',
      time: '2h ago'
    },
    {
      id: 3,
      title: 'Airbnb Status Update',
      desc: 'Advanced to the final interview loop stage.',
      time: '1d ago'
    }
  ];

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xs border-b px-3.5 sm:px-6 py-2.5 transition-colors ${
      isDark ? 'bg-[#0F1012]/95 border-[#23252A]' : 'bg-white/95 border-[#E4E4E7] shadow-xs'
    }`}>
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left Heading & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className={`lg:hidden w-8 h-8 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
              isDark 
                ? 'bg-[#18191D] text-[#8E929B] hover:text-white border-[#23252A]' 
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200'
            }`}
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className={`text-xs sm:text-sm font-semibold tracking-tight truncate ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              Applications Overview
            </h1>
            <p className={`text-[11px] truncate hidden sm:block ${
              isDark ? 'text-[#8E929B]' : 'text-zinc-500'
            }`}>
              Pipeline status and recent submissions
            </p>
          </div>
        </div>

        {/* Right Actions: Search, Notifications, Theme Toggle, Add Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Search Input - responsive width */}
          <div className="relative hidden md:block w-36 sm:w-48 lg:w-60">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter applications..."
              className={`w-full h-8 pl-8 pr-7 rounded-md text-xs border focus:outline-none focus:border-[#7C3AED] transition ${
                isDark
                  ? 'bg-[#141518] text-white placeholder-[#5F636E] border-[#23252A]'
                  : 'bg-[#F4F4F6] text-zinc-900 placeholder-zinc-400 border-[#E4E4E7]'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition cursor-pointer ${
                  isDark ? 'text-[#5F636E] hover:text-white' : 'text-zinc-400 hover:text-zinc-900'
                }`}
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) setUnreadCount(0);
              }}
              className={`relative h-8 w-8 flex items-center justify-center rounded-md border transition cursor-pointer ${
                isDark 
                  ? 'bg-[#141518] text-[#8E929B] hover:text-white border-[#23252A]' 
                  : 'bg-[#F4F4F6] text-zinc-600 hover:text-zinc-900 border-[#E4E4E7]'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#7C3AED] rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-lg border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isDark ? 'bg-[#18191D] border-[#26282E]' : 'bg-white border-[#E4E4E7]'
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${
                  isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
                }`}>
                  <span className={`font-medium text-xs ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Notifications</span>
                  <button 
                    onClick={() => setUnreadCount(0)}
                    className={`text-[11px] transition cursor-pointer ${
                      isDark ? 'text-[#8E929B] hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Mark read
                  </button>
                </div>

                <div className={`divide-y max-h-64 overflow-y-auto mt-1 ${
                  isDark ? 'divide-[#23252A]' : 'divide-[#E4E4E7]'
                }`}>
                  {notifications.map((n) => (
                    <div key={n.id} className={`py-2.5 px-1 rounded transition ${
                      isDark ? 'hover:bg-[#141518]' : 'hover:bg-zinc-50'
                    }`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>{n.title}</p>
                      <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-[#8E929B]' : 'text-zinc-600'}`}>{n.desc}</p>
                      <span className={`text-[10px] mt-1 block ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`h-8 w-8 flex items-center justify-center rounded-md border transition cursor-pointer ${
              isDark 
                ? 'bg-[#141518] text-[#8E929B] hover:text-white border-[#23252A]' 
                : 'bg-[#F4F4F6] text-zinc-600 hover:text-zinc-900 border-[#E4E4E7]'
            }`}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Add Application Button */}
          <button
            onClick={onOpenModal}
            className="h-8 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">Add Application</span>
            <span className="inline xs:hidden sm:hidden">Add</span>
          </button>

        </div>
      </div>
    </header>
  );
}
