import React, { useState } from 'react';
import { X, Plus, DollarSign } from 'lucide-react';
import { useTenders } from '../../context/TenderContext';
import { TenderPriority } from '../../types/tender';

export const NewTenderModal: React.FC = () => {
  const { isNewTenderModalOpen, setIsNewTenderModalOpen, addTender } = useTenders();

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('UNDP (United Nations Development Programme)');
  const [country, setCountry] = useState('Switzerland / Regional');
  const [category, setCategory] = useState('IT & Cloud Infrastructure');
  const [estimatedValue, setEstimatedValue] = useState('2500000');
  const [deadline, setDeadline] = useState('2026-09-24');
  const [priority, setPriority] = useState<TenderPriority>('HIGH');

  if (!isNewTenderModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTender({
      title,
      organization,
      country,
      category,
      estimatedValue: Number(estimatedValue),
      submissionDeadline: new Date(deadline).toISOString(),
      priority,
      stage: 'DISCOVERED',
    });
    setIsNewTenderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div>
            <h3 className="font-display text-base font-bold text-[#0F172A]">
              Create New Tender Opportunity
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Intake new RFP for screening and Go/No-Go analysis
            </p>
          </div>
          <button
            onClick={() => setIsNewTenderModalOpen(false)}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Tender Opportunity / SOW Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. National Healthcare Cloud & Telemedicine Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Issuing Organization / Donor *
              </label>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="UNDP (United Nations Development Programme)">UNDP</option>
                <option value="World Bank Group">World Bank Group</option>
                <option value="Asian Development Bank (ADB)">Asian Development Bank</option>
                <option value="European Commission (DG DIGIT)">European Commission</option>
                <option value="Ministry of Finance & Revenue">Ministry of Finance</option>
                <option value="Ministry of Health">Ministry of Health</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Jurisdiction / Country *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Estimated Net Value ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="number"
                  required
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                SOW Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="IT & Cloud Infrastructure">IT &amp; Cloud Infrastructure</option>
                <option value="Healthcare Systems">Healthcare Systems</option>
                <option value="Cybersecurity & Energy">Cybersecurity &amp; Energy</option>
                <option value="Identity & Security">Identity &amp; Security</option>
                <option value="Government Software">Government Software</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Submission Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Initial Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TenderPriority)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="CRITICAL">Critical (High Value / Short Window)</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setIsNewTenderModalOpen(false)}
              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Tender Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

