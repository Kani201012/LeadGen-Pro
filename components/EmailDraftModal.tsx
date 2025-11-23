import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, Sparkles, Send } from 'lucide-react';

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  businessName: string;
  emailData: { subject: string; body: string } | null;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({ 
  isOpen, 
  onClose, 
  loading, 
  businessName, 
  emailData 
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopy = () => {
    if (!emailData) return;
    const fullText = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
            <h2 className="text-lg font-bold">AI Email Draft</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="font-medium">Analyzing business details...</p>
              <p className="text-sm mt-1">Crafting the perfect outreach for {businessName}</p>
            </div>
          ) : emailData ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Line</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-sm">
                  {emailData.subject}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Body</label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm whitespace-pre-wrap leading-relaxed h-64 overflow-y-auto font-mono">
                  {emailData.body}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button
                  onClick={handleCopy}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                 >
                   {copied ? (
                     <>
                       <Check className="w-4 h-4 mr-2" />
                       Copied to Clipboard
                     </>
                   ) : (
                     <>
                       <Copy className="w-4 h-4 mr-2" />
                       Copy Email
                     </>
                   )}
                 </button>
              </div>
            </div>
          ) : (
             <div className="text-center py-8 text-red-500">Failed to generate email. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
};
