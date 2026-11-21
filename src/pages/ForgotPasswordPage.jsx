import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Mail, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Send,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const { setTheme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await resetPasswordForEmail(email.trim());

      if (error) {
        setErrorMessage(error.message || 'Unable to process password reset request.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-center items-center px-4 py-8 transition-colors ${
      isDark ? 'bg-[#0F1012] text-[#EDEDED]' : 'bg-[#F5F6FA] text-[#18181B]'
    }`}>
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`p-2 rounded-lg border transition cursor-pointer ${
            isDark 
              ? 'bg-[#18191D] border-[#26282E] text-zinc-400 hover:text-white hover:bg-[#22242A]' 
              : 'bg-white border-[#E4E4E7] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 shadow-xs'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className={`w-9 h-9 rounded-md border flex items-center justify-center text-[#7C3AED] shadow-sm mb-3 ${
            isDark ? 'bg-[#18191D] border-[#26282E]' : 'bg-white border-[#E4E4E7]'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <h1 className={`text-lg font-semibold tracking-tight ${
            isDark ? 'text-white' : 'text-[#18181B]'
          }`}>
            Recover your password
          </h1>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-[#8E929B]' : 'text-zinc-500'
          }`}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Card Container */}
        <div className={`p-6 rounded-lg border shadow-xl transition-all ${
          isDark 
            ? 'bg-[#18191D] border-[#23252A]' 
            : 'bg-white border-[#E4E4E7] shadow-zinc-900/5'
        }`}>
          {isSubmitted ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-300">Recovery Email Sent</p>
                  <p className="text-[11px] leading-relaxed text-emerald-400/90">
                    If an account exists for <span className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{email.trim()}</span>, you will receive a password reset link shortly.
                  </p>
                  <p className={`text-[10px] pt-1 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Please check both your inbox and Spam / Junk folder.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className={`block text-[11px] font-medium mb-1.5 uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                    }`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      className={`w-full pl-9 pr-3 py-2 border rounded-md text-xs transition-colors focus:outline-hidden focus:border-[#7C3AED] ${
                        isDark
                          ? 'bg-[#131417] border-[#26282E] text-white placeholder-[#5F636E]'
                          : 'bg-[#F8F9FC] border-[#E4E4E7] text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-medium transition cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending recovery link...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Recovery Link</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className={`mt-5 pt-4 border-t text-center ${isDark ? 'border-[#23252A]' : 'border-zinc-200'}`}>
                <Link
                  to="/login"
                  className={`inline-flex items-center gap-1.5 text-xs transition font-medium ${
                    isDark ? 'text-[#8E929B] hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
