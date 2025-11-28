
import { HistoryItem, AppSettings, AuditLogEntry, Integration, IncidentFormData, IncidentStatus, IntegrationType } from '../types';

const HISTORY_KEY = 'udai_history_v3';
const SETTINGS_KEY = 'udai_settings_v3';
const AUDIT_KEY = 'udai_audit_v3';

// --- History & Incidents ---

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistoryItem = (item: HistoryItem): void => {
  try {
    const current = getHistory();
    // Check if update or new
    const index = current.findIndex(i => i.id === item.id);
    let updated;
    if (index >= 0) {
      updated = [...current];
      updated[index] = item;
    } else {
      updated = [item, ...current];
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history item", e);
  }
};

export const updateIncidentStatus = (id: string, status: IncidentStatus, role: string): void => {
  const history = getHistory();
  const item = history.find(i => i.id === id);
  if (item) {
    item.status = status;
    saveHistoryItem(item);
    addAuditEntry({
      action: `Status changed to ${status}`,
      details: `Incident "${item.formData.title}" marked as ${status}`,
      userRole: role as any,
      incidentId: id
    });
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(AUDIT_KEY);
};

// --- Settings & Integrations ---

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  
  // Defaults
  return {
    model: 'gemini-2.5-flash',
    advancedCorrelation: false,
    devExplanation: true,
    simpleSummary: false,
    userRole: 'Admin',
    autoFixEnabled: false,
    integrations: [
      { id: '1', name: 'Prod-K8s-Cluster-East', type: 'Kubernetes', environment: 'Production', status: 'Active' },
      { id: '2', name: 'Legacy-Billing-DB', type: 'JDBC', environment: 'Production', status: 'Active' },
      { id: '3', name: 'Corporate-CRM', type: 'Salesforce', environment: 'Production', status: 'Active' }
    ],
  };
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

// --- Audit Log ---

export const getAuditLog = (): AuditLogEntry[] => {
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addAuditEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
  try {
    const current = getAuditLog();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    const updated = [newEntry, ...current].slice(0, 100); // Keep last 100
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save audit log", e);
  }
};

// --- Mock Data Generators ---

export const getMockLiveIncidents = (): IncidentFormData[] => {
  return [
    {
      title: 'JDBC Connection Pool Exhaustion',
      environment: 'Production',
      serviceName: 'billing-service',
      logs: `2023-10-27 14:22:10 ERROR [ConnectionPool] Unable to acquire JDBC connection
java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms.
    at com.zaxxer.hikari.pool.HikariPool.createTimeoutException(HikariPool.java:695)
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:197)
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128)`,
      codeSnippet: `// Configuration
hikariConfig.setMaximumPoolSize(10);
hikariConfig.setConnectionTimeout(30000);`,
      expectedBehavior: 'Pool should handle peak load of 50 concurrent requests'
    },
    {
      title: 'API Rate Limit 429 - Stripe',
      environment: 'Staging',
      serviceName: 'checkout-gateway',
      logs: `HTTP 429 Too Many Requests
{
  "error": {
    "message": "You have exceeded the maximum number of requests permitted for this account.",
    "type": "invalid_request_error",
    "code": "rate_limit_exceeded"
  }
}`,
      codeSnippet: `const response = await stripe.charges.create({...});
// No retry logic implemented here`,
      expectedBehavior: 'Should gracefully backoff and retry'
    },
    {
      title: 'ODBC Driver Mismatch',
      environment: 'Dev',
      serviceName: 'analytics-worker',
      logs: `[IM002] [Microsoft][ODBC Driver Manager] Data source name not found and no default driver specified
   at System.Data.Odbc.OdbcConnection.HandleError(OdbcHandle hrHandle, RetCode retcode)
   at System.Data.Odbc.OdbcConnectionFactory.CreateConnection(DbConnectionOptions options, DbConnectionPoolKey poolKey, Object poolGroupProviderInfo, DbConnectionPool pool, DbConnection owningObject)`,
      codeSnippet: `string connString = "Driver={SQL Server Native Client 11.0};Server=myServerAddress;Database=myDataBase;";`,
      expectedBehavior: 'Should connect to legacy MSSQL reporting DB'
    }
  ];
};
