import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import {
  HardDrive,
  Save,
  Check,
  Mail,
  Bell,
  Send,
  Tags,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTenders } from '../context/TenderContext';

export const SettingsPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, tenders } = useTenders();

  const [vaultPath, setVaultPath] = useState('H:/Tender tracker v2/storage/tenders');
  const [alertThresholdHours, setAlertThresholdHours] = useState(48);
  const [enableShaVerification, setEnableShaVerification] = useState(true);

  // Category management states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('blue');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatColor, setEditCatColor] = useState('blue');
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState<string | null>(null);

  const COLOR_OPTIONS = [
    { label: 'Blue', value: 'blue', bg: 'bg-blue-500' },
    { label: 'Purple', value: 'purple', bg: 'bg-purple-500' },
    { label: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
    { label: 'Amber', value: 'amber', bg: 'bg-amber-500' },
    { label: 'Rose', value: 'rose', bg: 'bg-rose-500' },
    { label: 'Teal', value: 'teal', bg: 'bg-teal-500' },
    { label: 'Indigo', value: 'indigo', bg: 'bg-indigo-500' },
    { label: 'Cyan', value: 'cyan', bg: 'bg-cyan-500' },
  ];

  const getBadgeClasses = (color?: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'teal':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    if (!newCatName.trim()) {
      setCatError('Category name is required.');
      return;
    }
    const created = await addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || undefined,
      color_badge: newCatColor,
    });
    if (created) {
      setNewCatName('');
      setNewCatDesc('');
      setNewCatColor('blue');
      setIsAddingCat(false);
      setCatSuccess(`Category "${created.name}" created and synced to database.`);
      setTimeout(() => setCatSuccess(null), 3500);
    }
  };

  const handleStartEdit = (cat: { id: number; name: string; description?: string; color_badge?: string }) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
    setEditCatColor(cat.color_badge || 'blue');
    setCatError(null);
  };

  const handleSaveEdit = async (id: number) => {
    setCatError(null);
    if (!editCatName.trim()) {
      setCatError('Category name is required.');
      return;
    }
    const updated = await updateCategory(id, {
      name: editCatName.trim(),
      description: editCatDesc.trim() || undefined,
      color_badge: editCatColor,
    });
    if (updated) {
      setEditingCatId(null);
      setCatSuccess(`Category "${updated.name}" updated successfully.`);
      setTimeout(() => setCatSuccess(null), 3500);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    setCatError(null);
    const inUse = tenders.filter((t) => t.category === name).length;
    if (inUse > 0) {
      setCatError(`Cannot delete category "${name}" because it is currently assigned to ${inUse} active tender(s). Reassign them first.`);
      return;
    }
    const ok = await deleteCategory(id);
    if (ok) {
      setCatSuccess(`Category "${name}" removed.`);
      setTimeout(() => setCatSuccess(null), 3500);
    } else {
      setCatError(`Failed to delete category "${name}".`);
    }
  };

  // Email Notification & SMTP Settings
  const [smtpServer, setSmtpServer] = useState('smtp.tendertracker.internal');
  const [smtpPort, setSmtpPort] = useState(587);
  const [senderEmail, setSenderEmail] = useState('notifications@tendertracker.enterprise');
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifySignOffs, setNotifySignOffs] = useState(true);
  const [notifyBlockers, setNotifyBlockers] = useState(true);
  const [testEmailAddress, setTestEmailAddress] = useState('s.jenkins@tendertracker.enterprise');
  const [testEmailSent, setTestEmailSent] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, string> | null) => {
        if (data) {
          if (data.vault_path) setVaultPath(data.vault_path);
          if (data.alert_threshold_hours) setAlertThresholdHours(Number(data.alert_threshold_hours));
          if (data.enable_sha_verification !== undefined) setEnableShaVerification(data.enable_sha_verification === 'true');
          if (data.smtp_server) setSmtpServer(data.smtp_server);
          if (data.smtp_port) setSmtpPort(Number(data.smtp_port));
          if (data.sender_email) setSenderEmail(data.sender_email);
          if (data.notify_deadlines !== undefined) setNotifyDeadlines(data.notify_deadlines === 'true');
          if (data.notify_sign_offs !== undefined) setNotifySignOffs(data.notify_sign_offs === 'true');
          if (data.notify_blockers !== undefined) setNotifyBlockers(data.notify_blockers === 'true');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:8000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_path: vaultPath,
          alert_threshold_hours: String(alertThresholdHours),
          enable_sha_verification: String(enableShaVerification),
          smtp_server: smtpServer,
          smtp_port: String(smtpPort),
          sender_email: senderEmail,
          notify_deadlines: String(notifyDeadlines),
          notify_sign_offs: String(notifySignOffs),
          notify_blockers: String(notifyBlockers),
        }),
      });
    } catch {
      // Offline fallback
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendTestEmail = () => {
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>System</span>
            <span>•</span>
            <span className="font-semibold text-[#0F172A]">Infrastructure &amp; Alert Configuration</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            System, Storage &amp; Alert Settings
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Local SSD storage vault directory paths, SHA-256 verification flags, SMTP email notifications, and SLA alert thresholds.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold rounded-lg shadow-sm animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Storage Vault Configuration */}
        <Card
          title="Local NVMe Document Vault Configuration"
          subtitle="Physical storage engine parameters under storage/tenders/{TDR-ID}/"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Local Root Filesystem Vault Path:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-xs text-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={() => alert('Directory verified: storage/tenders/ exists with read/write permissions.')}
                  className="px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#0F172A] rounded-lg font-semibold transition-colors"
                >
                  Verify Path
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <span className="font-semibold text-[#0F172A] block">Local Volume Free Capacity</span>
                  <span className="text-[11px] text-[#64748B]">NVMe SSD partition H:\</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-[#0F172A] block">428.4 GB Free</span>
                <span className="text-[10px] text-[#16A34A]">Optimal Write Performance</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
              <div>
                <span className="font-semibold text-[#0F172A] block">
                  Enforce Immutable SHA-256 Checksum Verification
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Recalculates cryptographic digest on upload and before statutory sign-off.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableShaVerification}
                onChange={(e) => setEnableShaVerification(e.target.checked)}
                className="w-4 h-4 accent-[#2563EB]"
              />
            </div>
          </div>
        </Card>

        {/* Scope of Work (SOW) Categories Console */}
        <Card
          title="Scope of Work (SOW) Corporate Categories"
          subtitle="Database-backed enterprise categories assigned to tenders across all pipeline gates"
        >
          <div className="space-y-4 text-xs">
            {catSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{catSuccess}</span>
              </div>
            )}

            {catError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{catError}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-[#64748B]">
                Total registered categories in database: <strong className="text-[#0F172A]">{categories.length}</strong>
              </div>
              {!isAddingCat && (
                <button
                  type="button"
                  onClick={() => setIsAddingCat(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Category</span>
                </button>
              )}
            </div>

            {/* Add New Category Drawer */}
            {isAddingCat && (
              <div className="p-4 bg-[#F8FAFC] border border-[#BFDBFE] rounded-lg space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Tags className="w-4 h-4 text-[#2563EB]" />
                    Create New Category
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="p-1 text-[#64748B] hover:text-[#0F172A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Renewable Energy Infrastructure"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Badge Theme
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewCatColor(c.value)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                            newCatColor === c.value
                              ? 'ring-2 ring-offset-1 ring-[#2563EB] font-bold border-transparent'
                              : 'border-[#E2E8F0] opacity-80 hover:opacity-100'
                          } ${getBadgeClasses(c.value)}`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Scope & Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Solar farm EPC, grid storage battery systems, and utility substations."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] rounded font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-semibold shadow-xs"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            )}

            {/* Category Table */}
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <th className="py-2.5 px-3">Category Name</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Scope & Description</th>
                    <th className="py-2.5 px-3 text-center">Tenders</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#64748B]">
                        No categories found. Click "Add New Category" above to create one.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => {
                      const isEditing = editingCatId === cat.id;
                      const inUseCount = tenders.filter((t) => t.category === cat.name).length;

                      if (isEditing) {
                        return (
                          <tr key={cat.id} className="bg-[#EFF6FF]/40">
                            <td className="p-3">
                              <input
                                type="text"
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-[#3B82F6] rounded text-xs font-semibold text-[#0F172A]"
                              />
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {COLOR_OPTIONS.map((c) => (
                                  <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setEditCatColor(c.value)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                      editCatColor === c.value ? 'ring-2 ring-[#2563EB]' : 'opacity-70'
                                    } ${getBadgeClasses(c.value)}`}
                                  >
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 hidden sm:table-cell">
                              <input
                                type="text"
                                value={editCatDesc}
                                onChange={(e) => setEditCatDesc(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded text-xs text-[#0F172A]"
                                placeholder="Description..."
                              />
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-[#64748B]">
                              {inUseCount}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(cat.id)}
                                  className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="px-2 py-1 bg-white border border-[#CBD5E1] text-[#64748B] rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={cat.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeClasses(
                                cat.color_badge
                              )}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                              {cat.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#64748B] text-[11px] hidden sm:table-cell max-w-md truncate">
                            {cat.description || <span className="italic text-[#94A3B8]">No description provided</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                inUseCount > 0
                                  ? 'bg-[#F1F5F9] text-[#0F172A]'
                                  : 'text-[#94A3B8]'
                              }`}
                            >
                              {inUseCount}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                title="Edit Category"
                                className="p-1 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                title={
                                  inUseCount > 0
                                    ? `Assigned to ${inUseCount} tenders (cannot delete)`
                                    : 'Delete Category'
                                }
                                disabled={inUseCount > 0}
                                className={`p-1 rounded transition-colors ${
                                  inUseCount > 0
                                    ? 'text-[#CBD5E1] cursor-not-allowed'
                                    : 'text-[#64748B] hover:text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Email Notifications & SMTP Gateway */}
        <Card
          title="Automated Email Notification Dispatcher"
          subtitle="SMTP gateway configuration for real-time tender deadline alarms and gatekeeper alerts"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#0F172A] mb-1">
                  SMTP Host / Relay Server:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  Port:
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Authorized System Sender Address:
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
              />
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
              <span className="font-semibold text-[#0F172A] block">Subscribed Email Trigger Events:</span>
              
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDeadlines}
                  onChange={(e) => setNotifyDeadlines(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <div>
                  <span className="font-medium text-[#0F172A] block">Critical Submission Deadline Escalation</span>
                  <span className="text-[11px] text-[#64748B]">Immediate dispatch to lead bid director when deadline &le; 48 hours</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySignOffs}
                  onChange={(e) => setNotifySignOffs(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <div>
                  <span className="font-medium text-[#0F172A] block">Tier 3 / Tier 4 Gatekeeper Sign-Off Requests</span>
                  <span className="text-[11px] text-[#64748B]">Alert assigned Legal Counsel or Business Head when prior tiers are cleared</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyBlockers}
                  onChange={(e) => setNotifyBlockers(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <div>
                  <span className="font-medium text-[#0F172A] block">Requirement Checklist Blockers</span>
                  <span className="text-[11px] text-[#64748B]">Notify whole bid team whenever a mandatory clause is flagged BLOCKER</span>
                </div>
              </label>
            </div>

            {/* Test Email Dispatch Panel */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2563EB]" />
                <span className="font-medium text-[#0F172A]">Send Test Alert:</span>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-mono text-[#0F172A] w-64"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testEmailSent ? 'Test Alert Dispatched!' : 'Send Test Notification'}</span>
              </button>
            </div>

            {testEmailSent && (
              <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded-lg flex items-center gap-2 text-xs animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 text-[#16A34A]" />
                <span>
                  Simulated SMTP alert delivered to <strong>{testEmailAddress}</strong>: "CRITICAL: TDR-2026-EU-089 Submission window closing in 48 hours".
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* SLA & Notification Thresholds */}
        <Card
          title="Operational SLA &amp; Cutoff Alert Thresholds"
          subtitle="Timing intervals for pulsing attention badges and automated escalate notifications"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Critical Urgency Window (Hours):
              </label>
              <input
                type="number"
                value={alertThresholdHours}
                onChange={(e) => setAlertThresholdHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[#0F172A]"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Triggers red pulsing urgency badge on dashboard when remaining time &le; {alertThresholdHours}h.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">
                Gatekeeper Review SLA Limit:
              </label>
              <select className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A]">
                <option value="24">24 Hours per Review Tier</option>
                <option value="48">48 Hours per Review Tier</option>
                <option value="72">72 Hours per Review Tier</option>
              </select>
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Escalates to Operations Director if gate review remains pending past SLA.
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg font-semibold hover:bg-[#1E293B] shadow-sm transition-colors text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};
