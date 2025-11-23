import React, { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Download, Loader2, Database, AlertCircle, Clock, ArrowRight, HelpCircle, Lock, Crown } from 'lucide-react';
import { findLeads } from './services/geminiService';
import { exportToCSV } from './utils/csvHelper';
import { Lead, AppState, SearchParams, SearchHistoryItem, PlanTier } from './types';
import { ResultsTable } from './components/ResultsTable';
import { HelpModal } from './components/HelpModal';
import { PricingModal, PLANS } from './components/PricingModal';

const STORAGE_KEY = 'leadgen_history';
const PLAN_KEY = 'leadgen_plan';

const App: React.FC = () => {
  const [params, setParams] = useState<SearchParams>({
    term: '',
    location: '',
    count: 10
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('FREE');

  // Load history and plan on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setShowHelp(true);
      }

      const storedPlan = localStorage.getItem(PLAN_KEY);
      if (storedPlan) {
        setCurrentPlan(storedPlan as PlanTier);
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  const handleUpgrade = (newPlan: PlanTier) => {
    setCurrentPlan(newPlan);
    localStorage.setItem(PLAN_KEY, newPlan);
    setShowPricing(false);
    
    // Confetti or toast could go here
    // If upgrading to pro, we might want to default the user to a higher count
    if (newPlan === 'PRO') setParams(prev => ({ ...prev, count: 20 }));
    if (newPlan === 'BUSINESS') setParams(prev => ({ ...prev, count: 50 }));
  };

  const getPlanLimit = () => {
    return PLANS.find(p => p.id === currentPlan)?.maxLeadsPerSearch || 10;
  };

  const addToHistory = (params: SearchParams, count: number) => {
    const newItem: SearchHistoryItem = {
      ...params,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      resultsCount: count
    };
    const newHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const loadFromHistory = (item: SearchHistoryItem) => {
    setParams({ term: item.term, location: item.location, count: item.count });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCountChange = (value: number) => {
    const maxLimit = getPlanLimit();
    
    if (value > maxLimit) {
      setShowPricing(true);
      return;
    }
    setParams(prev => ({ ...prev, count: value }));
  };

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.term || !params.location) return;

    setAppState(AppState.LOADING);
    setErrorMsg('');
    setLeads([]);

    try {
      const data = await findLeads(params.term, params.location, params.count);
      setLeads(data);
      setAppState(AppState.SUCCESS);
      addToHistory(params, data.length);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Failed to fetch leads. Please check your API key and try again.");
    }
  }, [params, history]);

  const handleRemoveLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const handleExport = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    exportToCSV(leads, `leads_${params.term.replace(/\s+/g, '_')}_${timestamp}.csv`);
  }, [leads, params.term]);

  const maxLimit = getPlanLimit();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
        currentPlan={currentPlan}
        onUpgrade={handleUpgrade}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              LeadGen <span className="text-indigo-600">Pro</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             {/* Plan Badge */}
             <div 
               onClick={() => setShowPricing(true)}
               className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                 currentPlan === 'FREE' 
                   ? 'bg-slate-100 text-slate-600 border-slate-200' 
                   : 'bg-indigo-50 text-indigo-700 border-indigo-100'
               }`}
             >
                {currentPlan === 'FREE' ? (
                  <span>Starter Plan</span>
                ) : (
                  <>
                    <Crown className="w-3 h-3 text-indigo-600 mr-1" />
                    <span>{currentPlan === 'PRO' ? 'Pro' : 'Business'} Plan</span>
                  </>
                )}
             </div>

             <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
             
             {currentPlan === 'FREE' && (
               <button 
                onClick={() => setShowPricing(true)}
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all"
               >
                 Upgrade
               </button>
             )}

             <button 
               onClick={() => setShowHelp(true)}
               className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
             >
               <HelpCircle className="w-5 h-5 sm:mr-1.5" />
               <span className="hidden sm:inline">Help</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Search & History */}
          <div className="space-y-6">
            
            {/* Search Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Search className="w-32 h-32" />
              </div>
              
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center relative z-10">
                <Search className="w-5 h-5 mr-2 text-indigo-600" />
                New Search
              </h2>
              <form onSubmit={handleSearch} className="space-y-4 relative z-10">
                
                <div className="space-y-1.5">
                  <label htmlFor="term" className="block text-sm font-medium text-slate-700">Business / Niche</label>
                  <input
                    type="text"
                    id="term"
                    required
                    placeholder="e.g. Roofers, Dentists"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all shadow-sm"
                    value={params.term}
                    onChange={(e) => setParams(prev => ({ ...prev, term: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                  <div className="relative">
                     <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      id="location"
                      required
                      placeholder="e.g. Austin, TX"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all shadow-sm"
                      value={params.location}
                      onChange={(e) => setParams(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="count" className="block text-sm font-medium text-slate-700">Result Limit</label>
                    {currentPlan === 'FREE' && (
                      <span onClick={() => setShowPricing(true)} className="text-xs text-indigo-600 cursor-pointer hover:underline font-medium">
                        Increase Limit
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      id="count"
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white shadow-sm appearance-none"
                      value={params.count}
                      onChange={(e) => handleCountChange(Number(e.target.value))}
                    >
                      <option value={5}>5 Leads (Fast)</option>
                      <option value={10}>10 Leads (Free Limit)</option>
                      <option value={20}>20 Leads {maxLimit < 20 ? '🔒' : ''}</option>
                      <option value={30}>30 Leads {maxLimit < 30 ? '🔒' : ''}</option>
                      <option value={50}>50 Leads {maxLimit < 50 ? '🔒' : ''}</option>
                      <option value={100}>100 Leads {maxLimit < 100 ? '🔒' : ''}</option>
                    </select>
                    {/* Custom Arrow because standard select arrow is boring */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={appState === AppState.LOADING}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2 transform active:scale-[0.98]"
                >
                  {appState === AppState.LOADING ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Scanning Maps...
                    </>
                  ) : (
                    <>
                      Find Leads
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    Recent Searches
                  </h3>
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors hover:underline"
                  >
                    Clear History
                  </button>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left group p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">{item.term}</p>
                          <p className="text-xs text-slate-500">{item.location}</p>
                        </div>
                        <span className="text-xs font-medium bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                          {item.resultsCount}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Error Banner */}
            {appState === AppState.ERROR && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start animate-fade-in shadow-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Search Failed</h3>
                  <div className="mt-1 text-sm text-red-700">{errorMsg}</div>
                </div>
              </div>
            )}

            {/* Results Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Search Results</h2>
                <p className="text-sm text-slate-500">
                  {appState === AppState.SUCCESS 
                    ? `Found ${leads.length} verified businesses` 
                    : 'Enter criteria to start generating leads'}
                </p>
              </div>
              
              {leads.length > 0 && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-emerald-200 shadow-sm text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  <Download className="-ml-1 mr-2 h-4 w-4" />
                  Export to CSV
                </button>
              )}
            </div>

            {/* Main Table */}
            <ResultsTable leads={leads} onRemove={handleRemoveLead} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;