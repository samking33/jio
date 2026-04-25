// ─── STEP STATUS ────────────────────────────────────────────────────────────
export type StepStatus = "idle" | "running" | "completed" | "error";

// ─── INDIVIDUAL STEP DEFINITION ─────────────────────────────────────────────
export interface PipelineStep {
  id: number;           // 1–10
  key: string;          // machine-readable key, e.g. "crawl"
  label: string;        // display name
  description: string;  // one-line description
  stage: PipelineStage; // which stage this belongs to
  apiEndpoint: string;  // e.g. "/api/crawl"
  icon: string;         // emoji icon
  status: StepStatus;
  result?: StepResult;  // populated after completion
}

// ─── STAGE GROUPS ────────────────────────────────────────────────────────────
export type PipelineStage = "discovery" | "analysis" | "decision" | "feedback";

export interface StageGroup {
  id: PipelineStage;
  label: string;
  icon: string;
  color: string;
  steps: number[]; // step ids belonging to this stage
}

// ─── STEP RESULT ─────────────────────────────────────────────────────────────
export interface StepResult {
  success: boolean;
  message: string;
  data?: unknown;        // raw data returned by backend
  timestamp: string;
  duration?: number;     // ms
}

// ─── PIPELINE STATE ──────────────────────────────────────────────────────────
export interface PipelineState {
  currentStepId: number;          // 1–10; 0 = not started; 11 = done → overview
  steps: PipelineStep[];
  pipelineData: PipelineData;
  isRunning: boolean;             // true while a step is executing
  startedAt?: string;
  completedAt?: string;
}

// ─── AGGREGATED PIPELINE DATA ────────────────────────────────────────────────
export interface PipelineData {
  crawlResults?: CrawlResult;
  filterResults?: FilterResult;
  downloadResults?: DownloadResult;
  extractResults?: ExtractResult;
  certResults?: CertResult;
  riskResults?: RiskResult;
  jsonOutput?: JsonOutput;
  hilResults?: HilResult;
  forwardResults?: ForwardResult;
  logResults?: LogResult;
}

// ─── PER-STEP DATA SHAPES ────────────────────────────────────────────────────
export interface CrawlResult {
  sources: SourceCrawlRecord[];
  totalListings: number;
  totalErrors: number;
  duration: string;
}

export interface SourceCrawlRecord {
  id: number;
  url: string;
  category: string;
  freq: string;
  enabled: boolean;
  credential: string;
  listings: number;
  passed: number;
  discarded: number;
  errors: number;
  startTime: string;
  endTime: string;
}

export interface FilterResult {
  rules: FilterRule[];
  totalIn: number;
  totalPassed: number;
  totalFailed: number;
}

export interface FilterRule {
  filter: string;
  input: number;
  passed: number;
  failed: number;
  time: string;
}

export interface DownloadResult {
  downloaded: number;
  failed: number;
  totalSizeMb: number;
  indexedDocuments: number;
}

export interface ExtractResult {
  rfps: AnalysisRfp[];
}

export interface AnalysisRfp {
  id: number;
  rfpTitle: string;
  confidence: number;
  tasks: string[];
  skills: SkillRecord[];
  certifications: string[];
  risks: RiskRecord[];
  eligibility: "Eligible" | "At Risk" | "Conditional";
  eligibilityNotes: string;
}

export interface SkillRecord {
  name: string;
  level: string;
  match: number;
  effort: string;
  priority: "Critical" | "High" | "Medium" | "Low";
}

export interface RiskRecord {
  level: "High" | "Medium" | "Low";
  description: string;
  type: "danger" | "warning" | "success";
}

export interface CertResult {
  registry: CertRegistryItem[];
  flagged: string[];
}

export interface CertRegistryItem {
  name: string;
  freq: number;
  known: boolean;
}

export interface RiskResult {
  rfps: AnalysisRfp[]; // same as extract but now includes risk scores
  overallRisk: "High" | "Medium" | "Low";
}

export interface JsonOutput {
  recordCount: number;
  exportedAt: string;
  sizeKb: number;
  previewUrl?: string;
}

export interface HilResult {
  pending: HilRfp[];
  decisions: Record<number, "approve" | "reject">;
  notes: Record<number, string>;
  feedback: Record<number, "correct" | "incorrect">;
  allDecided: boolean;
}

export interface HilRfp {
  id: number;
  title: string;
  agency: string;
  deadline: string;
  budget: string;
  confidence: number;
  timeline: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  tasks: string[];
  skills: { name: string; match: number }[];
  certifications: string[];
  risks: { level: string; desc: string; type: string }[];
  eligibilityNotes: string;
  matchScore: { technical: number; experience: number; certifications: number; resources: number };
}

export interface ForwardResult {
  forwarded: number;
  rejected: number;
  estimatedValue: string;
}

export interface LogResult {
  entries: LogEntry[];
  accuracy: number;
  improvementPct: number;
}

export interface LogEntry {
  time: string;
  event: string;
  detail: string;
  type: "success" | "warning" | "error";
}

// ─── API RESPONSE WRAPPER ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration?: number;
}

export interface PipelineRunState extends PipelineState {
  runId: number;
  status: string;
  error?: string | null;
}
