import { Lead } from '../types';

export const exportToCSV = (leads: Lead[], filename: string) => {
  if (!leads || leads.length === 0) return;

  const headers = ['Business Name', 'Email Address', 'Phone Number', 'Website URL', 'Street Address', 'Rating', 'Reviews', 'Description'];
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => {
      const row = [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.website || '').replace(/"/g, '""')}"`,
        `"${(lead.address || '').replace(/"/g, '""')}"`,
        `"${(lead.rating || '')}"`,
        `"${(lead.reviewCount || '')}"`,
        `"${(lead.description || '').replace(/"/g, '""')}"`,
      ];
      return row.join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};