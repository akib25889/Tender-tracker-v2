import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Tender } from '../../types/tender';
import {
  exportTenderAsJSON,
  exportTenderAsMarkdown,
  exportTenderAsWord,
  exportTenderAsPDF,
  exportPipelineAsJSON,
  exportPipelineAsMarkdown,
  exportPipelineAsWord,
  exportPipelineAsPDF,
} from '../../utils/exportUtils';

interface ExportDropdownProps {
  tender?: Tender;
  tenders?: Tender[];
  label?: string;
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  tender,
  tenders,
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

    if (tender) {
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
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-[#64748B]" />
        <span>{label}</span>
        <ChevronDown className="w-3 h-3 text-[#94A3B8] ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-lg bg-white shadow-xl border border-[#E2E8F0] z-50 py-1 divide-y divide-[#F1F5F9] animate-fadeIn text-xs">
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => handleExport('PDF')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#0F172A] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-[#DC2626]" />
                <div>
                  <span className="font-semibold block text-xs">PDF Document</span>
                  <span className="text-[10px] text-[#64748B]">
                    Print / save as .pdf
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#94A3B8] font-bold">.pdf</span>
            </button>

            <button
              onClick={() => handleExport('DOCX')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#0F172A] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <span className="font-semibold block text-xs">Word Document</span>
                  <span className="text-[10px] text-[#64748B]">
                    Editable .docx / .doc
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#94A3B8] font-bold">.docx</span>
            </button>

            <button
              onClick={() => handleExport('MD')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#0F172A] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#16A34A]" />
                <div>
                  <span className="font-semibold block text-xs">Markdown Brief</span>
                  <span className="text-[10px] text-[#64748B]">
                    Structured GitHub .md
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#94A3B8] font-bold">.md</span>
            </button>

            <button
              onClick={() => handleExport('JSON')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#0F172A] flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-[#D97706]" />
                <div>
                  <span className="font-semibold block text-xs">Raw JSON Data</span>
                  <span className="text-[10px] text-[#64748B]">
                    Database schema payload
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#94A3B8] font-bold">.json</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

