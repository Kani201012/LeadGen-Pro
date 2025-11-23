import React from 'react';
import { Lead } from '../types';
import { Globe, Phone, MapPin, Building2, Star, Trash2 } from 'lucide-react';

interface ResultsTableProps {
  leads: Lead[];
  onRemove: (id: string) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ leads, onRemove }) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No leads generated</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
          Configure your search parameters above and click "Find Leads" to populate this list.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Business Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{lead.name}</span>
                    <span className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {lead.description || 'No description available.'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {lead.rating ? (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1.5" />
                      <span className="text-sm font-medium text-slate-900">{lead.rating}</span>
                      <span className="text-xs text-slate-400 ml-1">({lead.reviewCount || 0})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {lead.phone ? (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                        {lead.phone}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic pl-6">No Phone</span>
                    )}
                    
                    {lead.website ? (
                      <a 
                        href={lead.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5 mr-2" />
                        Website
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic pl-6">No Website</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {lead.address ? (
                    <div className="flex items-start text-sm text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 text-emerald-500 shrink-0" />
                      <span className="line-clamp-2" title={lead.address}>{lead.address}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No Address</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onRemove(lead.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};