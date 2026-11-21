import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  Briefcase, 
  Globe, 
  FileText, 
  Plus, 
  Pencil, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const getInitialFormState = (initialData) => ({
  company: initialData?.company || '',
  role: initialData?.role || '',
  location: initialData?.location || '',
  jobType: initialData?.jobType || 'Full-time',
  salary: initialData?.salary || '',
  appliedDate: initialData?.appliedDate || new Date().toISOString().split('T')[0],
  jobUrl: initialData?.jobUrl || '',
  status: initialData?.status || 'Applied',
  notes: initialData?.notes || '',
});

export default function AddApplicationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null 
}) {
  const { isDark } = useTheme();
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [formData, setFormData] = useState(() => getInitialFormState(initialData));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companyInputRef = useRef(null);

  // Synchronize state during render when initialData changes
  if (prevInitialData !== initialData) {
    setPrevInitialData(initialData);
    setFormData(getInitialFormState(initialData));
    setErrors({});
    setIsSubmitting(false);
  }

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        companyInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Job role is required';
    }
    if (formData.jobUrl.trim()) {
      let urlToTest = formData.jobUrl.trim();
      if (!/^https?:\/\//i.test(urlToTest)) {
        urlToTest = `https://${urlToTest}`;
      }
      try {
        new URL(urlToTest);
      } catch {
        newErrors.jobUrl = 'Please enter a valid URL (e.g. https://company.com/jobs)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let cleanUrl = formData.jobUrl.trim();
      if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `https://${cleanUrl}`;
      }

      await onSave({
        company: formData.company.trim(),
        role: formData.role.trim(),
        location: formData.location.trim() || 'Remote',
        jobType: formData.jobType,
        salary: formData.salary.trim(),
        appliedDate: formData.appliedDate || new Date().toISOString().split('T')[0],
        jobUrl: cleanUrl,
        status: formData.status,
        notes: formData.notes.trim(),
      });

      onClose();
    } catch {
      // Parent component handles notification toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData && initialData.id);

  // Common input styling class helper - explicit theme colors
  const getInputClass = (hasError = false) => {
    const baseClasses = "w-full h-9 px-3 rounded-md text-xs sm:text-[13px] border transition-all focus:outline-none focus:ring-2";
    if (isDark) {
      const border = hasError 
        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
        : "border-[#26282E] hover:border-[#363840] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20";
      return `${baseClasses} bg-[#131417] text-white placeholder-[#5F636E] ${border}`;
    } else {
      const border = hasError 
        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
        : "border-[#E4E4E7] hover:border-[#CBD5E1] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20";
      return `${baseClasses} bg-white text-[#18181B] placeholder-[#A1A1AA] ${border}`;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto ${
        isDark ? 'bg-black/60' : 'bg-slate-900/40'
      }`}
      onClick={isSubmitting ? undefined : onClose}
    >
      <div 
        className={`relative w-full max-w-xl rounded-xl shadow-2xl overflow-hidden my-6 border transition-colors ${
          isDark
            ? 'bg-[#18191D] text-white border-[#26282E]'
            : 'bg-white text-[#18181B] border-[#E4E4E7] shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
          isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isDark 
                ? 'bg-[#7C3AED]/15 text-[#A78BFA] border-[#7C3AED]/30' 
                : 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]'
            }`}>
              {isEditing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className={`text-sm font-semibold tracking-tight ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                {isEditing ? 'Edit Application' : 'Add New Application'}
              </h2>
              <p className={`text-[11px] mt-0.5 ${
                isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
              }`}>
                {isEditing 
                  ? 'Update company, position details, or current pipeline stage' 
                  : 'Record a new position to track in your pipeline'}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer disabled:opacity-40 ${
              isDark 
                ? 'text-[#8E929B] hover:text-white hover:bg-[#22242A]' 
                : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F1F2F6]'
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto text-xs">
            
            {/* Group 1: Role & Company */}
            <div className="space-y-2.5">
              <div className={`flex items-center gap-1.5 pb-1 border-b ${
                isDark ? 'border-[#23252A]' : 'border-[#F1F2F6]'
              }`}>
                <Building2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
                }`}>
                  Role & Company
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Company Name <span className="text-rose-500 font-semibold">*</span>
                  </label>
                  <input
                    ref={companyInputRef}
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Stripe, Linear"
                    disabled={isSubmitting}
                    className={getInputClass(Boolean(errors.company))}
                  />
                  {errors.company && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.company}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Job Role <span className="text-rose-500 font-semibold">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    disabled={isSubmitting}
                    className={getInputClass(Boolean(errors.role))}
                  />
                  {errors.role && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.role}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Group 2: Employment & Compensation */}
            <div className="space-y-2.5 pt-1">
              <div className={`flex items-center gap-1.5 pb-1 border-b ${
                isDark ? 'border-[#23252A]' : 'border-[#F1F2F6]'
              }`}>
                <Briefcase className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
                }`}>
                  Position Details & Compensation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote, San Francisco, CA"
                    disabled={isSubmitting}
                    className={getInputClass()}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${getInputClass()} cursor-pointer`}
                  >
                    <option value="Full-time" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Full-time</option>
                    <option value="Part-time" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Part-time</option>
                    <option value="Contract" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Contract</option>
                    <option value="Internship" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Internship</option>
                    <option value="Freelance" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Freelance</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Salary / Compensation
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $140,000 - $170,000"
                    disabled={isSubmitting}
                    className={getInputClass()}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Application Date
                  </label>
                  <input
                    type="date"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${getInputClass()} cursor-pointer`}
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Pipeline Stage & Reference */}
            <div className="space-y-2.5 pt-1">
              <div className={`flex items-center gap-1.5 pb-1 border-b ${
                isDark ? 'border-[#23252A]' : 'border-[#F1F2F6]'
              }`}>
                <Globe className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
                }`}>
                  Pipeline Stage & Link
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Status Stage
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`${getInputClass()} cursor-pointer`}
                  >
                    <option value="Applied" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Applied</option>
                    <option value="Screening" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Screening</option>
                    <option value="Interview" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Interview</option>
                    <option value="Offer" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Offer</option>
                    <option value="Rejected" className={isDark ? "bg-[#18191D] text-white" : "bg-white text-[#18181B]"}>Rejected</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                  }`}>
                    Job Listing URL
                  </label>
                  <input
                    type="url"
                    name="jobUrl"
                    value={formData.jobUrl}
                    onChange={handleChange}
                    placeholder="https://company.com/careers/..."
                    disabled={isSubmitting}
                    className={getInputClass(Boolean(errors.jobUrl))}
                  />
                  {errors.jobUrl && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.jobUrl}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Group 4: Notes & Context */}
            <div className="space-y-2.5 pt-1">
              <div className={`flex items-center gap-1.5 pb-1 border-b ${
                isDark ? 'border-[#23252A]' : 'border-[#F1F2F6]'
              }`}>
                <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
                }`}>
                  Notes & Context
                </span>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  isDark ? 'text-[#A1A4B0]' : 'text-[#18181B]'
                }`}>
                  Preparation Notes & Context
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Referral contact, key topics to prepare, interview loop feedback..."
                  disabled={isSubmitting}
                  className={`w-full p-3 rounded-md text-xs sm:text-[13px] border transition-all focus:outline-none focus:ring-2 resize-y min-h-[72px] ${
                    isDark
                      ? "bg-[#131417] text-white placeholder-[#5F636E] border-[#26282E] hover:border-[#363840] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                      : "bg-white text-[#18181B] placeholder-[#A1A1AA] border-[#E4E4E7] hover:border-[#CBD5E1] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
                  }`}
                />
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className={`px-5 sm:px-6 py-3.5 border-t flex items-center justify-between ${
            isDark ? 'bg-[#141518]/70 border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
          }`}>
            <span className={`text-[11px] ${
              isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
            }`}>
              <span className="text-rose-500 font-semibold">*</span> Required fields
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-3.5 py-2 rounded-md border text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'border-[#26282E] text-[#8E929B] hover:text-white hover:bg-[#22242A]'
                    : 'border-[#E4E4E7] bg-[#F1F2F6] hover:bg-[#E4E4E7] text-[#18181B]'
                }`}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <Pencil className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{isEditing ? 'Update Application' : 'Save Application'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
