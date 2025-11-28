
import React, { useEffect, useState } from 'react';
import { Trash2, ChevronRight, Calendar, Search, History as HistoryIcon, BarChart3, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { getHistory, clearHistory, getAuditLog } from '../services/storageService';
import { HistoryItem, AuditLogEntry } from '../types';
import { Card, SeverityBadge, Button, StatusBadge, StatCard } from '../components/Components';
import ReactMarkdown from 'react-markdown';

export const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    setAuditLog(getAuditLog());
  }, []);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all history and audit logs?")) {
      clearHistory();
      setHistory([]);
      setAuditLog([]);
      setSelectedItem(null);
    }
  };

  // Stats Calculation
  const totalIncidents = history.length;
  const resolvedIncidents = history.filter(h => ['Resolved', 'Approved', 'Auto-Fixed'].includes(h.status)).length;
  const openIncidents = history.filter(h => h.status === 'Open').length;
  const avgConfidence = totalIncidents > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.result.confidence_score, 0) / totalIncidents) 
    : 0;

  const filteredHistory = history.filter(item => 
    (item.formData.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.result.root_cause || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  if (selectedItem) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setSelectedItem(null)}
          className="mb-4 text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center"
        >
          ← Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start mb-6">
           <div>
             <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-800">{selectedItem.formData.title || 'Untitled Incident'}</h1>
                <StatusBadge status={selectedItem.status} />
             </div>
             <p className="text-slate-500 text-sm">{formatDate(selectedItem.timestamp)} • {selectedItem.formData.environment}</p>
           </div>
           <SeverityBadge severity={selectedItem.result.severity} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
             <Card title="Analysis Summary">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Root Cause</h4>
                  <p className="text-slate-800">{selectedItem.result.root_cause}</p>
               </div>
               <div className="prose prose-sm prose-slate max-w-none">
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Proposed Fix</h4>
                  <ReactMarkdown>{selectedItem.result.suggested_fix}</ReactMarkdown>
               </div>
             </Card>
           </div>

           <div className="space-y-6">
              <Card title="Incident Context">
                <div className="space-y-3">
                   <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Origin</span>
                      <p className="text-sm text-slate-700">{selectedItem.result.likely_origin}</p>
                   </div>
                   <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Impact</span>
                      <p className="text-sm text-slate-700">{selectedItem.result.impact_scope}</p>
                   </div>
                   <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Log Snippet</span>
                      <pre className="text-[10px] bg-slate-900 text-slate-300 p-2 rounded overflow-x-auto mt-1">
                        {selectedItem.formData.logs.slice(0, 200)}...
                      </pre>
                   </div>
                </div>
              </Card>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Dashboard Stats */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Operations Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard label="Total Incidents" value={totalIncidents} icon={<BarChart3 size={20} />} />
           <StatCard label="Resolved" value={resolvedIncidents} icon={<CheckCircle size={20} />} trend="+12% vs last week" />
           <StatCard label="Open Issues" value={openIncidents} icon={<AlertTriangle size={20} />} />
           <StatCard label="Avg Confidence" value={`${avgConfidence}%`} icon={<Clock size={20} />} />
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* History List */}
         <div className="lg:col-span-2 space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Incident History</h3>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                   <input 
                     type="text" 
                     placeholder="Search..."
                     className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-brand-500 focus:outline-none"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>

             {history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                   <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                      <HistoryIcon size={24} />
                   </div>
                   <p className="text-slate-500">No incidents recorded yet.</p>
                </div>
             ) : (
                <div className="space-y-3">
                  {filteredHistory.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-4">
                           <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800 truncate">{item.formData.title || 'Untitled Incident'}</h3>
                              <StatusBadge status={item.status} />
                           </div>
                           <p className="text-sm text-slate-600 line-clamp-1 mb-2">{item.result.root_cause}</p>
                           <div className="flex items-center text-xs text-slate-400 gap-3">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.timestamp)}</span>
                              <span>•</span>
                              <SeverityBadge severity={item.result.severity} />
                           </div>
                        </div>
                        <div className="self-center">
                           <ChevronRight className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             )}
             
             {history.length > 0 && (
               <div className="text-right">
                  <button onClick={handleClearHistory} className="text-xs text-red-500 hover:text-red-700 flex items-center justify-end gap-1 ml-auto">
                    <Trash2 size={12} /> Clear All History
                  </button>
               </div>
             )}
         </div>

         {/* Audit Log Sidebar */}
         <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">System Audit Log</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="max-h-[500px] overflow-y-auto">
                 {auditLog.length === 0 ? (
                    <p className="p-4 text-xs text-slate-500 text-center">No activity recorded.</p>
                 ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th className="p-3 font-semibold text-slate-600">Action</th>
                            <th className="p-3 font-semibold text-slate-600">User</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {auditLog.map(log => (
                           <tr key={log.id}>
                              <td className="p-3">
                                 <p className="font-medium text-slate-800">{log.action}</p>
                                 <p className="text-slate-500 mt-0.5 truncate max-w-[140px]" title={log.details}>{log.details}</p>
                                 <p className="text-slate-400 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                              </td>
                              <td className="p-3 align-top">
                                 <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                   {log.userRole}
                                 </span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                    </table>
                 )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
