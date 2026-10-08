import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Tender, UserProfile } from '../../types/tender';
import {
  exportTenderAsJSON,
  exportTenderAsMarkdown,
  exportTenderAsWord,
  exportTenderAsPDF,
  exportPipelineAsJSON,
  exportPipelineAsMarkdown,
  exportPipelineAsWord,
  exportPipelineAsPDF,
  exportPersonnelDossierAsPDF,
  exportPersonnelDossierAsExcel,
  exportPersonnelDossierAsMarkdown,
  exportPersonnelDossierAsJSON,
} from '../../utils/exportUtils';

interface ExportDropdownProps {
  tender?: Tender;
  tenders?: Tender[];
  user?: UserProfile;
  label?: string;
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  tender,
  tenders,
  user,
  label = 'Export',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'PDF' | 'DOCX' | 'MD' | 'JSON') => {
    setIsOpen(false);

    if (user) {
      switch (format) {
        case 'PDF':
          exportPersonnelDossierAsPDF(user);
          break;
        case 'DOCX':
          exportPersonnelDossierAsExcel(user);
          break;
        case 'MD':
          exportPersonnelDossierAsMarkdown(user);
          break;
        case 'JSON':
          exportPersonnelDossierAsJSON(user);
          break;
      }
    } else if (tender) {
      switch (format) {
        case 'PDF':
          exportTenderAsPDF(tender);
          break;
        case 'DOCX':
          exportTenderAsWord(tender);
          break;
        case 'MD':
          exportTenderAsMarkdown(tender);
          break;
        case 'JSON':
          exportTenderAsJSON(tender);
          break;
      }
    } else if (tenders) {
      switch (format) {
        case 'PDF':
          exportPipelineAsPDF(tenders);
          break;
        case 'DOCX':
          exportPipelineAsWord(tenders);
          break;
        case 'MD':
          exportPipelineAsMarkdown(tenders);
          break;
        case 'JSON':
          exportPipelineAsJSON(tenders);
          break;
      }
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span>{label}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)] ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-lg bg-[var(--bg-surface)] shadow-xl border border-[var(--border-default)] z-50 py-1 divide-y divide-[var(--border-subtle)] animate-fadeIn text-xs">
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => handleExport('PDF')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-[var(--crit)]" />
                <div>
                  <span className="font-semibold block text-xs">PDF Document</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {user ? 'Print / save Tech-1 CV' : 'Print / save as .pdf'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">.pdf</span>
            </button>

            <button
              onClick={() => handleExport('DOCX')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className={`w-4 h-4 ${user ? 'text-[var(--ok)]' : 'text-[var(--accent)]'}`} />
                <div>
                  <span className="font-semibold block text-xs">
                    {user ? 'Excel Spreadsheet' : 'Word Document'}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {user ? 'Project ledger .csv' : 'Editable .docx / .doc'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">
                {user ? '.csv' : '.docx'}
              </span>
            </button>

            <button
              onClick={() => handleExport('MD')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[var(--ok)]" />
                <div>
                  <span className="font-semibold block text-xs">Markdown Brief</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    Structured GitHub .md
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">.md</span>
            </button>

            <button
              onClick={() => handleExport('JSON')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-[var(--warn)]" />
                <div>
                  <span className="font-semibold block text-xs">Raw JSON Data</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    Database schema payload
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">.json</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

