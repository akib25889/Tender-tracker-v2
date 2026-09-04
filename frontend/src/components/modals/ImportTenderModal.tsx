import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';
import { Tender } from '../../types/tender';

interface ImportTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportTenderModal: React.FC<ImportTenderModalProps> = ({ isOpen, onClose }) => {
  const { addTender } = useTenders();
  const [fileName, setFileName] = useState<string>('');
  const [format, setFormat] = useState<'JSON' | 'CSV'>('JSON');
  const [parsedPreview, setParsedPreview] = useState<Partial<Tender>[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);
    setSuccessCount(null);

    const isCsv = file.name.endsWith('.csv');
    setFormat(isCsv ? 'CSV' : 'JSON');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseContent(text, isCsv ? 'CSV' : 'JSON');
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string, type: 'JSON' | 'CSV') => {
    try {
      setErrorMessage(null);
      if (type === 'JSON') {
        const parsed = JSON.parse(content);
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];
        const validated: Partial<Tender>[] = arrayData.map((item: any, idx: number) => ({
          id: item.id || `TDR-IMP-${Date.now().toString().slice(-4)}${idx}`,
          title: item.title || item.name || 'Imported Opportunity',
          organization: item.organization || item.client || 'Multilateral Entity',
          country: item.country || 'International',
          category: item.category || 'General Procurement',
          estimatedValue: Number(item.estimatedValue || item.value || 0),
          stage: item.stage || 'DISCOVERED',
          priority: item.priority || 'MEDIUM',
          submissionDeadline: item.submissionDeadline || item.deadline || '',
        }));
        setParsedPreview(validated);
      } else {
        // Parse CSV
        const lines = content.trim().split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one data row.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const validated: Partial<Tender>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((val) => val.trim().replace(/^["']|["']$/g, ''));
          const entry: any = {};
          headers.forEach((h, idx) => {
            entry[h] = row[idx] || '';
          });

          validated.push({
            id: entry.id || `TDR-CSV-${Date.now().toString().slice(-4)}${i}`,
            title: entry.title || entry.name || 'Imported Opportunity',
            organization: entry.organization || entry.client || 'Multilateral Entity',
            country: entry.country || 'International',
            category: entry.category || 'General Procurement',
            estimatedValue: Number(entry.estimatedvalue || entry.value || 0),
            stage: (entry.stage ? entry.stage.toUpperCase() : 'DISCOVERED') as any,
            priority: (entry.priority ? entry.priority.toUpperCase() : 'MEDIUM') as any,
            submissionDeadline: entry.submissiondeadline || entry.deadline || '',
          });
        }
        setParsedPreview(validated);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse file. Please verify valid JSON or CSV syntax.');
      setParsedPreview([]);
    }
  };

  const handleImport = () => {
    if (parsedPreview.length === 0) return;

    parsedPreview.forEach((tender) => {
      addTender(tender);
    });

    setSuccessCount(parsedPreview.length);
    setTimeout(() => {
      onClose();
      setParsedPreview([]);
      setFileName('');
      setSuccessCount(null);
    }, 1800);
  };

  const loadSampleData = (sampleType: 'JSON' | 'CSV') => {
    if (sampleType === 'JSON') {
      const sample = [
        {
          id: 'TDR-2026-UN-SAMPLE',
          title: 'UNHCR Refugee Biometrics Registration Infrastructure',
          organization: 'UNHCR',
          country: 'Kenya / Regional',
          category: 'Identity & Security',
          estimatedValue: 4300000,
          stage: 'DISCOVERED',
          priority: 'HIGH',
          submissionDeadline: '2026-09-30T17:00:00Z',
        },
      ];
      const text = JSON.stringify(sample, null, 2);
      setFileName('sample_tenders.json');
      setFormat('JSON');
      parseContent(text, 'JSON');
    } else {
      const sampleCsv = `title,organization,country,category,estimatedValue,stage,priority,submissionDeadline\n"Digital Customs Modernization","Asian Development Bank (ADB)","Uzbekistan","Trade Logistics",8500000,"DISCOVERED","MEDIUM","2026-10-15T12:00:00Z"`;
      setFileName('sample_tenders.csv');
      setFormat('CSV');
      parseContent(sampleCsv, 'CSV');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#2563EB]" />
            <h2 className="font-display font-bold text-sm text-[#0F172A]">
              Batch Tender Intake &amp; Dataset Import
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* File Upload / Drag Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF]/50 p-6 rounded-xl text-center cursor-pointer transition-colors space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-[#0F172A] block">
                {fileName ? fileName : 'Click to select CSV or JSON file'}
              </span>
              <span className="text-[11px] text-[#64748B]">Supports formatted RFP datasets, export dumps, and partner lead sheets</span>
            </div>
          </div>

          {/* Quick Samples */}
          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
            <span>Or test with a sample template:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadSampleData('JSON')}
                className="text-[#2563EB] hover:underline font-semibold"
              >
                Sample JSON
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => loadSampleData('CSV')}
                className="text-[#2563EB] hover:underline font-semibold"
              >
                Sample CSV
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[#B91C1C] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successCount !== null && (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[#15803D] flex items-center gap-2 font-bold animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Successfully imported {successCount} opportunity(s) into pipeline!</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0F172A]">
                  Verified Records Ready for Ingestion ({parsedPreview.length})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                  Format: {format}
                </span>
              </div>

              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">ID / Ref</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Organization</th>
                      <th className="p-2">Country</th>
                      <th className="p-2 text-right">Estimated Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="p-2 font-mono font-bold text-[#0F172A]">{item.id}</td>
                        <td className="p-2 font-medium text-[#0F172A] truncate max-w-xs">{item.title}</td>
                        <td className="p-2 text-[#64748B]">{item.organization}</td>
                        <td className="p-2 text-[#64748B]">{item.country}</td>
                        <td className="p-2 text-right font-mono font-bold text-[#0F172A]">
                          {item.estimatedValue ? `$${item.estimatedValue.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-white text-xs font-semibold text-[#64748B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleImport}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
              parsedPreview.length > 0
                ? 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Confirm Batch Ingestion ({parsedPreview.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

