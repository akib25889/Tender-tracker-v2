import React, { useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  Percent,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
  Clock,
  Coins,
} from 'lucide-react';
import {
  TenderFinancialModel,
  PaymentScenarioType,
  MilestonePaymentItem,
} from '../../types/tender';

interface FinancialScenariosEditorProps {
  value: TenderFinancialModel;
  onChange: (updated: TenderFinancialModel) => void;
  tenderCurrency?: string;
  estimatedValue?: number;
  readOnly?: boolean;
}

export const FinancialScenariosEditor: React.FC<FinancialScenariosEditorProps> = ({
  value,
  onChange,
  tenderCurrency = 'USD',
  estimatedValue = 0,
  readOnly = false,
}) => {
  const curSymbol = tenderCurrency === 'BDT' ? '৳' : tenderCurrency === 'EUR' ? '€' : '$';

  // Calculate sum of milestone percentages & amounts
  const milestoneStats = useMemo(() => {
    const totalPercent = (value.milestones || []).reduce(
      (acc, m) => acc + (Number(m.percentage) || 0),
      0
    );
    const totalAmount = (value.milestones || []).reduce(
      (acc, m) => acc + (Number(m.amount) || 0),
      0
    );
    return {
      totalPercent: Math.round(totalPercent * 100) / 100,
      totalAmount,
      isBalanced: Math.abs(totalPercent - 100) < 0.01,
    };
  }, [value.milestones]);

  // Recalculate SaaS TCV / ACV
  const saasStats = useMemo(() => {
    const sub = value.subscriptionModel;
    if (!sub) return { tcv: 0, acv: 0, tiers: [] };

    const years = Math.max(1, Number(sub.durationYears) || 1);
    const escalationRate = (Number(sub.annualEscalationRate) || 0) / 100;

    let baseAnnual = Number(sub.annualBaseFee) || 0;
    if (sub.pricingModel === 'PER_USER_LICENSE') {
      const users = Number(sub.userCount) || 0;
      const feePerUser = Number(sub.feePerUserMonthly) || 0;
      baseAnnual = users * feePerUser * 12;
    }

    const tiers: { year: number; base: number; escalated: number; increasePercent: number }[] = [];
    let currentFee = baseAnnual;
    let tcv = 0;

    for (let y = 1; y <= years; y++) {
      if (y === 1) {
        tiers.push({ year: 1, base: baseAnnual, escalated: currentFee, increasePercent: 0 });
        tcv += currentFee;
      } else {
        if (sub.pricingModel === 'MULTI_YEAR_ESCALATION') {
          currentFee = Math.round(currentFee * (1 + escalationRate));
        }
        tiers.push({
          year: y,
          base: baseAnnual,
          escalated: currentFee,
          increasePercent: sub.pricingModel === 'MULTI_YEAR_ESCALATION' ? sub.annualEscalationRate : 0,
        });
        tcv += currentFee;
      }
    }

    const acv = Math.round(tcv / years);
    return { tcv, acv, tiers };
  }, [value.subscriptionModel]);

  // Cash flow waterfall computation
  const cashFlowStats = useMemo(() => {
    const totalContract = Number(estimatedValue) || 0;
    const adv = value.advancePayment;
    const pen = value.penaltiesAndDeductions;

    const advanceInflow = adv?.enabled
      ? adv.amount || (totalContract * ((adv.percentage || 0) / 100))
      : 0;

    const retentionPercent = pen?.retentionMoney?.enabled
      ? Number(pen.retentionMoney.percentage) || 0
      : 0;
    const retentionWithheld = totalContract * (retentionPercent / 100);

    const tdsPercent = Number(pen?.taxDeductionAtSourcePercent) || 0;
    const vdsPercent = Number(pen?.vatDeductionAtSourcePercent) || 0;
    const totalTaxWithholding = totalContract * ((tdsPercent + vdsPercent) / 100);

    const netOperatingRealization = totalContract - retentionWithheld - totalTaxWithholding;
    const netTotalWithRetention = netOperatingRealization + retentionWithheld;

    return {
      totalContract,
      advanceInflow,
      retentionWithheld,
      totalTaxWithholding,
      netOperatingRealization,
      netTotalWithRetention,
    };
  }, [estimatedValue, value.advancePayment, value.penaltiesAndDeductions]);

  // Update root field helper
  const updateModel = <K extends keyof TenderFinancialModel>(key: K, val: TenderFinancialModel[K]) => {
    onChange({ ...value, [key]: val });
  };

  // Auto-balance milestones to 100%
  const handleAutoBalancePercentages = () => {
    if (!value.milestones || value.milestones.length === 0) return;
    const count = value.milestones.length;
    const evenPercent = Math.floor((100 / count) * 10) / 10;
    const remainder = Math.round((100 - evenPercent * count) * 10) / 10;

    const updated = value.milestones.map((m, idx) => {
      const p = idx === count - 1 ? Math.round((evenPercent + remainder) * 10) / 10 : evenPercent;
      const amt = estimatedValue > 0 ? Math.round(estimatedValue * (p / 100)) : m.amount;
      return { ...m, percentage: p, amount: amt };
    });
    updateModel('milestones', updated);
  };

  // Auto-calculate amounts from percentages
  const handleAutoCalculateAmounts = () => {
    if (!value.milestones || estimatedValue <= 0) return;
    const updated = value.milestones.map((m) => ({
      ...m,
      amount: Math.round(estimatedValue * ((Number(m.percentage) || 0) / 100)),
    }));
    updateModel('milestones', updated);
  };

  // Add Milestone
  const handleAddMilestone = () => {
    const current = value.milestones || [];
    const nextNum = current.length + 1;
    const remainingPercent = Math.max(0, 100 - milestoneStats.totalPercent);
    const newMilestone: MilestonePaymentItem = {
      milestoneNumber: nextNum,
      name: `Milestone ${nextNum}: Phase Deliverable`,
      percentage: remainingPercent > 0 ? remainingPercent : 15,
      amount: estimatedValue > 0 ? Math.round(estimatedValue * (remainingPercent > 0 ? remainingPercent / 100 : 0.15)) : 0,
      deliverable: 'Phase Acceptance Sign-off Certificate',
      approvalRequired: true,
      clientReviewDays: 14,
      paymentProcessingDays: 30,
      paymentTrigger: 'UPON_CLIENT_ACCEPTANCE',
      invoiceRequirements: 'Work Completion Certificate & Tax Invoice',
    };
    updateModel('milestones', [...current, newMilestone]);
  };

  // Update single milestone
  const handleUpdateMilestone = (idx: number, updates: Partial<MilestonePaymentItem>) => {
    const current = [...(value.milestones || [])];
    current[idx] = { ...current[idx], ...updates };
    if ('percentage' in updates && estimatedValue > 0 && updates.percentage !== undefined) {
      current[idx].amount = Math.round(estimatedValue * ((Number(updates.percentage) || 0) / 100));
    }
    updateModel('milestones', current);
  };

  // Remove milestone
  const handleRemoveMilestone = (idx: number) => {
    const current = (value.milestones || []).filter((_, i) => i !== idx);
    const renumbered = current.map((m, i) => ({ ...m, milestoneNumber: i + 1 }));
    updateModel('milestones', renumbered);
  };

  return (
    <div className="space-y-6">
      {/* 1. PAYMENT SCENARIO & WORKING CAPITAL RISK HEADER */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2563EB]" />
              <span>Payment Scenario &amp; Capital Risk Profile</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select the primary contract disbursement structure to model expected cash flow, payment timing, and exposure.
            </p>
          </div>

          {/* Working Capital Risk Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#475569]">Working Capital Risk:</span>
            <div className="flex items-center gap-1">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((r) => {
                const isSelected = value.workingCapitalRisk === r;
                const colors =
                  r === 'LOW'
                    ? isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : r === 'MEDIUM'
                    ? isSelected
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : isSelected
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';

                return (
                  <button
                    key={r}
                    type="button"
                    disabled={readOnly}
                    onClick={() => updateModel('workingCapitalRisk', r)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${colors}`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 Core Scenarios Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'MILESTONE_BASED' as PaymentScenarioType,
              title: 'Milestone-Based',
              desc: 'Payment released in phased tranches upon client approval of specified deliverables.',
              riskText: 'Medium Risk: Dependent on client approval speed.',
              badgeColor: 'border-blue-200 bg-blue-50/50',
            },
            {
              id: 'ADVANCE_AND_MILESTONES' as PaymentScenarioType,
              title: 'Advance + Milestones',
              desc: '10–20% mobilization advance against Bank Guarantee, with pro-rata invoice recovery.',
              riskText: 'Low Risk: Upfront working capital minimizes financing costs.',
              badgeColor: 'border-emerald-200 bg-emerald-50/50',
            },
            {
              id: 'ACCEPTANCE_BASED' as PaymentScenarioType,
              title: 'Acceptance-Based',
              desc: 'Payments tied strictly to formal UAT or Final Acceptance Certificate (FAC) review periods.',
              riskText: 'Medium-High Risk: Potential review delays & escrow holds.',
              badgeColor: 'border-amber-200 bg-amber-50/50',
            },
            {
              id: 'LUMP_SUM_FINAL' as PaymentScenarioType,
              title: 'Final Lump-Sum Only',
              desc: '100% payment deferred until full completion and client signoff of the entire contract.',
              riskText: 'High Risk: Contractor fully finances working capital throughout.',
              badgeColor: 'border-rose-200 bg-rose-50/50',
            },
          ].map((sc) => {
            const isSelected = value.paymentScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => !readOnly && updateModel('paymentScenario', sc.id)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-xs'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold text-xs ${isSelected ? 'text-[#1D4ED8]' : 'text-[#0F172A]'}`}>
                    {sc.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed mb-2">
                  {sc.desc}
                </p>
                <div className="text-[10px] font-medium text-[#475569] bg-white/70 p-1.5 rounded border border-[#E2E8F0]">
                  {sc.riskText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ADVANCE PAYMENT TERMS & RECOVERY */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Advance Payment &amp; Amortization Terms
            </h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={value.advancePayment?.enabled || false}
              onChange={(e) =>
                updateModel('advancePayment', {
                  ...value.advancePayment,
                  enabled: e.target.checked,
                  amount: e.target.checked && estimatedValue > 0 && !value.advancePayment?.amount
                    ? Math.round(estimatedValue * ((value.advancePayment?.percentage || 15) / 100))
                    : value.advancePayment?.amount || 0,
                })
              }
              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-[#CBD5E1]"
            />
            <span className="text-xs font-semibold text-[#0F172A]">
              Enable Mobilization Advance
            </span>
          </label>
        </div>

        {value.advancePayment?.enabled ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Advance Percentage (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  disabled={readOnly}
                  value={value.advancePayment.percentage || ''}
                  onChange={(e) => {
                    const pct = Number(e.target.value) || 0;
                    const amt = estimatedValue > 0 ? Math.round(estimatedValue * (pct / 100)) : value.advancePayment.amount;
                    updateModel('advancePayment', {
                      ...value.advancePayment,
                      percentage: pct,
                      amount: amt,
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A]"
                />
                <span className="absolute right-3 top-1.5 text-xs text-[#94A3B8] font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Advance Amount ({curSymbol})
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={value.advancePayment.amount || ''}
                onChange={(e) =>
                  updateModel('advancePayment', {
                    ...value.advancePayment,
                    amount: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Advance Recovery Method
              </label>
              <select
                disabled={readOnly}
                value={value.advancePayment.recoveryType || 'PRO_RATA_INVOICE'}
                onChange={(e) =>
                  updateModel('advancePayment', {
                    ...value.advancePayment,
                    recoveryType: e.target.value as any,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A]"
              >
                <option value="PRO_RATA_INVOICE">Pro-Rata Invoice Deduction</option>
                <option value="INTERIM_CERTIFICATES">Interim Milestone Deduction</option>
                <option value="BALLOON_RECOVERY">Balloon Recovery at Final Phase</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Recovery % per Invoice
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  disabled={readOnly}
                  value={value.advancePayment.recoveryPercentagePerInvoice || ''}
                  onChange={(e) =>
                    updateModel('advancePayment', {
                      ...value.advancePayment,
                      recoveryPercentagePerInvoice: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                />
                <span className="absolute right-3 top-1.5 text-xs text-[#94A3B8] font-bold">%</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Bank Guarantee Requirement for Advance
              </label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={value.advancePayment.bankGuaranteeRequired ?? true}
                    onChange={(e) =>
                      updateModel('advancePayment', {
                        ...value.advancePayment,
                        bankGuaranteeRequired: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#2563EB] border-[#CBD5E1]"
                  />
                  <span className="text-xs text-[#0F172A]">
                    Mandatory Advance Bank Guarantee (BG)
                  </span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Guarantee Instrument Format / Specifics
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="e.g. Unconditional, Irrevocable First Demand Bank Guarantee valid for 180 days"
                value={value.advancePayment.bankGuaranteeType || ''}
                onChange={(e) =>
                  updateModel('advancePayment', {
                    ...value.advancePayment,
                    bankGuaranteeType: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1] text-xs text-[#64748B] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <span>
              No advance payment is specified in this tender. 100% of contract value will be disbursed via deliverable milestones or final completion.
            </span>
          </div>
        )}
      </div>

      {/* 3. MILESTONE SCHEDULE BUILDER */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Milestone Payment Schedule Builder
            </h3>
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1 ${
                milestoneStats.isBalanced
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {milestoneStats.isBalanced ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>100% Balanced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Sum: {milestoneStats.totalPercent}% (Needs 100%)</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {estimatedValue > 0 && !readOnly && (
              <button
                type="button"
                onClick={handleAutoCalculateAmounts}
                className="px-2.5 py-1 text-xs font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-lg transition-colors flex items-center gap-1"
                title="Calculate milestone amounts from current tender estimated value"
              >
                <Sparkles className="w-3 h-3 text-[#2563EB]" />
                <span>Sync Amounts</span>
              </button>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={handleAutoBalancePercentages}
                className="px-2.5 py-1 text-xs font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-lg transition-colors flex items-center gap-1"
                title="Balance percentages evenly to exactly 100%"
              >
                <Percent className="w-3 h-3 text-[#2563EB]" />
                <span>Auto-Balance</span>
              </button>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            )}
          </div>
        </div>

        {/* Milestone Items List */}
        <div className="space-y-3">
          {(value.milestones || []).map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#CBD5E1] transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <div className="md:col-span-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {m.milestoneNumber || idx + 1}
                    </span>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="Milestone Name / Phase"
                      value={m.name || ''}
                      onChange={(e) => handleUpdateMilestone(idx, { name: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-[#0F172A]"
                    />
                  </div>
                  <input
                    type="text"
                    disabled={readOnly}
                    placeholder="Linked Deliverable / Work Product"
                    value={m.deliverable || ''}
                    onChange={(e) => handleUpdateMilestone(idx, { deliverable: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-[11px] text-[#475569]"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Share %</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        disabled={readOnly}
                        value={m.percentage ?? ''}
                        onChange={(e) => handleUpdateMilestone(idx, { percentage: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-[#0F172A]"
                      />
                      <span className="absolute right-2 top-1 text-[11px] text-[#94A3B8] font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Amount ({curSymbol})</label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={m.amount ?? ''}
                      onChange={(e) => handleUpdateMilestone(idx, { amount: Number(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5">Review Window</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        disabled={readOnly}
                        value={m.clientReviewDays ?? 14}
                        onChange={(e) => handleUpdateMilestone(idx, { clientReviewDays: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                      />
                      <span className="absolute right-2 top-1 text-[10px] text-[#94A3B8]">days</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5">Payment Term</label>
                    <select
                      disabled={readOnly}
                      value={m.paymentProcessingDays ?? 30}
                      onChange={(e) => handleUpdateMilestone(idx, { paymentProcessingDays: Number(e.target.value) || 30 })}
                      className="w-full px-1.5 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                    >
                      <option value={15}>Net 15 Days</option>
                      <option value={30}>Net 30 Days</option>
                      <option value={45}>Net 45 Days</option>
                      <option value={60}>Net 60 Days</option>
                      <option value={90}>Net 90 Days</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-1 flex items-center justify-end md:justify-center pt-2 md:pt-4">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1 text-[#94A3B8] hover:text-[#DC2626] rounded transition-colors"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#E2E8F0]/70 text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={m.approvalRequired ?? true}
                        onChange={(e) => handleUpdateMilestone(idx, { approvalRequired: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-[#2563EB] border-[#CBD5E1]"
                      />
                      <span className="font-medium text-[#334155]">Client Sign-Off Required</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <span className="text-[#94A3B8]">Trigger:</span>
                      <select
                        disabled={readOnly}
                        value={m.paymentTrigger || 'UPON_ACCEPTANCE'}
                        onChange={(e) => handleUpdateMilestone(idx, { paymentTrigger: e.target.value })}
                        className="bg-transparent font-medium text-[#2563EB] border-none text-[11px] p-0 cursor-pointer focus:ring-0"
                      >
                        <option value="UPON_SRS_APPROVAL">Upon SRS Approval</option>
                        <option value="UPON_ACCEPTANCE">Upon Client Acceptance</option>
                        <option value="UPON_UAT_ACCEPTANCE">Upon UAT Sign-off</option>
                        <option value="UPON_GO_LIVE">Upon Go-Live Commissioning</option>
                        <option value="UPON_FINAL_ACCEPTANCE">Upon Final Acceptance (FAC)</option>
                        <option value="UPON_INVOICE_SUBMISSION">Upon Invoice Submission</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#94A3B8]">Docs:</span>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="e.g. Inception Report, Signed Certificate, Tax Invoice"
                      value={m.invoiceRequirements || ''}
                      onChange={(e) => handleUpdateMilestone(idx, { invoiceRequirements: e.target.value })}
                      className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded text-[11px] text-[#334155] w-64"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!value.milestones || value.milestones.length === 0) && (
            <div className="p-6 text-center text-xs text-[#94A3B8] border border-dashed border-[#CBD5E1] rounded-xl">
              No milestone tranches created yet. Click "Add Milestone" to define the payment schedule.
            </div>
          )}
        </div>
      </div>

      {/* 4. SAAS & RECURRING REVENUE MODELER */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              SaaS &amp; Recurring Revenue Modeler (TCV / ACV)
            </h3>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Multi-Year Recurring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Pricing Structure Model
            </label>
            <select
              disabled={readOnly}
              value={value.subscriptionModel?.pricingModel || 'MULTI_YEAR_ESCALATION'}
              onChange={(e) =>
                updateModel('subscriptionModel', {
                  ...value.subscriptionModel,
                  pricingModel: e.target.value as any,
                })
              }
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A]"
            >
              <option value="MULTI_YEAR_ESCALATION">Multi-Year with Escalation</option>
              <option value="FIXED_RECURRING">Fixed Periodic Subscription</option>
              <option value="PER_USER_LICENSE">Per-User / Seat License</option>
              <option value="HYBRID_TIERED">Hybrid Base + License</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Billing Frequency
            </label>
            <select
              disabled={readOnly}
              value={value.subscriptionModel?.billingFrequency || 'ANNUAL'}
              onChange={(e) =>
                updateModel('subscriptionModel', {
                  ...value.subscriptionModel,
                  billingFrequency: e.target.value as any,
                })
              }
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
            >
              <option value="ANNUAL">Annual In Advance</option>
              <option value="QUARTERLY">Quarterly In Advance</option>
              <option value="MONTHLY">Monthly Billing</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Contract Duration (Years)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              disabled={readOnly}
              value={value.subscriptionModel?.durationYears ?? 3}
              onChange={(e) =>
                updateModel('subscriptionModel', {
                  ...value.subscriptionModel,
                  durationYears: Number(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Annual Escalation Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                disabled={readOnly}
                value={value.subscriptionModel?.annualEscalationRate ?? 5}
                onChange={(e) =>
                  updateModel('subscriptionModel', {
                    ...value.subscriptionModel,
                    annualEscalationRate: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-indigo-700"
              />
              <span className="absolute right-3 top-1.5 text-xs text-[#94A3B8] font-bold">%</span>
            </div>
          </div>

          {value.subscriptionModel?.pricingModel === 'PER_USER_LICENSE' ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Expected User Count
                </label>
                <input
                  type="number"
                  min="1"
                  disabled={readOnly}
                  value={value.subscriptionModel?.userCount || ''}
                  onChange={(e) =>
                    updateModel('subscriptionModel', {
                      ...value.subscriptionModel,
                      userCount: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Fee per User / Month ({curSymbol})
                </label>
                <input
                  type="number"
                  disabled={readOnly}
                  value={value.subscriptionModel?.feePerUserMonthly || ''}
                  onChange={(e) =>
                    updateModel('subscriptionModel', {
                      ...value.subscriptionModel,
                      feePerUserMonthly: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                />
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Base Annual Fee (Year 1) ({curSymbol})
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={value.subscriptionModel?.annualBaseFee || ''}
                onChange={(e) =>
                  updateModel('subscriptionModel', {
                    ...value.subscriptionModel,
                    annualBaseFee: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#0F172A]"
              />
            </div>
          )}
        </div>

        {/* Computed TCV / ACV Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3.5 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl border border-indigo-100">
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-900 tracking-wider">
              Total Contract Value (TCV)
            </span>
            <span className="text-base font-extrabold text-indigo-700">
              {curSymbol} {saasStats.tcv.toLocaleString()}
            </span>
            <span className="block text-[10px] text-indigo-600 mt-0.5">
              Over {value.subscriptionModel?.durationYears || 1} Years full lifecycle
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold text-blue-900 tracking-wider">
              Annual Contract Value (ACV)
            </span>
            <span className="text-base font-extrabold text-blue-700">
              {curSymbol} {saasStats.acv.toLocaleString()}
            </span>
            <span className="block text-[10px] text-blue-600 mt-0.5">
              Average annualized recurring revenue
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-700 tracking-wider">
              Year-by-Year Schedule
            </span>
            <div className="flex items-center gap-1.5 mt-1 overflow-x-auto text-[10px]">
              {saasStats.tiers.map((t) => (
                <span
                  key={t.year}
                  className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded text-slate-800 font-mono font-semibold shrink-0"
                >
                  Y{t.year}: {curSymbol}{Math.round(t.escalated / 1000).toLocaleString()}k
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. PENALTIES, DEDUCTIONS & RETENTION MONEY */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Liquidated Damages, Retention &amp; Tax Deductions
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Late Delivery Liquidated Damages */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Liquidated Damages (Delay Penalty)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={value.penaltiesAndDeductions?.liquidatedDamages?.enabled ?? true}
                  onChange={(e) =>
                    updateModel('penaltiesAndDeductions', {
                      ...value.penaltiesAndDeductions,
                      liquidatedDamages: {
                        ...value.penaltiesAndDeductions?.liquidatedDamages,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-rose-600 border-[#CBD5E1]"
                />
                <span className="text-xs text-[#475569]">Applicable</span>
              </label>
            </div>

            {value.penaltiesAndDeductions?.liquidatedDamages?.enabled && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Penalty Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      disabled={readOnly}
                      value={value.penaltiesAndDeductions?.liquidatedDamages?.rate ?? 0.5}
                      onChange={(e) =>
                        updateModel('penaltiesAndDeductions', {
                          ...value.penaltiesAndDeductions,
                          liquidatedDamages: {
                            ...value.penaltiesAndDeductions?.liquidatedDamages,
                            rate: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                    />
                    <span className="absolute right-2 top-1 text-[10px] text-[#94A3B8] font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Frequency</label>
                  <select
                    disabled={readOnly}
                    value={value.penaltiesAndDeductions?.liquidatedDamages?.frequency || 'PER_WEEK'}
                    onChange={(e) =>
                      updateModel('penaltiesAndDeductions', {
                        ...value.penaltiesAndDeductions,
                        liquidatedDamages: {
                          ...value.penaltiesAndDeductions?.liquidatedDamages,
                          frequency: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                  >
                    <option value="PER_WEEK">Per Week of Delay</option>
                    <option value="PER_DAY">Per Calendar Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Max Cap (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      disabled={readOnly}
                      value={value.penaltiesAndDeductions?.liquidatedDamages?.maxCapPercentage ?? 10}
                      onChange={(e) =>
                        updateModel('penaltiesAndDeductions', {
                          ...value.penaltiesAndDeductions,
                          liquidatedDamages: {
                            ...value.penaltiesAndDeductions?.liquidatedDamages,
                            maxCapPercentage: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-rose-700"
                    />
                    <span className="absolute right-2 top-1 text-[10px] text-[#94A3B8] font-bold">%</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-3">
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Calculation Basis</label>
                  <select
                    disabled={readOnly}
                    value={value.penaltiesAndDeductions?.liquidatedDamages?.calculationBasis || 'DELAYED_MILESTONE_VALUE'}
                    onChange={(e) =>
                      updateModel('penaltiesAndDeductions', {
                        ...value.penaltiesAndDeductions,
                        liquidatedDamages: {
                          ...value.penaltiesAndDeductions?.liquidatedDamages,
                          calculationBasis: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                  >
                    <option value="DELAYED_MILESTONE_VALUE">Delayed Deliverable Value Only (Recommended)</option>
                    <option value="TOTAL_CONTRACT_VALUE">Total Full Contract Value (High Risk)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Retention Money & DLP */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Retention Money &amp; Warranty (DLP)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={value.penaltiesAndDeductions?.retentionMoney?.enabled ?? true}
                  onChange={(e) =>
                    updateModel('penaltiesAndDeductions', {
                      ...value.penaltiesAndDeductions,
                      retentionMoney: {
                        ...value.penaltiesAndDeductions?.retentionMoney,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-amber-600 border-[#CBD5E1]"
                />
                <span className="text-xs text-[#475569]">Withholding Active</span>
              </label>
            </div>

            {value.penaltiesAndDeductions?.retentionMoney?.enabled && (
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Retention Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      disabled={readOnly}
                      value={value.penaltiesAndDeductions?.retentionMoney?.percentage ?? 10}
                      onChange={(e) =>
                        updateModel('penaltiesAndDeductions', {
                          ...value.penaltiesAndDeductions,
                          retentionMoney: {
                            ...value.penaltiesAndDeductions?.retentionMoney,
                            percentage: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-amber-700"
                    />
                    <span className="absolute right-2 top-1 text-[10px] text-[#94A3B8] font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">DLP Period</label>
                  <div className="relative">
                    <input
                      type="number"
                      disabled={readOnly}
                      value={value.penaltiesAndDeductions?.retentionMoney?.dlpMonths ?? 12}
                      onChange={(e) =>
                        updateModel('penaltiesAndDeductions', {
                          ...value.penaltiesAndDeductions,
                          retentionMoney: {
                            ...value.penaltiesAndDeductions?.retentionMoney,
                            dlpMonths: Number(e.target.value) || 12,
                          },
                        })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                    />
                    <span className="absolute right-2 top-1 text-[10px] text-[#94A3B8]">months</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">Release Condition</label>
                  <select
                    disabled={readOnly}
                    value={value.penaltiesAndDeductions?.retentionMoney?.releaseCondition || 'DLP_EXPIRY'}
                    onChange={(e) =>
                      updateModel('penaltiesAndDeductions', {
                        ...value.penaltiesAndDeductions,
                        retentionMoney: {
                          ...value.penaltiesAndDeductions?.retentionMoney,
                          releaseCondition: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                  >
                    <option value="DLP_EXPIRY">100% Release upon Expiry of Defect Liability Period</option>
                    <option value="FINAL_ACCEPTANCE_50_DLP_50">50% upon FAC + 50% upon DLP Expiry</option>
                    <option value="BG_SUBSTITUTION">Immediate Release Against Retention Bank Guarantee</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statutory Tax Deductions Row */}
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">
              Tax Deducted at Source (TDS %)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                disabled={readOnly}
                value={value.penaltiesAndDeductions?.taxDeductionAtSourcePercent ?? 5}
                onChange={(e) =>
                  updateModel('penaltiesAndDeductions', {
                    ...value.penaltiesAndDeductions,
                    taxDeductionAtSourcePercent: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
              />
              <span className="absolute right-3 top-1.5 text-xs text-[#94A3B8] font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">
              VAT Deducted at Source (VDS %)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                disabled={readOnly}
                value={value.penaltiesAndDeductions?.vatDeductionAtSourcePercent ?? 7.5}
                onChange={(e) =>
                  updateModel('penaltiesAndDeductions', {
                    ...value.penaltiesAndDeductions,
                    vatDeductionAtSourcePercent: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
              />
              <span className="absolute right-3 top-1.5 text-xs text-[#94A3B8] font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#64748B] mb-0.5">
              SLA Breach Deduction Max Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                disabled={readOnly}
                value={value.penaltiesAndDeductions?.slaDeductionRate ?? 1}
                onChange={(e) =>
                  updateModel('penaltiesAndDeductions', {
                    ...value.penaltiesAndDeductions,
                    slaDeductionRate: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
              />
              <span className="absolute right-3 top-1.5 text-xs text-[#94A3B8] font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. EXPECTED NET CASH FLOW WATERFALL LEDGER */}
      <div className="bg-[#0F172A] text-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Expected Net Cash Flow Realization Waterfall</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Real-time projection of gross contract value, interim withholdings, statutory taxes, and net realized liquidity.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
            {curSymbol} {cashFlowStats.totalContract.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-4">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Gross Contract Base
            </span>
            <span className="text-sm font-extrabold text-white mt-1 block">
              {curSymbol} {cashFlowStats.totalContract.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">100% Total Billed</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
              Mobilization Advance
            </span>
            <span className="text-sm font-extrabold text-emerald-400 mt-1 block">
              + {curSymbol} {cashFlowStats.advanceInflow.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {value.advancePayment?.enabled ? `${value.advancePayment.percentage}% upfront capital` : 'No advance'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
              Retention &amp; Statutory Withheld
            </span>
            <span className="text-sm font-extrabold text-amber-400 mt-1 block">
              - {curSymbol} {Math.round(cashFlowStats.retentionWithheld + cashFlowStats.totalTaxWithholding).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Retention ({value.penaltiesAndDeductions?.retentionMoney?.percentage || 0}%) + Taxes
            </span>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-600/40">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold block">
              Net Operating Realization
            </span>
            <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
              {curSymbol} {Math.round(cashFlowStats.netOperatingRealization).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-200 mt-0.5 block">
              During execution phases
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
          <span>
            * Retention money ({curSymbol} {Math.round(cashFlowStats.retentionWithheld).toLocaleString()}) released at completion of {value.penaltiesAndDeductions?.retentionMoney?.dlpMonths || 12}-month Defect Liability Period (DLP).
          </span>
          <span className="text-slate-300 font-semibold">
            Final Realized: {curSymbol} {Math.round(cashFlowStats.netTotalWithRetention).toLocaleString()} (after DLP)
          </span>
        </div>
      </div>
    </div>
  );
};
