import { statusConfig } from '../data/applications';

/**
 * Pure calculation functions for ApplyTrack analytics.
 * All metrics are derived directly from actual saved applications with no hardcoded or fake data.
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * 1. Overview Metrics
 * - Total applications
 * - Interview count
 * - Offers received
 * - Rejection count
 * - Interview conversion rate = (Interview or Offer) / Total * 100
 * - Offer conversion rate = Offer / Total * 100
 */
export function getOverviewMetrics(applications = []) {
  const total = applications.length;

  if (total === 0) {
    return {
      total: 0,
      interviewCount: 0,
      offersReceived: 0,
      rejectionCount: 0,
      appliedCount: 0,
      screeningCount: 0,
      interviewConversionRate: '0.0',
      offerConversionRate: '0.0',
    };
  }

  let interviewCount = 0;
  let offersReceived = 0;
  let rejectionCount = 0;
  let appliedCount = 0;
  let screeningCount = 0;

  applications.forEach((app) => {
    switch (app.status) {
      case 'Interview':
        interviewCount += 1;
        break;
      case 'Offer':
        offersReceived += 1;
        break;
      case 'Rejected':
        rejectionCount += 1;
        break;
      case 'Screening':
        screeningCount += 1;
        break;
      case 'Applied':
      default:
        appliedCount += 1;
        break;
    }
  });

  // Requirement: Interview conversion rate = applications that reached Interview or Offer / total applications * 100
  const reachedInterviewOrOffer = interviewCount + offersReceived;
  const interviewConversionRate = ((reachedInterviewOrOffer / total) * 100).toFixed(1);

  // Requirement: Offer conversion rate = applications with Offer status / total applications * 100
  const offerConversionRate = ((offersReceived / total) * 100).toFixed(1);

  return {
    total,
    interviewCount,
    offersReceived,
    rejectionCount,
    appliedCount,
    screeningCount,
    interviewConversionRate,
    offerConversionRate,
  };
}

/**
 * 2. Application Status Distribution (Donut Chart)
 */
export function getStatusDistribution(applications = []) {
  const total = applications.length;
  if (total === 0) return [];

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
  ].filter((item) => item.value > 0).map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));
}

/**
 * 3. Monthly Application Activity (Bar Chart)
 * Groups applications chronologically by month
 */
export function getMonthlyActivity(applications = []) {
  if (!applications || applications.length === 0) return [];

  const monthMap = {};

  applications.forEach((app) => {
    if (!app.appliedDate) return;
    const parts = app.appliedDate.split('-');
    if (parts.length < 2) return;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) return;

    const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${MONTH_NAMES[month]}`;

    if (!monthMap[sortKey]) {
      monthMap[sortKey] = {
        sortKey,
        month: label,
        applications: 0,
        interviews: 0,
      };
    }

    monthMap[sortKey].applications += 1;
    if (app.status === 'Interview') {
      monthMap[sortKey].interviews += 1;
    }
  });

  const sortedKeys = Object.keys(monthMap).sort();
  if (sortedKeys.length === 0) return [];

  return sortedKeys.slice(-8).map((k) => monthMap[k]);
}

/**
 * 4. Application Trend Over Time
 * Shows cumulative application growth and submission velocity across monthly periods
 */
export function getApplicationTrend(applications = []) {
  if (!applications || applications.length === 0) return [];

  // Sort chronologically by applied date
  const validApps = [...applications]
    .filter((a) => a.appliedDate && a.appliedDate.includes('-'))
    .sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));

  if (validApps.length === 0) return [];

  const periodMap = {};

  validApps.forEach((app) => {
    const parts = app.appliedDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    if (isNaN(year) || isNaN(month)) return;

    const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${MONTH_NAMES[month]} '${String(year).slice(-2)}`;

    if (!periodMap[sortKey]) {
      periodMap[sortKey] = {
        sortKey,
        period: label,
        newApplications: 0,
      };
    }
    periodMap[sortKey].newApplications += 1;
  });

  const sortedKeys = Object.keys(periodMap).sort();
  let runningTotal = 0;

  return sortedKeys.map((key) => {
    runningTotal += periodMap[key].newApplications;
    return {
      period: periodMap[key].period,
      newApplications: periodMap[key].newApplications,
      cumulative: runningTotal,
    };
  });
}

/**
 * 5. Job Role Breakdown
 * Counts frequency of each job role applied to
 */
export function getJobRoleBreakdown(applications = [], limit = 6) {
  if (!applications || applications.length === 0) return [];

  const roleMap = {};

  applications.forEach((app) => {
    const role = (app.role || 'Unspecified').trim();
    roleMap[role] = (roleMap[role] || 0) + 1;
  });

  const total = applications.length;
  const sorted = Object.entries(roleMap)
    .map(([role, count]) => ({
      role,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, limit);
}

/**
 * 6. Company Breakdown
 * Identifies companies receiving the most applications
 */
export function getCompanyBreakdown(applications = [], limit = 6) {
  if (!applications || applications.length === 0) return [];

  const companyMap = {};

  applications.forEach((app) => {
    const company = (app.company || 'Unknown').trim();
    if (!companyMap[company]) {
      companyMap[company] = {
        company,
        count: 0,
        roles: [],
        statuses: [],
      };
    }
    companyMap[company].count += 1;
    if (app.role && !companyMap[company].roles.includes(app.role)) {
      companyMap[company].roles.push(app.role);
    }
    companyMap[company].statuses.push(app.status);
  });

  const total = applications.length;
  const sorted = Object.values(companyMap)
    .map((item) => ({
      ...item,
      percent: Math.round((item.count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, limit);
}

/**
 * 7. Key Automated Insights
 * Generates factual insights derived directly from stored applications
 */
export function getInsights(applications = []) {
  if (!applications || applications.length === 0) {
    return {
      hasData: false,
      mostAppliedRole: null,
      totalInterviews: 0,
      interviewConversionRate: '0.0',
      offerConversionRate: '0.0',
      mostRecentActivity: null,
      summaryText: 'No application data available yet. Start tracking applications to generate pipeline insights.',
    };
  }

  const metrics = getOverviewMetrics(applications);
  const roles = getJobRoleBreakdown(applications, 1);
  const mostAppliedRole = roles.length > 0 ? roles[0] : null;

  // Find most recent application by appliedDate
  const sortedByDate = [...applications]
    .filter((a) => a.appliedDate)
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

  const mostRecent = sortedByDate.length > 0 ? sortedByDate[0] : null;

  let formattedDate = 'N/A';
  if (mostRecent && mostRecent.appliedDate) {
    try {
      const [year, month, day] = mostRecent.appliedDate.split('-');
      const d = new Date(year, parseInt(month, 10) - 1, day);
      formattedDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      formattedDate = mostRecent.appliedDate;
    }
  }

  return {
    hasData: true,
    mostAppliedRole,
    totalInterviews: metrics.interviewCount,
    interviewConversionRate: metrics.interviewConversionRate,
    offerConversionRate: metrics.offerConversionRate,
    mostRecentActivity: mostRecent
      ? {
          company: mostRecent.company,
          role: mostRecent.role,
          status: mostRecent.status,
          date: formattedDate,
        }
      : null,
  };
}
