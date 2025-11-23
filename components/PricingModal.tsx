import React from 'react';
import { Check, X, Zap, Crown, ShieldCheck } from 'lucide-react';
import { PlanTier, PlanConfig } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  onUpgrade: (plan: PlanTier) => void;
}

export const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Starter',
    price: 0,
    maxLeadsPerSearch: 10,
    features: [
      '10 Leads Per Search',
      'Basic Maps Extraction',
      'Standard Support',
      'CSV Export'
    ]
  },
  {
    id: 'PRO',
    name: 'Growth',
    price: 29,
    maxLeadsPerSearch: 50,
    recommended: true,
    features: [
      '50 Leads Per Search',
      'Priority Maps Grounding',
      'Enriched Data (Reviews)',
      'Unlimited History',
      'Email Support'
    ]
  },
  {
    id: 'BUSINESS',
    name: 'Scale',
    price: 79,
    maxLeadsPerSearch: 100,
    features: [
      '100 Leads Per Search',
      'Highest Speed Processing',
      'Advanced Data Enrichment',
      'Dedicated Account Manager',
      'API Access (Beta)'
    ]
  }
];

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, currentPlan, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="bg-indigo-900 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute right-0 top-0 bg-indigo-500 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute left-0 bottom-0 bg-purple-500 w-64 h-64 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Unlock LeadGen Potential</h2>
          <p className="text-indigo-200 max-w-xl mx-auto text-sm sm:text-base relative z-10">
            Scale your outreach with higher search limits and premium data features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 sm:p-8 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isPro = plan.id === 'PRO';
              const isBusiness = plan.id === 'BUSINESS';

              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
                    plan.recommended 
                      ? 'bg-white border-2 border-indigo-500 shadow-xl scale-105 z-10' 
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${isCurrent ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {plan.name}
                      </h3>
                      {plan.id === 'FREE' && <Zap className="w-5 h-5 text-slate-400" />}
                      {plan.id === 'PRO' && <Crown className="w-5 h-5 text-indigo-500" />}
                      {plan.id === 'BUSINESS' && <ShieldCheck className="w-5 h-5 text-purple-500" />}
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                      <span className="text-slate-500 font-medium">/mo</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className={`w-5 h-5 mr-2 shrink-0 ${plan.recommended ? 'text-indigo-500' : 'text-emerald-500'}`} />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => {
                        if (!isCurrent) onUpgrade(plan.id);
                        if (isCurrent) onClose();
                      }}
                      disabled={isCurrent}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all transform active:scale-[0.98] ${
                        isCurrent 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                          : plan.recommended
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
          
          <div className="mt-8 text-center text-xs text-slate-400">
             All plans include 100% money-back guarantee for 14 days. Secure payment processing.
          </div>
        </div>
      </div>
    </div>
  );
};