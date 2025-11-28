
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, CheckCircle, Zap, Terminal, Activity, ArrowRight, Shield, Layers, LayoutGrid, Cpu } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, SeverityBadge, StatusBadge, SimulationGauge, BlastRadiusMap, VoiceControl } from '../components/Components';
import { analyzeIncident } from '../services/geminiService';
import { saveHistoryItem, getSettings, getMockLiveIncidents, updateIncidentStatus, addAuditEntry } from '../services/storageService';
import { IncidentFormData, AnalysisResult, IncidentStatus } from '../types';

export const Analyzer: React.FC = () => {
  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    environment: 'Production',
    serviceName: '',
    logs: '',
    codeSnippet: '',
    expectedBehavior: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<IncidentStatus>('Open');
  const [error, setError] = useState<string | null>(null);
  const [liveIncidents, setLiveIncidents] = useState(getMockLiveIncidents());
  const [settings, setSettings] = useState(getSettings());
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'holomap'>('overview');

  useEffect(() => {
    setSettings(getSettings());
  }, []); // Reload settings on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      title: '',
      environment: 'Production',
      serviceName: '',
      logs: '',
      codeSnippet: '',
      expectedBehavior: ''
    });
    setResult(null);
    setError(null);
    setCurrentIncidentId(null);
    setStatus('Open');
    setActiveTab('overview');
  };

  const handleLoadIncident = (incident: IncidentFormData) => {
    setFormData(incident);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.logs.trim()) {
      setError("Please provide logs or error details to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setActiveTab('overview');

    try {
      const currentSettings = getSettings();
      const analysis = await analyzeIncident(formData, currentSettings.model);
      setResult(analysis);
      
      const newId = crypto.randomUUID();
      setCurrentIncidentId(newId);
      setStatus('Open');
      
      // Save to history
      saveHistoryItem({
        id: newId,
        timestamp: Date.now(),
        formData: { ...formData }, // clone
        result: analysis,
        status: 'Open',
        occurrenceCount: 1,
        lastOccurred: Date.now()
      });

      addAuditEntry({
        action: 'Analyzed Incident',
        details: `Ran analysis on "${formData.title || 'Untitled'}"`,
        userRole: currentSettings.userRole,
        incidentId: newId
      });

    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Workflow Actions
  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (!currentIncidentId) return;
    setStatus(newStatus);
    updateIncidentStatus(currentIncidentId, newStatus, settings.userRole);
  };

  const canApprove = ['Admin', 'Approver'].includes(settings.userRole);
  const canModify = ['Admin', 'Approver', 'Developer'].includes(settings.userRole);

  const generateBriefingText = (res: AnalysisResult) => {
    return `UDAI Mission Briefing. Incident severity is ${res.severity}. 
    Root cause identified as ${res.root_cause}. 
    Impact scope: ${res.impact_scope}.
    Recommended fix: ${res.suggested_fix.substring(0, 150)}...
    Confidence score is ${res.confidence_score} percent.
    ${res.simulation_preview ? `Shadow Lab predicts ${res.simulation_preview.success_probability} percent success rate.` : ''}`;
  };

  const ResultSection = ({ result }: { result: AnalysisResult }) => (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Root Cause Analysis
              <StatusBadge status={status} />
            </h2>
            <p className="text-slate-600 flex items-center gap-2 mt-1">
              <Activity size={16} />
              {result.likely_origin}
            </p>
         </div>
         <div className="flex gap-3">
            <VoiceControl text={generateBriefingText(result)} />
            <Button variant="secondary" onClick={handleClear}>New Analysis</Button>
         </div>
      </div>

      {/* Advanced Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <LayoutGrid size={16} /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('simulation')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'simulation' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Cpu size={16} /> Shadow Lab
        </button>
        <button 
          onClick={() => setActiveTab('holomap')}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'holomap' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Layers size={16} /> Holo-Map
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-l-4 border-l-brand-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                   <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Technical Root Cause</h3>
                   <p className="text-lg font-medium text-slate-800 leading-relaxed">{result.root_cause}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium text-slate-600">Confidence Score</span>
                      <span className="text-lg font-bold text-slate-800">{result.confidence_score}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-sm font-medium text-slate-600">Severity Assessment</span>
                      <SeverityBadge severity={result.severity} />
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Impact Scope</h4>
                <p className="text-sm text-slate-700">{result.impact_scope}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Prevention</h4>
                <p className="text-sm text-slate-700">{result.notes_for_future}</p>
              </div>
            </div>
          </Card>

          {/* Fix Governance Section */}
          <Card className="bg-gradient-to-br from-white to-slate-50 border-blue-100">
             <div className="flex items-center gap-2 mb-4">
                <Shield className="text-brand-600" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Fix Governance & Remediation</h3>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                   <h4 className="text-sm font-semibold text-slate-600 mb-2">Suggested Fix</h4>
                   <div className="prose prose-sm prose-slate bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <ReactMarkdown>{result.suggested_fix}</ReactMarkdown>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <h4 className="text-sm font-semibold text-slate-600 mb-2">Actions</h4>
                   
                   <Button 
                     variant="success" 
                     className="w-full justify-start" 
                     disabled={!canApprove || status === 'Approved' || status === 'Auto-Fixed'}
                     onClick={() => handleStatusChange('Approved')}
                   >
                     <CheckCircle size={18} />
                     {status === 'Approved' ? 'Fix Approved' : 'Approve Fix Proposal'}
                   </Button>
                   
                   {settings.autoFixEnabled && (
                      <Button 
                        variant="primary" 
                        className="w-full justify-start"
                        disabled={!canApprove || status === 'Auto-Fixed'}
                        onClick={() => handleStatusChange('Auto-Fixed')}
                      >
                        <Zap size={18} />
                        {status === 'Auto-Fixed' ? 'Auto-Fix Applied' : 'Apply Auto-Fix (Sim)'}
                      </Button>
                   )}

                   <Button 
                     variant="secondary" 
                     className="w-full justify-start"
                     disabled={!canModify || status === 'Resolved'}
                     onClick={() => handleStatusChange('Resolved')}
                   >
                     <Terminal size={18} />
                     Mark as Manually Resolved
                   </Button>
                   
                   <div className="pt-4 border-t border-slate-200">
                     <p className="text-xs text-slate-400">
                       Current Role: <span className="font-medium text-slate-600">{settings.userRole}</span>
                     </p>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* SHADOW LAB TAB */}
      {activeTab === 'simulation' && result.simulation_preview && (
        <div className="animate-fade-in space-y-6">
           <SimulationGauge 
             successRate={result.simulation_preview.success_probability} 
             riskRate={result.simulation_preview.regression_risk} 
             scenarios={result.simulation_preview.simulated_scenarios}
           />
           <Card>
              <h3 className="font-bold text-slate-800 mb-2">Predicted Outcome</h3>
              <p className="text-slate-600">{result.simulation_preview.predicted_outcome}</p>
           </Card>
           <Card>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Terminal className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-slate-800">Generated Validation Tests</h3>
              </div>
              <div className="prose prose-sm prose-slate max-w-none">
                 <ReactMarkdown>{result.suggested_tests}</ReactMarkdown>
              </div>
          </Card>
        </div>
      )}

      {/* HOLO-MAP TAB */}
      {activeTab === 'holomap' && result.architecture_inference && (
        <div className="animate-fade-in space-y-6">
           <BlastRadiusMap 
             nodes={result.architecture_inference.nodes}
             edges={result.architecture_inference.edges}
           />
           <Card>
              <h3 className="font-bold text-slate-800 mb-2">Blast Radius Summary</h3>
              <p className="text-slate-600">{result.architecture_inference.blast_radius_summary}</p>
           </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Main Analyzer Area */}
      <div className="flex-1 min-w-0">
        {!result ? (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">New Incident Analysis</h2>
              <p className="text-slate-500">Provide logs and context to detect the root cause.</p>
            </div>

            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Incident Title" 
                  name="title" 
                  placeholder="e.g., API 500 Error on Checkout" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                />
                <Select 
                  label="Environment" 
                  name="environment" 
                  value={formData.environment} 
                  onChange={handleInputChange} 
                  options={[
                    { value: 'Production', label: 'Production' },
                    { value: 'Staging', label: 'Staging' },
                    { value: 'Development', label: 'Development' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
              
              <Input 
                label="Service / Module Name" 
                name="serviceName" 
                placeholder="e.g., PaymentService / user-auth-module" 
                value={formData.serviceName} 
                onChange={handleInputChange} 
              />

              <div className="grid grid-cols-1 gap-6">
                 <Textarea 
                  label="Logs / Error Trace (Required)" 
                  name="logs" 
                  rows={8}
                  placeholder="Paste your stack trace, error logs, or console output here..." 
                  value={formData.logs} 
                  onChange={handleInputChange} 
                  className="font-mono text-xs"
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Textarea 
                    label="Code Snippet (Optional)" 
                    name="codeSnippet" 
                    rows={4}
                    placeholder="Paste relevant code snippet here..." 
                    value={formData.codeSnippet} 
                    onChange={handleInputChange} 
                    className="font-mono text-xs"
                  />
                  <Textarea 
                    label="Expected Behavior (Optional)" 
                    name="expectedBehavior" 
                    rows={4}
                    placeholder="What should have happened?" 
                    value={formData.expectedBehavior} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center text-sm">
                  <AlertCircle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={handleClear} type="button">Clear Form</Button>
                <Button onClick={handleSubmit} isLoading={isAnalyzing}>
                  <Zap size={18} className={isAnalyzing ? 'hidden' : ''} />
                  Analyze Root Cause
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <ResultSection result={result} />
        )}
      </div>

      {/* Right Sidebar: Live Incidents */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-4 space-y-4">
           <Card className="bg-slate-900 border-slate-800 text-white">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 Live Stream
               </h3>
               <span className="text-xs text-slate-400">Incoming</span>
             </div>
             <div className="space-y-3">
               {liveIncidents.map((incident, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => handleLoadIncident(incident)}
                   className="p-3 rounded bg-slate-800 border border-slate-700 hover:border-brand-500 cursor-pointer transition-colors group"
                 >
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-red-400">CRITICAL</span>
                      <span className="text-[10px] text-slate-500">Just now</span>
                   </div>
                   <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2 group-hover:text-brand-400">
                     {incident.title}
                   </h4>
                   <p className="text-xs text-slate-500 truncate">{incident.serviceName}</p>
                   <div className="mt-2 flex items-center text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                     Analyze <ArrowRight size={12} className="ml-1" />
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-4 pt-3 border-t border-slate-800 text-center">
               <button className="text-xs text-slate-400 hover:text-white transition-colors">View All Integrations</button>
             </div>
           </Card>
           
           <Card>
              <h3 className="font-semibold text-slate-800 mb-2">Did you know?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can connect JDBC and ODBC sources in Settings to pipe database logs directly into UDAI for analysis.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
};
