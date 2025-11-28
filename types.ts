
export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export type IncidentStatus = 'Open' | 'Resolved' | 'Approved' | 'Auto-Fixed' | 'Wont Fix';
export type UserRole = 'Viewer' | 'Developer' | 'Approver' | 'Admin';

export type IntegrationType = 
  // Protocols
  | 'API' | 'ODBC' | 'JDBC' 
  // Databases
  | 'PostgreSQL' | 'MySQL' | 'Oracle' | 'MSSQL' | 'MongoDB' | 'Redis' | 'Snowflake'
  // Infrastructure & Cloud
  | 'Kubernetes' | 'Docker' | 'AWS CloudWatch' | 'Azure Monitor' | 'GCP Logging'
  // Observability
  | 'Datadog' | 'New Relic' | 'Splunk' | 'Elasticsearch' | 'Sentry' | 'Dynatrace' | 'Prometheus'
  // Business & Ops
  | 'Salesforce' | 'ServiceNow' | 'Zendesk' | 'PagerDuty'
  // Collaboration & Dev
  | 'Slack' | 'Microsoft Teams' | 'Jira' | 'GitHub' | 'GitLab' | 'Jenkins'
  // Other
  | 'Custom';

export interface SimulationPreview {
  success_probability: number; // 0-100
  regression_risk: number; // 0-100
  predicted_outcome: string;
  simulated_scenarios: number;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  type: 'Service' | 'Database' | 'Gateway' | 'Queue' | 'Client';
  status: 'Healthy' | 'Compromised' | 'Down';
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureInference {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  blast_radius_summary: string;
}

export interface AnalysisResult {
  root_cause: string;
  likely_origin: string;
  impact_scope: string;
  severity: Severity;
  confidence_score: number;
  suggested_fix: string;
  suggested_tests: string;
  notes_for_future: string;
  simulation_preview?: SimulationPreview;
  architecture_inference?: ArchitectureInference;
}

export interface IncidentFormData {
  title: string;
  environment: string;
  serviceName: string;
  logs: string;
  codeSnippet: string;
  expectedBehavior: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  userRole: UserRole;
  incidentId?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  environment: string;
  status: 'Active' | 'Error' | 'Pending';
  endpoint?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  formData: IncidentFormData;
  result: AnalysisResult;
  status: IncidentStatus;
  occurrenceCount: number;
  lastOccurred: number;
  assignee?: string;
}

export interface AppSettings {
  model: string;
  advancedCorrelation: boolean;
  devExplanation: boolean;
  simpleSummary: boolean;
  userRole: UserRole;
  autoFixEnabled: boolean;
  integrations: Integration[];
}
