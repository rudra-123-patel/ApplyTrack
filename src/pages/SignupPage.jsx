import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const { setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please create a password.');
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
    setSuccessInfo(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await signUp({ email, password });

      if (error) {
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists')
        ) {
          setErrorMessage('An account with this email address already exists. Please sign in instead.');
        } else {
          setErrorMessage(error.message || 'Unable to create account. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Check if Supabase requires email verification or returned an empty identities array for duplicate
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
        setIsSubmitting(false);
        return;
      }

      // Check if email confirmation is required (session is null when confirmation is pending)
      if (data?.user && !data.session) {
        setSuccessInfo({
          email: email.trim(),
          needsConfirmation: true,
          message: 'Account created! Please check your email inbox and click the confirmation link to activate your account.',
        });
        setIsSubmitting(false);
        return;
      }

      // If auto-confirmed and session was created immediately
      setSuccessInfo({
        email: email.trim(),
        needsConfirmation: false,
        message: 'Account created successfully! Entering your workspace...',
      });
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'Google signup could not be initiated.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect with Google.');
      setIsGoogleLoading(false);
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
            Create your account
          </h1>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-[#8E929B]' : 'text-zinc-500'
          }`}>
            Start tracking your job applications with ApplyTrack
          </p>
        </div>

        {/* Card Container */}
        <div className={`p-6 rounded-lg border shadow-xl transition-all ${
          isDark 
            ? 'bg-[#18191D] border-[#23252A]' 
            : 'bg-white border-[#E4E4E7] shadow-zinc-900/5'
        }`}>
          {successInfo ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-300">Registration Complete</p>
                  <p className="text-[11px] leading-relaxed text-emerald-400/90">{successInfo.message}</p>
                </div>
              </div>

              {successInfo.needsConfirmation && (
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Google OAuth Signup Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isSubmitting}
                className={`w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-md border text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#1E1F24] hover:bg-[#25272E] border-[#2B2D34] hover:border-[#3A3D46] text-white'
                    : 'bg-white hover:bg-zinc-50 border-[#E4E4E7] hover:border-zinc-300 text-zinc-900'
                }`}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C3AED]" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              {/* Understated Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? 'border-[#23252A]' : 'border-zinc-200'}`} />
                </div>
                <div className={`relative px-2.5 text-[10px] uppercase tracking-wider ${
                  isDark ? 'bg-[#18191D] text-[#5F636E]' : 'bg-white text-zinc-400'
                }`}>
                  Or register with email
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className={`block text-[11px] font-medium mb-1 uppercase tracking-wider ${
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

                {/* Password Field */}
                <div>
                  <label className={`block text-[11px] font-medium mb-1 uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    Password
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
                  <label className={`block text-[11px] font-medium mb-1 uppercase tracking-wider ${
                    isDark ? 'text-[#8E929B]' : 'text-zinc-600'
                  }`}>
                    Confirm Password
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
                      placeholder="Re-enter your password"
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
                  disabled={isSubmitting || isGoogleLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-medium transition cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Switch to Login */}
          <div className={`mt-5 pt-4 border-t text-center ${isDark ? 'border-[#23252A]' : 'border-zinc-200'}`}>
            <p className={`text-xs ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#7C3AED] hover:text-[#9061F9] font-medium transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
