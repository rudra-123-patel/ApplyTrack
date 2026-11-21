import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ResetPasswordPage() {
  const { user, loading, updatePassword, signOut } = useAuth();
  const { setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    if (!password) {
      setErrorMessage('Please enter a new password.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
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
      const { error } = await updatePassword(password);

      if (error) {
        setErrorMessage(error.message || 'Failed to update password. Your reset link may have expired.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      // Sign out recovery session and redirect to login
      setTimeout(async () => {
        try {
          await signOut();
        } finally {
          navigate('/login', {
            replace: true,
            state: { message: 'Password updated successfully! Please sign in with your new password.' },
          });
        }
      }, 1800);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        isDark ? 'bg-[#0F1012] text-[#EDEDED]' : 'bg-[#F5F6FA] text-[#18181B]'
      }`}>
        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
          <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
          <span>Validating password reset session...</span>
        </div>
      </div>
    );
  }

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
            Set new password
          </h1>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-[#8E929B]' : 'text-zinc-500'
          }`}>
            Choose a strong password for your ApplyTrack account
          </p>
        </div>

        {/* Card Container */}
        <div className={`p-6 rounded-lg border shadow-xl transition-all ${
          isDark 
            ? 'bg-[#18191D] border-[#23252A]' 
            : 'bg-white border-[#E4E4E7] shadow-zinc-900/5'
        }`}>
          {isSuccess ? (
            <div className="space-y-3 py-2 text-center animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Password Updated</p>
              <p className={`text-xs ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                Your password has been changed successfully. Redirecting you to sign in...
              </p>
            </div>
          ) : !user ? (
            /* No recovery session active */
            <div className="space-y-4 text-center">
              <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">Invalid or Expired Link</p>
                  <p className="text-[11px] leading-relaxed text-amber-400/90">
                    No active password recovery session was detected. Your reset link may have expired or already been used.
                  </p>
                </div>
              </div>

              <Link
                to="/forgot-password"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer"
              >
                <span>Request a New Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="pt-2">
                <Link
                  to="/login"
                  className={`text-xs transition font-medium ${
                    isDark ? 'text-[#8E929B] hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Return to Sign In
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

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* New Password Field */}
                <div>
                  <label className={`block text-[11px] font-medium mb-1.5 uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    New Password
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                    }`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      className={`w-full pl-9 pr-10 py-2 border rounded-md text-xs transition-colors focus:outline-hidden focus:border-[#7C3AED] ${
                        isDark
                          ? 'bg-[#131417] border-[#26282E] text-white placeholder-[#5F636E]'
                          : 'bg-[#F8F9FC] border-[#E4E4E7] text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center transition cursor-pointer ${
                        isDark ? 'text-[#5F636E] hover:text-[#EDEDED]' : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className={`block text-[11px] font-medium mb-1.5 uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                    }`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      required
                      className={`w-full pl-9 pr-10 py-2 border rounded-md text-xs transition-colors focus:outline-hidden focus:border-[#7C3AED] ${
                        isDark
                          ? 'bg-[#131417] border-[#26282E] text-white placeholder-[#5F636E]'
                          : 'bg-[#F8F9FC] border-[#E4E4E7] text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center transition cursor-pointer ${
                        isDark ? 'text-[#5F636E] hover:text-[#EDEDED]' : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
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
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
