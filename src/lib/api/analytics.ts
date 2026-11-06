import { apiGet, apiPost } from "../api";

export interface DescriptiveStats {
  count: number;
  mean: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
  complianceRate: number;
  goodStandingCount: number;
  probationCount: number;
  flaggedCount: number;
}

export interface FinancialAspectData {
  disbursedCount: number;
  disbursedPercent: number;
  undisbursedCount: number;
  undisbursedPercent: number;
  totalSemesterAssessment: number;
  totalDisbursedAmount: number;
  totalPendingAmount: number;
  totalScholarsCount: number;
}

export interface YearLevelBreakdownItem {
  yearLevel: number;
  label: string;
  count: number;
  pct: number;
}

export interface AcademicStandingBreakdown {
  goodStandingCount: number;
  goodStandingPercent: number;
  probationCount: number;
  probationPercent: number;
  flaggedCount: number;
  flaggedPercent: number;
  complianceRate: number;
}

export interface AcademicAspectData {
  unsubmittedGradesCount: number;
  unsubmittedGradesPercent: number;
  submittedGradesCount: number;
  submittedGradesPercent: number;
  notEnrolledCount: number;
  notEnrolledPercent: number;
  enrolledCount: number;
  enrolledPercent: number;
  graduatingCount: number;
  graduatingPercent: number;
  undergradCount: number;
  undergradPercent: number;
  totalScholarsCount: number;
  standingBreakdown: AcademicStandingBreakdown;
  yearLevelBreakdown: YearLevelBreakdownItem[];
}

export interface DescriptiveNarratives {
  financialSummary: string;
  academicSummary: string;
}

export interface ScholarOperationalItem {
  id: number;
  userId: number;
  name: string;
  email: string;
  school: string;
  course: string;
  track: string;
  yearLevel: number;
  isGraduating: boolean;
  enrollmentStatus: "ENROLLED" | "NOT_ENROLLED";
  gradeStatus: "SUBMITTED" | "UNSUBMITTED";
  gwa: number;
  standing: "GOOD" | "PROBATION" | "AT_RISK";
  disbursementStatus: "DISBURSED" | "PENDING" | "NOT_APPLIED";
  assessmentAmount: number;
  disbursedAmount: number;
}

export interface AnalyticsFilterOptions {
  availableSemesters: string[];
  availableAcademicYears: string[];
  termsByYear?: Record<string, string[]>;
  selectedSemester: string;
  selectedAcademicYear: string;
}

// Backward Compatibility Types for legacy visualizations
export interface ScholarPercentileItem {
  id: number;
  userId: number;
  name: string;
  email: string;
  school: string;
  course: string;
  track: string;
  gwa: number;
  normalizedScore: number;
  percentileRank: number;
  health: "good" | "warn" | "bad";
  isCompliant: boolean;
  gradingScale: string;
  academicBaselineStatus: string;
}

export interface CategoryBreakdownItem extends DescriptiveStats {
  category: string;
}

export interface DocumentComplianceData {
  totalDocs: number;
  verifiedDocs: number;
  pendingDocs: number;
  rejectedDocs: number;
  complianceRate: number;
}

export interface FinancialAnalyticsData {
  totalDisbursedSum: number;
  pendingDisbursedSum: number;
  totalDisbursementsCount: number;
  totalOrSubmitted: number;
  claimedOrReleasedCount: number;
  orComplianceRate: number;
  disbByTrack: Array<{ track: string; amount: number }>;
}

export interface IntakeFunnelStage {
  stage: string;
  count: number;
  pct: number;
}

export interface AnalyticsSummaryResponse {
  filterOptions?: AnalyticsFilterOptions;
  financialAspect?: FinancialAspectData;
  academicAspect?: AcademicAspectData;
  descriptiveNarratives?: DescriptiveNarratives;
  scholars: ScholarOperationalItem[];
  globalThresholdPercent: number;
  overallStats?: DescriptiveStats;
  courseBreakdown?: CategoryBreakdownItem[];
  trackBreakdown?: CategoryBreakdownItem[];
  schoolBreakdown?: CategoryBreakdownItem[];
  documentCompliance?: DocumentComplianceData;
  financialAnalytics?: FinancialAnalyticsData;
  intakeFunnel?: IntakeFunnelStage[];
}

export interface AiExplanationRequest {
  chartType: string;
  title?: string;
  category?: string;
  metrics: Record<string, unknown>;
  dataPoints?: unknown[];
}

export interface AiExplanationResponse {
  summary: string;
  statisticalInterpretation: string;
  recommendations: string[];
  keyHighlights: string[];
}

const B = "/api/proxy/analytics";

export function getAnalyticsSummary(params?: {
  groupBy?: "school" | "track" | "course" | "term";
  schoolId?: number;
  track?: string;
  course?: string;
  academicYear?: string;
  semester?: string;
}) {
  const query = new URLSearchParams();
  if (params?.groupBy) query.set("groupBy", params.groupBy);
  if (params?.schoolId) query.set("schoolId", String(params.schoolId));
  if (params?.track) query.set("track", params.track);
  if (params?.course) query.set("course", params.course);
  if (params?.academicYear) query.set("academicYear", params.academicYear);
  if (params?.semester) query.set("semester", params.semester);

  const queryString = query.toString();
  return apiGet<AnalyticsSummaryResponse>(`${B}/summary${queryString ? `?${queryString}` : ""}`);
}

export function explainAnalyticsChart(dto: AiExplanationRequest) {
  return apiPost<AiExplanationResponse>(`${B}/explain`, dto);
}
