import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useTenders } from '../../context/TenderContext';
import { Award, CheckCircle2, XCircle } from 'lucide-react';

export const TenderResultTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tenders, updateTenderStage } = useTenders();
  const tender = tenders.find((t) => t.id === id) || tenders[0];

  const [outcome, setOutcome] = useState<'AWARDED' | 'LOST'>(
    tender.stage === 'AWARDED' ? 'AWARDED' : 'LOST'
  );
  const [awardedAmount, setAwardedAmount] = useState(
    tender.estimatedValue.toString()
  );
  const [lossReason, setLossReason] = useState('Price Competitiveness');
  const [notes, setNotes] = useState(
    'Evaluated high technical score (92/100). Competitor discount was 4.2% below margin limit.'
  );
  const [saved, setSaved] = useState(false);

  const handleRecordResult = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenderStage(tender.id, outcome);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Tender Outcome &amp; Debrief Ledger"
        subtitle="Formal contract confirmation or structured loss root-cause debrief tracking"
      >
        {saved && (
          <div className="mb-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[#15803D] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tender outcome recorded and fed to Win/Loss Analytics Suite!</span>
          </div>
        )}

        <form onSubmit={handleRecordResult} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Final Evaluation Outcome *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome('AWARDED')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    outcome === 'AWARDED'
                      ? 'bg-[#16A34A] text-white border-[#16A34A]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Contract Won / Awarded</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('LOST')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    outcome === 'LOST'
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Bid Lost / Non-Award</span>
                </button>
              </div>
            </div>

            {outcome === 'AWARDED' ? (
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Final Awarded Contract Value ($ USD) *
                </label>
                <input
                  type="number"
                  value={awardedAmount}
                  onChange={(e) => setAwardedAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono font-bold text-[#0F172A]"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Primary Root-Cause Loss Reason *
                </label>
                <select
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                >
                  <option value="Price Competitiveness">Price Competitiveness (Commercial Margin)</option>
                  <option value="Technical Specification Gap">Technical Specification Gap</option>
                  <option value="Past Reference Weighting">Past Reference / Turnover Weighting</option>
                  <option value="Compliance Disqualification">Compliance Disqualification</option>
                  <option value="Late Submission / Portal Glitch">Late Submission / Portal Glitch</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">
              Debrief Notes &amp; Competitive Analysis *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
            >
              Record Outcome Evaluation
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
