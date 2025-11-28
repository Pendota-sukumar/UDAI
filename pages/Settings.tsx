
import React, { useState, useEffect } from 'react';
import { Save, Server, Shield, Trash2, Plus } from 'lucide-react';
import { Card, Button, Select, Input } from '../components/Components';
import { getSettings, saveSettings } from '../services/storageService';
import { AppSettings, Integration, UserRole, IntegrationType } from '../types';

const Toggle: React.FC<{ label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0">
    <div className="pr-4">
      <h4 className="text-sm font-medium text-slate-800">{label}</h4>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
    <button 
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [newIntegrationName, setNewIntegrationName] = useState('');
  const [newIntegrationType, setNewIntegrationType] = useState<IntegrationType>('API');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addIntegration = () => {
    if (!newIntegrationName) return;
    const newInt: Integration = {
      id: crypto.randomUUID(),
      name: newIntegrationName,
      type: newIntegrationType,
      environment: 'Production',
      status: 'Active'
    };
    setSettings(prev => ({ ...prev, integrations: [...prev.integrations, newInt] }));
    setNewIntegrationName('');
    setNewIntegrationType('API');
  };

  const removeIntegration = (id: string) => {
    setSettings(prev => ({ ...prev, integrations: prev.integrations.filter(i => i.id !== id) }));
  };

  // Comprehensive list of popular enterprise connectors
  const connectorOptions = [
    // Standard Protocols
    { value: 'API', label: 'REST/GraphQL API' },
    { value: 'JDBC', label: 'JDBC (Java Database Connectivity)' },
    { value: 'ODBC', label: 'ODBC (Open Database Connectivity)' },
    
    // Databases
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'MySQL', label: 'MySQL' },
    { value: 'Oracle', label: 'Oracle Database' },
    { value: 'MSSQL', label: 'Microsoft SQL Server' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'Redis', label: 'Redis' },
    { value: 'Snowflake', label: 'Snowflake Data Warehouse' },
    
    // Cloud & Infrastructure
    { value: 'Kubernetes', label: 'Kubernetes Cluster' },
    { value: 'Docker', label: 'Docker Engine' },
    { value: 'AWS CloudWatch', label: 'AWS CloudWatch' },
    { value: 'Azure Monitor', label: 'Azure Monitor' },
    { value: 'GCP Logging', label: 'Google Cloud Logging' },
    
    // Observability & Monitoring
    { value: 'Datadog', label: 'Datadog' },
    { value: 'Splunk', label: 'Splunk' },
    { value: 'New Relic', label: 'New Relic' },
    { value: 'Elasticsearch', label: 'Elasticsearch / ELK' },
    { value: 'Prometheus', label: 'Prometheus' },
    { value: 'Dynatrace', label: 'Dynatrace' },
    { value: 'Sentry', label: 'Sentry' },
    
    // Service Management & Ops
    { value: 'ServiceNow', label: 'ServiceNow' },
    { value: 'PagerDuty', label: 'PagerDuty' },
    { value: 'Jira', label: 'Jira' },
    { value: 'Salesforce', label: 'Salesforce' },
    { value: 'Zendesk', label: 'Zendesk' },
    
    // CI/CD & Source Control
    { value: 'GitHub', label: 'GitHub' },
    { value: 'GitLab', label: 'GitLab' },
    { value: 'Jenkins', label: 'Jenkins' },
    
    // Communication
    { value: 'Slack', label: 'Slack' },
    { value: 'Microsoft Teams', label: 'Microsoft Teams' },
    
    // Other
    { value: 'Custom', label: 'Custom Webhook' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
          <p className="text-slate-500">Manage connections, AI models, and user roles.</p>
        </div>
        <Button onClick={handleSave} variant="primary">
           {isSaved ? <span className="flex items-center gap-2">Saved!</span> : <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role & AI Config */}
        <div className="space-y-6">
          <Card title="User & Role">
            <Select 
              label="Simulate User Role" 
              options={[
                { value: 'Admin', label: 'Admin (Full Access)' },
                { value: 'Approver', label: 'Approver (Can Approve Fixes)' },
                { value: 'Developer', label: 'Developer (Can Resolve)' },
                { value: 'Viewer', label: 'Viewer (Read Only)' }
              ]}
              value={settings.userRole}
              onChange={(e) => setSettings({ ...settings, userRole: e.target.value as UserRole })}
            />
            <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
              <Shield size={12} className="inline mr-1" />
              Role determines access to "Approve Fix" and "Auto-Fix" actions.
            </p>
          </Card>

          <Card title="AI Model Configuration">
             <Select 
               label="Gemini Model" 
               options={[
                 { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
                 { value: 'gemini-2.5-flash-lite-latest', label: 'Gemini 2.5 Flash Lite' },
                 { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Preview)' }
               ]}
               value={settings.model}
               onChange={(e) => setSettings({ ...settings, model: e.target.value })}
             />
             <div className="mt-4">
                <Toggle 
                  label="Enable Auto-Fix Proposals" 
                  description="Allow AI to mark incidents as 'Auto-Fixed' if confidence is high (Simulated)."
                  checked={settings.autoFixEnabled}
                  onChange={(c) => setSettings({ ...settings, autoFixEnabled: c })}
                />
             </div>
          </Card>
        </div>

        {/* Integrations */}
        <div className="space-y-6">
           <Card title="Connectors & Data Sources">
             <div className="space-y-3 mb-4">
               {settings.integrations.map(integration => (
                 <div key={integration.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                       <div className="bg-white p-2 rounded border border-slate-200">
                         <Server size={16} className="text-brand-500" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-slate-800">{integration.name}</p>
                         <p className="text-xs text-slate-500">{integration.type} • {integration.environment}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${integration.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {integration.status}
                       </span>
                       <button onClick={() => removeIntegration(integration.id)} className="text-slate-400 hover:text-red-500">
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               ))}
               {settings.integrations.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No active connectors.</p>}
             </div>
             
             <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                     label="" 
                     placeholder="Connection Name..." 
                     value={newIntegrationName}
                     onChange={(e) => setNewIntegrationName(e.target.value)}
                     className="mb-0"
                   />
                   <Select 
                     label=""
                     options={connectorOptions}
                     value={newIntegrationType}
                     onChange={(e) => setNewIntegrationType(e.target.value as IntegrationType)}
                     className="mb-0"
                   />
                </div>
                <Button onClick={addIntegration} size="sm" variant="secondary" className="w-full">
                   <Plus size={16} /> Add Connector
                </Button>
             </div>
           </Card>
           
           <Card title="Analysis Preferences">
              <Toggle 
                label="Advanced Log Correlation" 
                description="Attempt to correlate timestamps across multiple log fragments."
                checked={settings.advancedCorrelation}
                onChange={(c) => setSettings({ ...settings, advancedCorrelation: c })}
              />
              <Toggle 
                label="Developer-Focused Explanations" 
                description="Include deep-dive technical details and architecture references."
                checked={settings.devExplanation}
                onChange={(c) => setSettings({ ...settings, devExplanation: c })}
              />
           </Card>
        </div>
      </div>
    </div>
  );
};
