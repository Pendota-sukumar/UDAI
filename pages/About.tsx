import React from 'react';
import { Card } from '../components/Components';
import { Bug, Shield, Code } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-brand-100 p-4 rounded-full">
            <Bug className="w-12 h-12 text-brand-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">UDAI</h1>
        <p className="text-lg text-slate-600 mb-6">Universal Debugger AI</p>
        <p className="text-slate-700 max-w-xl mx-auto leading-relaxed">
          This tool analyzes logs, errors, and code using AI to identify root cause, impact, and recommended fixes. 
          It streamlines the incident response process by providing instant, structured technical insights.
        </p>
        <div className="mt-8 pt-6 border-t border-slate-100">
           <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full tracking-wide uppercase">
             Version v0.1.0
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <Card className="h-full">
           <div className="flex items-center gap-3 mb-3">
              <Shield className="text-orange-500" />
              <h3 className="font-semibold text-slate-800">Disclaimer</h3>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed">
             AI-generated debugging suggestions must be reviewed by humans before use in production. 
             UDAI assists in diagnosis but does not replace human judgment. Always verify code changes in a safe environment.
           </p>
        </Card>
        
        <Card className="h-full">
           <div className="flex items-center gap-3 mb-3">
              <Code className="text-blue-500" />
              <h3 className="font-semibold text-slate-800">Tech Stack</h3>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed">
             Built with React, TypeScript, Tailwind CSS, and powered by Google Gemini 2.5 Flash via the Gemini API. 
             All data is processed securely and history is stored locally on your device.
           </p>
        </Card>
      </div>
    </div>
  );
};
