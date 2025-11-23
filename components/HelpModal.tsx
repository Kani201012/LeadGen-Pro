import React from 'react';
import { X, Search, Database, Download, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <CheckCircle2 className="w-6 h-6 mr-2 opacity-90" />
            How to use LeadGen Pro
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-indigo-500/50 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-slate-600 leading-relaxed">
            This tool uses Artificial Intelligence to scan Google Maps and build a list of business contacts for you. Follow these simple steps:
          </p>

          <div className="space-y-4">
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-50 p-2 rounded-lg mt-0.5">
                <Search className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-slate-900">1. Define your Search</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Enter a specific business type (e.g., <span className="font-mono text-xs bg-slate-100 px-1 rounded">Plumbers</span>) and a specific location (e.g., <span className="font-mono text-xs bg-slate-100 px-1 rounded">Austin, TX</span>).
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-emerald-50 p-2 rounded-lg mt-0.5">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-slate-900">2. Get Verified Results</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Click <strong>Find Leads</strong>. The AI will browse real-time map data to find phone numbers, websites, and ratings.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-amber-50 p-2 rounded-lg mt-0.5">
                <Download className="w-5 h-5 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-slate-900">3. Export Your List</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Review the results. Delete any you don't need, then click <strong>Export to CSV</strong> to save the file for Excel or Google Sheets.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Got it, let's start!
          </button>
        </div>

      </div>
    </div>
  );
};