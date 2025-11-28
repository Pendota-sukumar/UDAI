
import React, { useEffect, useState, useRef } from 'react';
import { Severity, IncidentStatus, ArchitectureNode, ArchitectureEdge } from '../types';
import { CheckCircle, AlertCircle, XCircle, Clock, Check, Shield, TrendingUp, Volume2, StopCircle } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled, 
  size = 'md',
  ...props 
}) => {
  const baseStyles = "rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-400",
    success: "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 focus:ring-green-400",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
};

// --- Badges ---
export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const colors = {
    [Severity.LOW]: "bg-green-100 text-green-800 border-green-200",
    [Severity.MEDIUM]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [Severity.HIGH]: "bg-orange-100 text-orange-800 border-orange-200",
    [Severity.CRITICAL]: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[severity] || colors[Severity.LOW]}`}>
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const config = {
    'Open': { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle },
    'Resolved': { bg: 'bg-slate-100', text: 'text-slate-600', icon: CheckCircle },
    'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: Shield },
    'Auto-Fixed': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Check },
    'Wont Fix': { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle },
  };
  
  const { bg, text, icon: Icon } = config[status] || config['Open'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

// --- Input Fields ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${className}`}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <div className="relative">
      <select 
        className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm shadow-sm appearance-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-900 bg-white">{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <textarea 
      className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 font-mono
      focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${className}`}
      {...props}
    />
  </div>
);

// --- Stats & Widgets ---
export const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode; trend?: string }> = ({ label, value, icon, trend }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
         <span className="text-2xl font-bold text-slate-800">{value}</span>
         {trend && <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
           <TrendingUp size={10} className="mr-1" />
           {trend}
         </div>}
      </div>
    </div>
    {icon && <div className="text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">{icon}</div>}
  </div>
);

// --- Advanced Features ---

export const SimulationGauge: React.FC<{ successRate: number; riskRate: number; scenarios: number }> = ({ successRate, riskRate, scenarios }) => {
  const [animatedSuccess, setAnimatedSuccess] = useState(0);
  const [animatedRisk, setAnimatedRisk] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSuccess(successRate);
      setAnimatedRisk(riskRate);
    }, 300);
    return () => clearTimeout(timer);
  }, [successRate, riskRate]);

  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <TrendingUp size={100} />
      </div>
      <h3 className="text-sm uppercase tracking-widest text-brand-400 font-bold mb-6">Shadow Lab Simulation</h3>
      
      <div className="flex items-center justify-between mb-8">
         <div className="text-center">
            <div className="text-xs text-slate-400 mb-2">SCENARIOS RUN</div>
            <div className="text-2xl font-mono text-white">{scenarios.toLocaleString()}</div>
         </div>
         <div className="h-10 w-px bg-slate-700"></div>
         <div className="text-center">
            <div className="text-xs text-slate-400 mb-2">EST. SUCCESS</div>
            <div className="text-3xl font-bold text-green-400">{animatedSuccess}%</div>
         </div>
         <div className="h-10 w-px bg-slate-700"></div>
         <div className="text-center">
            <div className="text-xs text-slate-400 mb-2">REGRESSION RISK</div>
            <div className="text-3xl font-bold text-red-400">{animatedRisk}%</div>
         </div>
      </div>

      <div className="relative pt-4">
         <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase">
           <span>Projected Outcome Stability</span>
           <span>{animatedSuccess > 80 ? 'High Confidence' : 'Moderate Confidence'}</span>
         </div>
         <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-green-500 h-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedSuccess}%` }}
            />
            <div 
              className="bg-red-500 h-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedRisk}%` }}
            />
         </div>
      </div>
    </div>
  );
};

export const BlastRadiusMap: React.FC<{ nodes: ArchitectureNode[]; edges: ArchitectureEdge[] }> = ({ nodes, edges }) => {
  // Simple radial layout calculation
  const centerX = 300;
  const centerY = 200;
  const radius = 120;
  
  const getNodePos = (index: number, total: number) => {
    if (total === 1) return { x: centerX, y: centerY };
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative" style={{ height: '400px' }}>
       <div className="absolute top-4 left-4 z-10">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Shield size={16} className="text-brand-500" />
            Holo-Map Inference
          </h3>
          <p className="text-xs text-slate-500">Blast Radius Visualization</p>
       </div>

       <svg width="100%" height="100%" viewBox="0 0 600 400" className="bg-slate-50">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
             const sourceNode = nodes.find(n => n.id === edge.from);
             const targetNode = nodes.find(n => n.id === edge.to);
             if (!sourceNode || !targetNode) return null;
             
             const sIndex = nodes.indexOf(sourceNode);
             const tIndex = nodes.indexOf(targetNode);
             
             const sPos = sourceNode.type === 'Service' && nodes.length > 2 ? {x: centerX, y: centerY} : getNodePos(sIndex, nodes.length);
             const tPos = targetNode.type === 'Service' && nodes.length > 2 ? {x: centerX, y: centerY} : getNodePos(tIndex, nodes.length);

             // Heuristic: put the first "Service" in the center if possible, otherwise use circle
             
             return (
               <line 
                 key={i}
                 x1={sPos.x} y1={sPos.y}
                 x2={tPos.x} y2={tPos.y}
                 stroke="#cbd5e1"
                 strokeWidth="2"
                 markerEnd="url(#arrowhead)"
               />
             );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
             // Basic Layout Logic: Center the first node if it's likely the origin, distribute others
             let pos = { x: centerX, y: centerY };
             if (i !== 0) {
               pos = getNodePos(i - 1, nodes.length - 1);
             }

             const color = node.status === 'Compromised' ? '#ef4444' : node.status === 'Down' ? '#64748b' : '#22c55e';
             const fill = node.status === 'Compromised' ? '#fef2f2' : '#f0fdf4';

             return (
               <g key={node.id}>
                 <circle cx={pos.x} cy={pos.y} r="24" fill={fill} stroke={color} strokeWidth="2" />
                 <text x={pos.x} y={pos.y} dy="4" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">
                   {node.type === 'Database' ? 'DB' : node.type === 'Service' ? 'SVC' : 'API'}
                 </text>
                 <text x={pos.x} y={pos.y + 36} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">
                   {node.name}
                 </text>
                 {node.status === 'Compromised' && (
                    <circle cx={pos.x + 18} cy={pos.y - 18} r="8" fill="#ef4444" className="animate-pulse" />
                 )}
               </g>
             );
          })}
       </svg>
    </div>
  );
};

export const VoiceControl: React.FC<{ text: string }> = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);
  
  const speak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <Button variant="secondary" size="sm" onClick={speak} className={speaking ? "bg-brand-50 border-brand-200 text-brand-700" : ""}>
       {speaking ? <StopCircle size={16} className="mr-2 animate-pulse" /> : <Volume2 size={16} className="mr-2" />}
       {speaking ? "Stop Briefing" : "Play Mission Brief"}
    </Button>
  );
};
